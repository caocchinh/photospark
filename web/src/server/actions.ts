"use server";

import {db} from "@/drizzle/db";
import {isValidUUID} from "@/lib/utils";

export async function getProcessedImage(id: string) {
  if (!id || !isValidUUID(id)) {
    return {error: true};
  }
  const image = await db.query.ProcessedImageTable.findFirst({
    where: (image, {eq}) => eq(image.id, id),
  });
  return {error: false, data: image};
}

export async function getVideo(id: string) {
  if (!id || !isValidUUID(id)) {
    return {error: true};
  }
  const video = await db.query.VideoTable.findFirst({
    where: (video, {eq}) => eq(video.proccessedImageId, id),
  });
  return {error: false, data: video};
}

export async function getImage(id: string) {
  if (!id || !isValidUUID(id)) {
    return {error: true};
  }
  const images = await db.query.ImageTable.findMany({
    where: (image, {eq}) => eq(image.proccessedImageId, id),
  });
  return {error: false, data: images};
}
