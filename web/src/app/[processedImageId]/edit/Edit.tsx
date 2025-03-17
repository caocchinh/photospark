"use client";
import {ProcessedImageTable, ImageTable} from "@/drizzle/schema";

const Edit = ({
  processedImage,
  images,
}: {
  processedImage?: typeof ProcessedImageTable.$inferSelect;
  images?: Array<typeof ImageTable.$inferSelect>;
}) => {
  return (
    <div>
      {processedImage?.id} {images?.length}
    </div>
  );
};

export default Edit;
