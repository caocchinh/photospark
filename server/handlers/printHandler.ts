import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { Socket } from "socket.io";
import {
  currentTime,
  updatePrinterRegistry,
  getCP1500Printer,
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
  console.log(message.quantity);
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

  const printerName = await getCP1500Printer();
  if (!printerName) {
    const error = new Error("Printer not found");
    logger.error("Printer not found", {
      jobId: printJobId,
      error: "PRINTER_NOT_FOUND",
      message: "Unable to locate printer. Please check if it's connected.",
    });
    return;
  }

  logger.info("Printer found", { jobId: printJobId, printer: printerName });

  try {
    await updatePrinterRegistry(printerName);
    logger.info("Printer registry updates successfully", {
      jobId: printJobId,
    });
  } catch (error) {
    logger.error("Printer registry error", {
      jobId: printJobId,
      error: "PRINTER_REGISTRY_ERROR",
      message: "Failed to update printer registry.",
    });
    return;
  }

  const scriptPath = path.join(process.cwd(), "powershell", "print-image.ps1");
  const command = `powershell -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "${scriptPath}" -imagePath "${filePath}" -printer "${printerName}" -copies ${message.quantity}`;

  logger.debug("Executing print command", { jobId: printJobId, command });

  await new Promise((resolve) => {
    exec(command, { shell: "powershell.exe" }, (error, stdout, stderr) => {
      if (error || stderr) {
        logger.error("PowerShell command failed", {
          jobId: printJobId,
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

      logger.info("Print job completed", { jobId: printJobId });

      resolve(void 0);
    });
  });
};
