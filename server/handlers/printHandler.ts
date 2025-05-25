import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { Socket } from "socket.io";
import {
  currentTime,
  updatePrinterRegistry,
  getAllCP1500Printers,
  logger,
  getProjectPath,
} from "../utils";

export interface PrintMessage {
  quantity: number;
  dataURL: string;
  theme: string;
}

export const handlePrint = async (
  socket: Socket,
  message: PrintMessage,
  callback: (response: { success: boolean; message: string }) => void
) => {
  const printJobId = `print-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  logger.info("Print job received", {
    jobId: printJobId,
    socketId: socket.id,
    theme: message.theme,
    quantity: message.quantity,
  });

  if (!message.dataURL || !message.theme || message.quantity < 1) {
    logger.error("Invalid print request parameters", {
      jobId: printJobId,
      error: "INVALID_REQUEST_PARAMETERS",
      message: "Invalid print request parameters",
    });
    callback({ success: false, message: "Invalid print request parameters" });
    return;
  }

  callback({ success: true, message: "Print job submitted" });

  const themePath = getProjectPath("images", message.theme);
  if (!fs.existsSync(themePath)) {
    fs.mkdirSync(themePath, { recursive: true });
    logger.info("Theme directory created", {
      jobId: printJobId,
      path: themePath,
    });
  }

  const filePath = path.join(themePath, `${currentTime()}.jpeg`);
  const [, base64Data] = message.dataURL.split(",");
  if (!base64Data) {
    logger.error("Invalid image data", {
      jobId: printJobId,
      error: "INVALID_IMAGE_DATA",
      message: "Invalid image data",
    });
    return;
  }

  await fs.promises.writeFile(filePath, Buffer.from(base64Data, "base64"));
  logger.info("Image file saved", { jobId: printJobId, path: filePath });

  try {
    // Get all available printers of the CP1500 model
    const printerNames = await getAllCP1500Printers();
    if (printerNames.length === 0) {
      logger.error("Printer not found", {
        jobId: printJobId,
        error: "PRINTER_NOT_FOUND",
        message:
          "Unable to locate any printer. Please check if they're connected.",
      });
      return;
    }

    logger.info("Printers found", {
      jobId: printJobId,
      printers: printerNames,
      count: printerNames.length,
    });

    // Distribute copies among printers
    const baseCopies = Math.floor(message.quantity / printerNames.length);
    const remainder = message.quantity % printerNames.length;

    logger.info("Distributing print job", {
      jobId: printJobId,
      totalCopies: message.quantity,
      printerCount: printerNames.length,
      baseCopies,
      remainder,
    });

    // Update registry for all printers
    for (const printerName of printerNames) {
      try {
        await updatePrinterRegistry(printerName);
        logger.info("Printer registry updated successfully", {
          jobId: printJobId,
          printer: printerName,
        });
      } catch (error) {
        logger.error("Printer registry error", {
          jobId: printJobId,
          printer: printerName,
          error: "PRINTER_REGISTRY_ERROR",
          message: "Failed to update printer registry.",
        });
        // Continue with other printers if one fails
      }
    }

    const scriptPath = path.join(
      process.cwd(),
      "powershell",
      "print-image.ps1"
    );

    // Execute print jobs for each printer
    const printPromises = printerNames.map(async (printerName, index) => {
      // Calculate copies for this printer
      const copies = index < remainder ? baseCopies + 1 : baseCopies;

      // Skip if no copies assigned to this printer
      if (copies <= 0) return;

      const command = `powershell -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "${scriptPath}" -imagePath "${filePath}" -printer "${printerName}" -copies ${copies}`;

      logger.debug("Executing print command", {
        jobId: printJobId,
        printer: printerName,
        copies,
        command,
      });

      return new Promise((resolve) => {
        exec(command, { shell: "powershell.exe" }, (error, stdout, stderr) => {
          if (error || stderr) {
            logger.error("PowerShell command failed", {
              jobId: printJobId,
              printer: printerName,
              error: error?.message || stderr,
              code: error?.code,
              stdout,
              stderr,
              errorType: stderr.includes("The handle is invalid")
                ? "INVALID_PRINTER_HANDLE"
                : "GENERAL_ERROR",
            });
            resolve(void 0);
            return;
          }

          logger.info("Print job completed", {
            jobId: printJobId,
            printer: printerName,
            copies,
          });

          resolve(void 0);
        });
      });
    });

    await Promise.all(printPromises);
    logger.info("All print jobs completed", {
      jobId: printJobId,
      totalCopies: message.quantity,
    });
  } catch (error) {
    logger.error("Print error", {
      jobId: printJobId,
      error: "PRINT_ERROR",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};
