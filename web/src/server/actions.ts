"use server";

import {cache} from "react";
import {db} from "@/drizzle/db";
import {isValidUUID} from "@/lib/utils";
import {ImageTable, ProcessedImageTable, QueueTable, VideoTable} from "@/drizzle/schema";
import {MAX_PRINT_QUANTITY} from "@/constants/constants";
import {eq, InferInsertModel} from "drizzle-orm";
import {ValidFrameType, ValidThemeType} from "@/constants/types";

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

export const getImages = cache(async (processedImageId: string) => {
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

export const createProcessedImage = async (
  id: string,
  theme: ValidThemeType,
  frameURL: string,
  type: ValidFrameType,
  slotCount: number,
  filter: string,
  previousProcessedImageCreationDate?: Date
): Promise<{error: boolean}> => {
  if (!id || !isValidUUID(id)) {
    return {error: true};
  }

  if (!theme || !type) {
    return {error: true};
  }

  if (!frameURL) {
    return {error: true};
  }

  if (typeof slotCount !== "number" || slotCount <= 0) {
    return {error: true};
  }

  const insertData: InferInsertModel<typeof ProcessedImageTable> = {id, theme, frameURL, type, slotCount, filter};

  if (previousProcessedImageCreationDate) {
    insertData.createdAt = previousProcessedImageCreationDate;
  }

  try {
    await db.insert(ProcessedImageTable).values(insertData);
    return {error: false};
  } catch (error) {
    console.error("Failed to create image:", error);
    return {error: true};
  }
};

export const createImage = async (
  href: string,
  processedImageId: string,
  slotPositionX: number | null,
  slotPositionY: number | null,
  height: number,
  width: number
): Promise<{error: boolean}> => {
  if (!processedImageId || !isValidUUID(processedImageId)) {
    return {error: true};
  }
  if (height == undefined || width == undefined) {
    return {error: true};
  }

  if (height < 0 || width < 0) {
    return {error: true};
  }

  if (typeof height !== "number" || typeof width !== "number") {
    return {error: true};
  }

  try {
    const values: InferInsertModel<typeof ImageTable> = {
      url: href,
      proccessedImageId: processedImageId,
      height: height,
      width: width,
    };

    if (slotPositionX !== null) {
      values.slotPositionX = slotPositionX;
    }

    if (slotPositionY !== null) {
      values.slotPositionY = slotPositionY;
    }

    await db.insert(ImageTable).values(values);
    return {error: false};
  } catch (error) {
    console.error("Failed to create image:", error);
    return {error: true};
  }
};

export const createVideo = async (href: string, processedImageId: string): Promise<{error: boolean}> => {
  if (!href) {
    return {error: true};
  }

  if (!processedImageId || !isValidUUID(processedImageId)) {
    return {error: true};
  }

  try {
    await db.insert(VideoTable).values({url: href, proccessedImageId: processedImageId});
    return {error: false};
  } catch (error) {
    console.error("Failed to create video:", error);
    return {error: true};
  }
};
