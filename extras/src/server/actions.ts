"use server ";

import {db} from "@/drizzle/db";
import {QueueTable} from "@/drizzle/schema";
import {eq} from "drizzle-orm";

export async function getQueueStatus(queueId: string) {
  const queue = await db.query.QueueTable.findFirst({
    where: eq(QueueTable.id, queueId),
  });
  return queue;
}
