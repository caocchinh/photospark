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
  filter: text("filter").default("Original"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const QueueTable = pgTable("queue", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  quantity: integer("quantity").notNull(),
  status: QueueStatus("status").default("pending").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  price: real("price").notNull(),
  processedImageId: uuid("processedImageId")
    .notNull()
    .references(() => ProcessedImageTable.id, {onDelete: "cascade"}),
});

export const ImageTable = pgTable("images", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  url: text("url").notNull(),
  slotPositionX: real("slotPositionX"),
  slotPositionY: real("slotPositionY"),
  height: real("height").notNull(),
  width: real("width").notNull(),
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
  processedImage: one(ProcessedImageTable, {
    fields: [ImageTable.proccessedImageId],
    references: [ProcessedImageTable.id],
  }),
}));

export const ProcessedImageRelation = relations(ProcessedImageTable, ({many, one}) => ({
  images: many(ImageTable),
  video: one(VideoTable),
  queue: many(QueueTable),
}));

export const VideoRelation = relations(VideoTable, ({one}) => ({
  processedImage: one(ProcessedImageTable, {
    fields: [VideoTable.proccessedImageId],
    references: [ProcessedImageTable.id],
  }),
}));

export const QueueRelation = relations(QueueTable, ({one}) => ({
  processedImage: one(ProcessedImageTable, {
    fields: [QueueTable.processedImageId],
    references: [ProcessedImageTable.id],
  }),
}));
