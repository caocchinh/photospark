"use server";

import {db} from "@/drizzle/db";

export async function getProcessedImage(id: string) {
  const image = await db.query.ProcessedImageTable.findFirst({
    where: (image, {eq}) => eq(image.id, id),
  });
  return image;
}

export async function getVideo(id: string) {
  const video = await db.query.VideoTable.findFirst({
    where: (video, {eq}) => eq(video.proccessedImageId, id),
  });
  return video;
}

export async function getImage(id: string) {
  const images = await db.query.ImageTable.findMany({
    where: (image, {eq}) => eq(image.proccessedImageId, id),
  });
  return images;
}
