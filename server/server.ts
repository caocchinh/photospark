import {Server} from "socket.io";
import path from "path";
import fs from "fs";
import {currentTime, updatePrinterRegistry, getCP1500Printer, logger, logFailedFileUpload} from "./utils";
import {exec} from "child_process";
import {Blob} from "buffer";
import {S3Client, PutObjectCommand} from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, {recursive: true});
}

const io = new Server(6969, {
  cors: {
    origin: ["http://localhost:8080", "http://localhost:5050"],
  },
  maxHttpBufferSize: Infinity,
});

const CLOUDFARE_ACCOUNT_ID = process.env.CLOUDFARE_ACCOUNT_ID as string;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID as string;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY as string;

const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${CLOUDFARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

io.on("connection", (socket) => {
  logger.info("Client connected", {
    socketId: socket.id,
  });
  socket.on("print", async (message: {quantity: number; dataURL: string; theme: string}, callback) => {
    const printJobId = `print-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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
      callback({success: false, message: "Invalid print request parameters"});
      return;
    }

    callback({success: true, message: "Print job submitted"});

    const themePath = path.join(process.cwd(), "images", message.theme);
    if (!fs.existsSync(themePath)) {
      fs.mkdirSync(themePath, {recursive: true});
      logger.info("Theme directory created", {jobId: printJobId, path: themePath});
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
    logger.info("Image file saved", {jobId: printJobId, path: filePath});

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

    logger.info("Printer found", {jobId: printJobId, printer: printerName});

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

    logger.debug("Executing print command", {jobId: printJobId, command});

    await new Promise((resolve) => {
      exec(command, {shell: "powershell.exe"}, (error, stdout, stderr) => {
        if (error || stderr) {
          logger.error("PowerShell command failed", {
            jobId: printJobId,
            error: error?.message || stderr,
            code: error?.code,
            stdout,
            stderr,
            errorType: stderr.includes("The handle is invalid") ? "INVALID_PRINTER_HANDLE" : "GENERAL_ERROR",
          });
          resolve(void 0);
          return;
        }

        logger.info("Print job completed", {jobId: printJobId});

        resolve(void 0);
      });
    });
  });

  socket.on("process-video", async (message: {dataURL: Blob; id: string}, callback) => {
    const videoJobId = `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    logger.info("Video processing job received", {
      jobId: videoJobId,
      socketId: socket.id,
    });

    try {
      const rawVideosDir = path.join(process.cwd(), "videos/raw");
      const rawFilePath = path.join(rawVideosDir, `${currentTime()}.webm`);
      const processedVideosDir = path.join(process.cwd(), "videos/processed");
      const processedFilePath = path.join(processedVideosDir, `${currentTime()}.mp4`);
      if (!fs.existsSync(rawVideosDir)) {
        fs.mkdirSync(rawVideosDir, {recursive: true});
      }
      if (!fs.existsSync(processedVideosDir)) {
        fs.mkdirSync(processedVideosDir, {recursive: true});
      }

      const buffer = Buffer.from(message.dataURL as unknown as ArrayBuffer);
      await fs.promises.writeFile(rawFilePath, buffer);

      logger.info("Raw video file saved", {
        jobId: videoJobId,
        path: rawFilePath,
      });

      const scriptPath = path.join(process.cwd(), "powershell", "process-video.ps1");
      const command = `powershell -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "${scriptPath}" -inputVideo "${rawFilePath}" -outputVideo "${processedFilePath}"`;

      logger.debug("Executing video processing command", {jobId: videoJobId, command});

      await new Promise((resolve) => {
        exec(command, {shell: "powershell.exe"}, (error, stdout, stderr) => {
          if (error) {
            logger.error("Video processing failed", {
              jobId: videoJobId,
              error: error.message,
              code: error.code,
              stdout,
              stderr,
            });
            resolve(void 0);
          }

          if (stdout.includes("SUCCESS:")) {
            logger.info("Video processing completed", {
              jobId: videoJobId,
              output: processedFilePath,
            });
            resolve(void 0);
          } else {
            logger.error("Video processing failed", {
              jobId: videoJobId,
              stdout,
              stderr,
            });
            resolve(void 0);
          }
        });
      });

      if (!fs.existsSync(processedVideosDir)) {
        fs.mkdirSync(processedVideosDir, {recursive: true});
      }

      const fileName = `${currentTime()}.mp4`;

      try {
        const fileBuffer = await fs.promises.readFile(processedFilePath);
        const uploadCommand = new PutObjectCommand({
          Bucket: "vcp-photobooth",
          Key: fileName,
          Body: fileBuffer,
          ContentType: "video/mp4",
          ContentLength: fileBuffer.length,
        });

        await R2.send(uploadCommand);

        const publicUrl = `https://pub-2abc3784ea3543ba9804f812db4aa180.r2.dev/${fileName}`;

        logger.info("Video uploaded to R2", {
          jobId: videoJobId,
          fileName,
          url: publicUrl,
        });

        callback({
          success: true,
          r2_url: publicUrl,
        });
      } catch (error) {
        logger.error("R2 upload failed", {
          jobId: videoJobId,
          error: error instanceof Error ? error.message : "Unknown error",
          id: message.id,
        });

        logFailedFileUpload(message.id, processedFilePath, error instanceof Error ? error.message : "Unknown error");

        callback({
          success: false,
          r2_url: "",
        });
      }
    } catch (error) {
      logger.error("Video processing failed", {
        jobId: videoJobId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      callback({
        success: false,
        r2_url: "",
      });
    }
  });

  socket.on("disconnect", () => {
    logger.info("Client disconnected", {socketId: socket.id});
  });

  socket.on("upload-video-error", (message: {url: string; id: string}) => {
    logger.error("Video upload failed", {
      jobId: message.id,
      url: message.url,
    });

    logFailedFileUpload(message.id, message.url);
  });

  socket.on("upload-image-error", (message: {url: string; id: string}) => {
    logger.error("Image upload failed", {
      jobId: message.id,
      url: message.url,
    });
    logFailedFileUpload(message.id, message.url);
  });
});
