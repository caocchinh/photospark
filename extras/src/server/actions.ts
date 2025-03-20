"use server";

import {db} from "@/drizzle/db";

export async function getAllQueues() {
  const queues = await db.query.QueueTable.findMany();
  console.log(queues);
  return queues;
}
