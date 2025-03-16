"use client";
import FrameStage from "@/components/FrameStage";
import {ProcessedImageTable, ImageTable} from "@/drizzle/schema";
import {useRef} from "react";
import {Stage as StageElement} from "konva/lib/Stage";

const Print = ({
  processedImage,
  images,
}: {
  processedImage?: typeof ProcessedImageTable.$inferSelect;
  images?: Array<typeof ImageTable.$inferSelect>;
}) => {
  const stageRef = useRef<StageElement | null>(null);

  if (!processedImage) {
    return null;
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <FrameStage
        processedImage={processedImage}
        images={images}
        stageRef={stageRef}
      />
    </div>
  );
};

export default Print;
