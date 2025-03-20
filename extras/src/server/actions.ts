"use server";

import {db} from "@/drizzle/db";

export async function getAllQueues() {
  const queues = await db.query.QueueTable.findMany();
  return queues;
}

export async function getProcessedImage(processedImageId: string) {
  const image = await db.query.ProcessedImageTable.findFirst({
    where: (image, {eq}) => eq(image.id, processedImageId),
  });
  console.log(image);
  return image;
}

export async function getImages(processedImageId: string) {
  const images = await db.query.ImageTable.findMany({
    where: (image, {eq}) => eq(image.proccessedImageId, processedImageId),
  });
  console.log(images);
  return images;
}
