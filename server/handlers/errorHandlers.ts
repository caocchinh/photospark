import {logger, logFailedFileUpload} from "../utils";

export interface VideoErrorMessage {
  url: string;
  proccessedImageId: string;
}

export interface ImageErrorMessage {
  url: string;
  proccessedImageId: string;
  width: number;
  height: number;
  slotPositionX: number;
  slotPositionY: number;
}

export const handleVideoUploadError = (message: VideoErrorMessage) => {
  logger.error("Video upload failed", {
    jobId: message.proccessedImageId,
    url: message.url,
  });

  logFailedFileUpload(message.proccessedImageId, message.url, "Type: video");
};

export const handleImageUploadError = (message: ImageErrorMessage) => {
  logger.error("Image upload failed", {
    jobId: message.proccessedImageId,
    url: message.url,
    width: message.width,
    height: message.height,
    slotPositionX: message.slotPositionX,
    slotPositionY: message.slotPositionY,
  });

  const details = `Type: image, Width: ${message.width}, Height: ${message.height}, X: ${message.slotPositionX}, Y: ${message.slotPositionY}`;
  logFailedFileUpload(message.proccessedImageId, message.url, details);
};
