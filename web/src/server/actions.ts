"use server";

import {cache} from "react";
import {db} from "@/drizzle/db";
import {isValidUUID} from "@/lib/utils";

export const getProcessedImage = cache(async (id: string) => {
  if (!id || !isValidUUID(id)) {
    return {error: true};
  }
  const image = await db.query.ProcessedImageTable.findFirst({
    where: (image, {eq}) => eq(image.id, id),
  });
  return {error: false, data: image};
});

export const getVideo = cache(async (id: string) => {
  if (!id || !isValidUUID(id)) {
    return {error: true};
  }
  const video = await db.query.VideoTable.findFirst({
    where: (video, {eq}) => eq(video.proccessedImageId, id),
  });
  if (!video) {
    return {error: true};
  }
  return {error: false, data: video};
});

export const getImage = cache(async (id: string) => {
  if (!id || !isValidUUID(id)) {
    return {error: true};
  }
  const images = await db.query.ImageTable.findMany({
    where: (image, {eq}) => eq(image.proccessedImageId, id),
  });

  return {error: false, data: images};
});
