"use client";
import {ProcessedImageTable, ImageTable, VideoTable} from "@/drizzle/schema";
import {FRAME_WIDTH, FRAME_HEIGHT, FrameOptions} from "@/constants/constants";
import {useRef, useEffect, useState} from "react";
import {Stage as StageElement} from "konva/lib/Stage";
import {Image as KonvaImage, Rect} from "react-konva";
import {Layer, Stage} from "react-konva";
import useImage from "use-image";
import CanvasImage from "@/components/CanvasImage";
import {generateTimestampFilename} from "@/lib/utils";
import {Button} from "./ui/button";
import Link from "next/link";
import {GlowEffect} from "./ui/glow-effect";
import {MdKeyboardArrowRight} from "react-icons/md";
import {AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle} from "./ui/alert-dialog";
import {MdWarning} from "react-icons/md";
import {IoRefresh} from "react-icons/io5";

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
  const [error, setError] = useState(false);
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
    } catch {
      setError(true);
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
      <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-8 m-8 mt-3 h-max ">
        <div
          ref={containerRef}
          style={{
            transform: `scale(${scale})`,
            height: FRAME_HEIGHT * scale,
            transformOrigin: "center",
          }}
          className="w-full lg:w-max h-full flex items-center justify-center"
        >
          <Stage
            ref={stageRef}
            width={FRAME_WIDTH}
            height={FRAME_HEIGHT}
            className="pointer-events-none"
          >
            <Layer>
              <Rect
                width={processedImage.type == "singular" ? FRAME_WIDTH : FRAME_WIDTH * 2}
                height={FRAME_HEIGHT}
                fill="white"
              />
            </Layer>
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

        <div className="flex items-center justify-center gap-6 flex-col w-[90%] md:w-[300px]">
          <div className="relative w-full h-[50px]">
            <Button
              className="w-full h-full text-white cursor-pointer text-xl rounded-sm relative z-10"
              onClick={downloadImage}
            >
              Download ảnh
            </Button>
            <GlowEffect
              colors={["#0894FF", "#C959DD", "#FF2E54", "#FF9004"]}
              mode="static"
              blur="medium"
              className="z-[0]"
            />
          </div>

          {video?.url && (
            <Button
              className="w-full h-[50px] text-white cursor-pointer text-xl rounded-sm"
              onClick={downloadVideo}
            >
              Download video
            </Button>
          )}
          <Button className="w-full h-[50px] text-white cursor-pointer text-xl bg-[#f97316] hover:opacity-90 hover:bg-[#f97316] rounded-sm">
            <Link
              href={`/${processedImage.id}/edit`}
              className="flex items-center justify-center gap-2 h-full w-full"
            >
              Sửa ảnh/In thêm
              <MdKeyboardArrowRight
                size={200}
                color="white"
              />
            </Link>
          </Button>
        </div>
      </div>
      <AlertDialog open={error}>
        <AlertDialogContent className="flex flex-col items-center justify-center gap-4 border border-red-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 text-4xl font-bold">OOPS</AlertDialogTitle>
          </AlertDialogHeader>
          <MdWarning
            className="text-red-500"
            size={100}
          />
          <AlertDialogDescription className="text-2xl">Có lỗi trong khi download ảnh!</AlertDialogDescription>
          <AlertDialogFooter>
            <Button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 cursor-pointer"
            >
              Refresh lại trang
              <IoRefresh />
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
export default Preview;
