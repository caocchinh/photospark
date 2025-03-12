"use client";
import {ProcessedImageTable, ImageTable, VideoTable} from "@/drizzle/schema";
import {FRAME_WIDTH, FRAME_HEIGHT, FrameOptions} from "@/constants/constants";
import {useRef, useEffect, useState} from "react";
import {Stage as StageElement} from "konva/lib/Stage";
import {Image as KonvaImage} from "react-konva";
import {Layer, Stage} from "react-konva";
import useImage from "use-image";
import CanvasImage from "@/components/CanvasImage";
import {generateTimestampFilename} from "@/lib/utils";
import {Button} from "./ui/button";
import Link from "next/link";

const Preview = ({
  processedImage,
  images,
  video,
}: {
  processedImage?: typeof ProcessedImageTable.$inferSelect;
  images?: Array<typeof ImageTable.$inferSelect>;
  video?: typeof VideoTable.$inferSelect;
}) => {
  const stageRef = useRef<StageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [frameImg] = useImage(processedImage?.frameURL || "", "anonymous");

  useEffect(() => {
    if (!containerRef.current) return;

    const updateScale = () => {
      const containerWidth = containerRef.current?.parentElement?.clientWidth || window.innerWidth;
      const newScale = Math.min(1, (containerWidth - 32) / FRAME_WIDTH);
      setScale(newScale);
    };

    updateScale();

    const resizeObserver = new ResizeObserver(() => {
      updateScale();
    });

    if (containerRef.current?.parentElement) {
      resizeObserver.observe(containerRef.current.parentElement);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

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
    <div className="w-full flex flex-row flex-wrap items-center justify-center gap-8 m-8">
      <div
        ref={containerRef}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center",
          height: FRAME_HEIGHT * scale,
          width: FRAME_WIDTH * scale,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Stage
          ref={stageRef}
          width={FRAME_WIDTH}
          height={FRAME_HEIGHT}
          className="pointer-events-none"
        >
          {Array.from({length: processedImage.type == "singular" ? 1 : 2}, (_, _index) => (
            <Layer key={_index}>
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
            <Layer key={index}>
              <KonvaImage
                image={frameImg}
                x={(FRAME_WIDTH / 2) * index}
                height={FRAME_HEIGHT}
                width={FRAME_WIDTH / (processedImage.type == "singular" ? 1 : 2)}
              />
            </Layer>
          ))}
        </Stage>
      </div>

      <div className="flex justify-center gap-5 flex-col">
        <Button
          className="w-[280px] h-[50px] text-white cursor-pointer text-xl rounded-sm"
          onClick={downloadImage}
        >
          Download ảnh
        </Button>

        {video?.url && (
          <Button
            className="w-[280px] h-[50px] text-white cursor-pointer text-xl rounded-sm"
            onClick={downloadVideo}
          >
            Download video
          </Button>
        )}
        <Button className="w-[280px] h-[50px] text-white cursor-pointer text-xl bg-[#f97316] hover:opacity-90 hover:bg-[#f97316] rounded-sm">
          <Link href={`/${processedImage.id}/edit`}>Sửa ảnh/In thêm</Link>
        </Button>
      </div>
    </div>
  );
};
export default Preview;
