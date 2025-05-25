"use server";

import { ValidFrameType, ValidThemeType } from "@/constants/types";
import { db } from "@/drizzle/db";
import { ImageTable, ProcessedImageTable, VideoTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { InferInsertModel } from "drizzle-orm";

const isValidUUID = (id: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const createProcessedImage = async (
  id: string,
  theme: ValidThemeType,
  frameURL: string,
  type: ValidFrameType,
  slotCount: number
): Promise<{ error: boolean }> => {
  if (!id || !isValidUUID(id)) {
    return { error: true };
  }

  if (!theme || !type) {
    return { error: true };
  }

  if (!frameURL) {
    return { error: true };
  }

  if (typeof slotCount !== "number" || slotCount <= 0) {
    return { error: true };
  }

  try {
    await db
      .insert(ProcessedImageTable)
      .values({ id, theme, frameURL, type, slotCount });
    return { error: false };
  } catch (error) {
    console.error("Failed to create image:", error);
    return { error: true };
  }
};

export const updateFilter = async (
  processedImageId: string,
  filter: string
): Promise<{ error: boolean }> => {
  if (!processedImageId || !isValidUUID(processedImageId)) {
    return { error: true };
  }

  try {
    await db
      .update(ProcessedImageTable)
      .set({ filter })
      .where(eq(ProcessedImageTable.id, processedImageId));
    return { error: false };
  } catch (error) {
    console.error("Failed to update filter:", error);
    return { error: true };
  }
};

export const createImage = async (
  href: string,
  processedImageId: string,
  slotPositionX: number | null,
  slotPositionY: number | null,
  height: number,
  width: number
): Promise<{ error: boolean }> => {
  if (!processedImageId || !isValidUUID(processedImageId)) {
    return { error: true };
  }
  if (height == undefined || width == undefined) {
    return { error: true };
  }

  if (height < 0 || width < 0) {
    return { error: true };
  }

  if (typeof height !== "number" || typeof width !== "number") {
    return { error: true };
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
    return { error: false };
  } catch (error) {
    console.error("Failed to create image:", error);
    return { error: true };
  }
};

export const createVideo = async (
  href: string,
  processedImageId: string
): Promise<{ error: boolean }> => {
  if (!href) {
    return { error: true };
  }

  if (!processedImageId || !isValidUUID(processedImageId)) {
    return { error: true };
  }

  try {
    await db
      .insert(VideoTable)
      .values({ url: href, proccessedImageId: processedImageId });
    return { error: false };
  } catch (error) {
    console.error("Failed to create video:", error);
    return { error: true };
  }
};
