"use server";

import {cache} from "react";
import {db} from "@/drizzle/db";
import {isValidUUID} from "@/lib/utils";

export const getPhotoResources = cache(async (id: string) => {
  if (!id || !isValidUUID(id)) {
    return {error: true};
  }

  const [processedImage, images, video] = await Promise.all([
    db.query.ProcessedImageTable.findFirst({
      where: (image, {eq}) => eq(image.id, id),
    }),
    db.query.ImageTable.findMany({
      where: (image, {eq}) => eq(image.proccessedImageId, id),
    }),
    db.query.VideoTable.findFirst({
      where: (video, {eq}) => eq(video.proccessedImageId, id),
    }),
  ]);

  if (!processedImage) {
    return {error: true};
  }

  return {
    error: false,
    data: {
      processedImage,
      images,
      video,
    },
  };
});
