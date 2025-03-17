"use server";

import {cache} from "react";
import {db} from "@/drizzle/db";
import {isValidUUID} from "@/lib/utils";
import {QueueTable} from "@/drizzle/schema";
import {MAX_PRINT_QUANTITY} from "@/constants/constants";

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

export const createQueue = async (processedImageId: string, queueId: string, quantity: number) => {
  if (!processedImageId || !isValidUUID(processedImageId)) {
    return {error: true};
  }
  if (quantity < 0 || quantity > MAX_PRINT_QUANTITY) {
    return {error: true};
  }
  if (!queueId || !isValidUUID(queueId)) {
    return {error: true};
  }
  console.log(processedImageId, queueId, quantity);
  try {
    await db.insert(QueueTable).values({
      id: queueId,
      processedImageId: processedImageId,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "pending",
      quantity: quantity,
    });

    return {error: false};
  } catch (error) {
    console.error(error);
    return {error: true};
  }
};
