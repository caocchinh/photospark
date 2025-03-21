"use server";

import {db} from "@/drizzle/db";

export async function getAllQueues() {
  const queues = await db.query.QueueTable.findMany();
  if (!queues) {
    return {error: true};
  }
  return {error: false, response: queues};
}

export async function getProcessedImage(processedImageId: string) {
  const image = await db.query.ProcessedImageTable.findFirst({
    where: (image, {eq}) => eq(image.id, processedImageId),
  });
  if (!image) {
    return {error: true};
  }
  return {error: false, response: image};
}

export async function getImages(processedImageId: string) {
  const images = await db.query.ImageTable.findMany({
    where: (image, {eq}) => eq(image.proccessedImageId, processedImageId),
  });
  if (!images) {
    return {error: true};
  }
  return {error: false, response: images};
}
