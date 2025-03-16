"use client";
import {ProcessedImageTable, ImageTable, VideoTable} from "@/drizzle/schema";

const Edit = ({
  processedImage,
  images,
  video,
}: {
  processedImage?: typeof ProcessedImageTable.$inferSelect;
  images?: Array<typeof ImageTable.$inferSelect>;
  video?: typeof VideoTable.$inferSelect;
}) => {
  return <div>Edit</div>;
};

export default Edit;
