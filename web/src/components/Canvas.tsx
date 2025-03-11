"use client";
import {ProcessedImageTable, ImageTable, VideoTable} from "@/drizzle/schema";
import {IMAGE_WIDTH, IMAGE_HEIGHT, OFFSET_X, OFFSET_Y, FRAME_WIDTH, FRAME_HEIGHT, FrameOptions} from "@/constants/constants";
import {useRef} from "react";
import {Stage as StageElement} from "konva/lib/Stage";
import {Image as KonvaImage} from "react-konva";
import {Layer, Stage} from "react-konva";
import useImage from "use-image";
import CanvasImage from "@/app/CanvasImage";
import {generateTimestampFilename} from "@/lib/utils";
import {Button} from "./ui/button";
import Link from "next/link";

const Canvas = ({
  processedImage,
  images,
  video,
}: {
  processedImage?: typeof ProcessedImageTable.$inferSelect;
  images?: Array<typeof ImageTable.$inferSelect>;
  video?: typeof VideoTable.$inferSelect;
}) => {
  const stageRef = useRef<StageElement | null>(null);
  const [frameImg] = useImage(processedImage?.frameURL || "", "anonymous");

  if (!processedImage) {
    return null;
  }

  const downloadImage = () => {
    if (!stageRef.current) return;

    try {
      const dataURL = stageRef.current.toDataURL({
        pixelRatio: 2,
        mimeType: "image/png",
      });

      const link = document.createElement("a");
      link.download = generateTimestampFilename("VTEAM", "png");
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Could not export the image. This may be due to CORS restrictions on some image sources.");
    }
  };

  const downloadVideo = () => {
    if (!video?.url) return;

    const link = document.createElement("a");
    link.href = video.url;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Stage
        ref={stageRef}
        width={IMAGE_WIDTH}
        height={IMAGE_HEIGHT}
      >
        {Array.from({length: processedImage.type == "singular" ? 1 : 2}, (_, _index) => (
          <Layer
            key={_index}
            x={OFFSET_X}
            y={OFFSET_Y}
          >
            {images?.map(({id, url, slotPosition}) => {
              return (
                url &&
                slotPosition != -1 && (
                  <CanvasImage
                    key={id}
                    url={url}
                    y={FrameOptions[processedImage.theme].slotPositions[slotPosition!].y}
                    x={FrameOptions[processedImage.theme].slotPositions[slotPosition!].x + (FRAME_WIDTH / 2) * _index}
                    height={FrameOptions[processedImage.theme].slotDimensions.height}
                    width={FrameOptions[processedImage.theme].slotDimensions.width}
                    filter={processedImage.filter!}
                    crossOrigin="anonymous"
                  />
                )
              );
            })}
          </Layer>
        ))}

        {Array.from({length: processedImage.type == "singular" ? 1 : 2}, (_, index) => (
          <Layer
            key={index}
            x={OFFSET_X}
            y={OFFSET_Y}
          >
            <KonvaImage
              image={frameImg}
              x={(FRAME_WIDTH / 2) * index}
              height={FRAME_HEIGHT}
              width={FRAME_WIDTH / (processedImage.type == "singular" ? 1 : 2)}
            />
          </Layer>
        ))}
      </Stage>

      <div className="flex justify-center gap-5 flex-col">
        <Button
          className="w-[280px] h-[50px] text-white cursor-pointer text-xl"
          onClick={downloadImage}
        >
          Download ảnh
        </Button>

        {video?.url && (
          <Button
            className="w-[280px] h-[50px] text-white cursor-pointer text-xl"
            onClick={downloadVideo}
          >
            Download video
          </Button>
        )}
        <Button className="w-[280px] h-[50px] text-white cursor-pointer text-xl bg-[#f97316] hover:opacity-90 hover:bg-[#f97316]">
          <Link href={`/${processedImage.id}/edit`}>Sửa ảnh/In thêm</Link>
        </Button>
      </div>
    </>
  );
};
export default Canvas;
