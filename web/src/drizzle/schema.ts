import {VALID_THEMES, VALID_FRAME_TYPES} from "@/constants/constants";
import {relations} from "drizzle-orm";
import {pgTable, uuid, text, timestamp, pgEnum, integer, real} from "drizzle-orm/pg-core";

export const Theme = pgEnum("theme", VALID_THEMES);

export const FrameType = pgEnum("frame_type", VALID_FRAME_TYPES);

export const QueueStatus = pgEnum("queueStatus", ["pending", "processing", "completed", "failed"]);

export const ProcessedImageTable = pgTable("processedImage", {
  id: uuid("id").primaryKey().notNull(),
  theme: Theme("theme").notNull(),
  frameURL: text("frameURL").notNull(),
  type: FrameType("type").notNull(),
  slotCount: integer("slotCount").notNull(),
  quantity: integer("quantity"),
  filter: text("filter").default("Original"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  queueId: uuid("queueId").references(() => QueueTable.id, {onDelete: "cascade"}),
});

export const QueueTable = pgTable("queue", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  status: QueueStatus("status").default("pending").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const ImageTable = pgTable("images", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  url: text("url").notNull(),
  slotPositionX: real("slotPositionX"),
  slotPositionY: real("slotPositionY"),
  height: real("height"),
  width: real("width"),
  proccessedImageId: uuid("proccessedImageId")
    .notNull()
    .references(() => ProcessedImageTable.id, {onDelete: "cascade"}),
});

export const VideoTable = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  url: text("url").notNull(),
  proccessedImageId: uuid("proccessedImageId")
    .notNull()
    .references(() => ProcessedImageTable.id, {onDelete: "cascade"}),
});

export const ImageRelation = relations(ImageTable, ({one}) => ({
  frame: one(ProcessedImageTable, {
    fields: [ImageTable.proccessedImageId],
    references: [ProcessedImageTable.id],
  }),
}));

export const ProcessedImageRelation = relations(ProcessedImageTable, ({many, one}) => ({
  images: many(ImageTable),
  video: one(VideoTable),
  queue: one(QueueTable, {
    fields: [ProcessedImageTable.queueId],
    references: [QueueTable.id],
  }),
}));

export const VideoRelation = relations(VideoTable, ({one}) => ({
  frame: one(ProcessedImageTable, {
    fields: [VideoTable.proccessedImageId],
    references: [ProcessedImageTable.id],
  }),
}));

export const QueueRelation = relations(QueueTable, ({many}) => ({
  processedImages: many(ProcessedImageTable),
}));
