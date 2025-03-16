"use client";
import {ProcessedImageTable, ImageTable} from "@/drizzle/schema";

const Print = ({
  processedImage,
  images,
}: {
  processedImage?: typeof ProcessedImageTable.$inferSelect;
  images?: Array<typeof ImageTable.$inferSelect>;
}) => {
  return (
    <div>
      {processedImage?.id} {images?.length}
      {processedImage?.slotCount}
    </div>
  );
};

export default Print;
