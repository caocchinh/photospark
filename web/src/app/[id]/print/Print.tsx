"use client";
import {ProcessedImageTable, ImageTable, VideoTable} from "@/drizzle/schema";

const Print = ({
  processedImage,
  images,
  video,
}: {
  processedImage?: typeof ProcessedImageTable.$inferSelect;
  images?: Array<typeof ImageTable.$inferSelect>;
  video?: typeof VideoTable.$inferSelect;
}) => {
  return (
    <div>
      {processedImage?.id} {images?.length} {video?.url}
    </div>
  );
};

export default Print;
