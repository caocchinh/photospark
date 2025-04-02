import fs from "fs";
import path from "path";
import {exec} from "child_process";
import {Socket} from "socket.io";
import {currentTime, logger, logFailedFileUpload, getProjectPath} from "../utils";
import {S3Client, PutObjectCommand} from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

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

export interface VideoMessage {
  dataURL: Blob;
  id: string;
}

export const handleProcessVideo = async (socket: Socket, message: VideoMessage, callback: (response: {success: boolean; r2_url: string}) => void) => {
  const videoJobId = `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  logger.info("Video processing job received", {
    jobId: videoJobId,
    socketId: socket.id,
  });

  try {
    const rawVideosDir = getProjectPath("videos/raw");
    const rawFilePath = path.join(rawVideosDir, `${currentTime()}.webm`);
    const processedVideosDir = getProjectPath("videos/processed");
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
        Bucket: process.env.NODE_ENV === "development" ? process.env.R2_PUBLIC_BUCKET_DEVELOPMENT_NAME : process.env.R2_PUBLIC_BUCKET_PRODUCTION_NAME,
        Key: fileName,
        Body: fileBuffer,
        ContentType: "video/mp4",
        ContentLength: fileBuffer.length,
      });

      await R2.send(uploadCommand);

      let publicUrl = "";
      if (process.env.NODE_ENV === "development") {
        publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_BUCKET_DEVELOPMENT_URL + "/" + fileName;
      } else {
        publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_BUCKET_PRODUCTION_URL + "/" + fileName;
      }

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
};
