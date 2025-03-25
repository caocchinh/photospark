import {useCallback, useState} from "react";
import {createImage, createVideo, createProcessedImage} from "@/server/actions";
import {usePhoto} from "@/context/PhotoContext";

export function useImageUpload(newProcessedImageId: string) {
  const {photo} = usePhoto();
  const [isMediaUploaded, setIsMediaUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(false);

  const uploadImageToDatabase = useCallback(async () => {
    if (!photo) return;

    setIsUploading(true);
    try {
      await createProcessedImage(newProcessedImageId, photo.theme!.name, photo.theme!.frame.src, photo.frameType!, photo.theme!.frame.slotCount);
    } catch (error) {
      console.error("Error uploading processed image to database:", error);
      setError(true);
      return;
    }

    for (const image of photo.images) {
      const slotPosition = photo.selectedImages.findIndex((selectedImage) => selectedImage.id == image.id);
      try {
        const imageResponse = await createImage(
          image.href,
          newProcessedImageId,
          slotPosition != -1 ? photo.theme!.frame.slotPositions[slotPosition].x : null,
          slotPosition != -1 ? photo.theme!.frame.slotPositions[slotPosition].y : null,
          photo.theme!.frame.slotDimensions.height,
          photo.theme!.frame.slotDimensions.width
        );

        if (imageResponse.error) {
          throw new Error("Failed to upload image to database");
        } else {
          console.log("Image uploaded to database successfully");
        }
      } catch (error) {
        console.error("Error uploading image to database:", error);
        setError(true);
        return;
      }
    }

    if (photo.video.r2_url) {
      try {
        const videoResponse = await createVideo(photo.video.r2_url, newProcessedImageId);
        if (videoResponse.error) {
          throw new Error("Failed to upload video to database");
        } else {
          console.log("Video uploaded to database successfully");
        }
      } catch (error) {
        console.error("Error uploading video to database:", error);
        setError(true);
        return;
      }
    }

    setIsMediaUploaded(true);
    return true;
  }, [newProcessedImageId, photo]);

  return {
    uploadImageToDatabase,
    isMediaUploaded,
    isUploading,
    error,
  };
}
