"use server";

import {cache} from "react";
import {db} from "@/drizzle/db";
import {isValidUUID} from "@/lib/utils";
import {QueueTable} from "@/drizzle/schema";
import {MAX_PRINT_QUANTITY} from "@/constants/constants";
import {eq} from "drizzle-orm";

export const getProcessedImage = cache(async (processedImageId: string) => {
  if (!processedImageId || !isValidUUID(processedImageId)) {
    return {error: true};
  }
  const image = await db.query.ProcessedImageTable.findFirst({
    where: (image, {eq}) => eq(image.id, processedImageId),
  });
  return {error: false, data: image};
});

export const getVideo = cache(async (processedImageId: string) => {
  if (!processedImageId || !isValidUUID(processedImageId)) {
    return {error: true};
  }
  const video = await db.query.VideoTable.findFirst({
    where: (video, {eq}) => eq(video.proccessedImageId, processedImageId),
  });
  if (!video) {
    return {error: true};
  }
  return {error: false, data: video};
});

export const getImage = cache(async (processedImageId: string) => {
  if (!processedImageId || !isValidUUID(processedImageId)) {
    return {error: true};
  }
  const images = await db.query.ImageTable.findMany({
    where: (image, {eq}) => eq(image.proccessedImageId, processedImageId),
  });

  return {error: false, data: images};
});

export const createQueue = async (processedImageId: string, queueId: string, quantity: number, price: number) => {
  if (!processedImageId || !isValidUUID(processedImageId)) {
    return {error: true};
  }
  if (quantity < 0 || quantity > MAX_PRINT_QUANTITY) {
    return {error: true};
  }
  if (!queueId || !isValidUUID(queueId)) {
    return {error: true};
  }
  try {
    await db.insert(QueueTable).values({
      id: queueId,
      processedImageId: processedImageId,
      createdAt: new Date(),
      status: "pending",
      quantity: quantity,
      price: price,
    });

    return {error: false};
  } catch (error) {
    console.error(error);
    return {error: true};
  }
};

export const getQueue = async (processedImageId: string, queueId: string) => {
  if (!processedImageId || !isValidUUID(processedImageId)) {
    return {error: true};
  }
  if (!queueId || !isValidUUID(queueId)) {
    return {error: true};
  }

  const queue = await db.query.QueueTable.findFirst({
    where: (queue, {eq}) => eq(queue.id, queueId),
  });
  return {error: false, data: queue};
};

export const getQueueStatus = async (queueId: string) => {
  if (!queueId || !isValidUUID(queueId)) {
    return {error: true};
  }

  const queueStatus = await db
    .select({
      status: QueueTable.status,
    })
    .from(QueueTable)
    .where(eq(QueueTable.id, queueId))
    .execute();

  return {error: false, data: queueStatus[0]?.status};
};
