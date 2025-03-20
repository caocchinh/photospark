"use server";

import {db} from "@/drizzle/db";
import {ProcessedImageTable} from "@/drizzle/schema";
import {eq} from "drizzle-orm";

export async function getAllQueues() {
  const queues = await db.query.QueueTable.findMany();
  return queues;
}

export async function getProcessedImage(id: string) {
  const processedImage = await db.query.ProcessedImageTable.findFirst({
    where: eq(ProcessedImageTable.id, id),
  });
  return processedImage;
}
