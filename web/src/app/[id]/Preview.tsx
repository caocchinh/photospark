"use client";
import {ProcessedImageTable, ImageTable, VideoTable} from "@/drizzle/schema";
import {FRAME_WIDTH, FRAME_HEIGHT} from "@/constants/constants";
import {useRef, useEffect, useState} from "react";
import {Stage as StageElement} from "konva/lib/Stage";
import {Image as KonvaImage, Rect} from "react-konva";
import {Layer, Stage} from "react-konva";
import useImage from "use-image";
import CanvasImage from "@/components/CanvasImage";
import {cn, generateTimestampFilename} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {GlowEffect} from "@/components/ui/glow-effect";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {MdWarning} from "react-icons/md";
import {IoRefresh} from "react-icons/io5";
import {usePhoto} from "@/context/PhotoContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import {AiOutlineDownload} from "react-icons/ai";
import {MdModeEdit} from "react-icons/md";
import {IoCopySharp} from "react-icons/io5";

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
  const [frameImg, frameImgStatus] = useImage(processedImage?.frameURL || "", "anonymous");
  const [error, setError] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const {setPhoto} = usePhoto();

  useEffect(() => {
    if (frameImgStatus === "loaded" && imagesLoaded === (images?.length || 0)) {
      setAllImagesLoaded(true);
    } else {
      setAllImagesLoaded(false);
    }
  }, [frameImgStatus, imagesLoaded, images?.length]);

  const handleImageLoaded = () => {
    setImagesLoaded((prev) => prev + 1);
  };

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
    if (!stageRef.current || !allImagesLoaded) return;

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
                {images?.map(({id, url, slotPositionX, slotPositionY, height, width}) => {
                  return (
                    url &&
                    slotPositionX != null &&
                    slotPositionY != null &&
                    height != null &&
                    width != null && (
                      <CanvasImage
                        key={id}
                        url={url}
                        y={slotPositionY}
                        x={slotPositionX + (FRAME_WIDTH / 2) * _index}
                        height={height}
                        width={width}
                        filter={processedImage.filter!}
                        crossOrigin="anonymous"
                        onLoad={handleImageLoaded}
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

        <div className="flex items-center justify-center gap-6 flex-col w-[90%] md:w-[280px]">
          <div className="relative w-full h-[50px]">
            <div
              className={cn(
                "w-full h-full text-white cursor-pointer text-xl bg-black rounded-sm relative z-10 flex items-center justify-center gap-3",
                !allImagesLoaded && "pointer-events-none"
              )}
              onClick={downloadImage}
            >
              {allImagesLoaded ? "Download hình" : "Đang load hình"}
              {!allImagesLoaded ? <LoadingSpinner size={25} /> : <AiOutlineDownload size={27} />}
            </div>
            {allImagesLoaded && (
              <GlowEffect
                colors={["#0894FF", "#C959DD", "#FF2E54", "#FF9004"]}
                mode="static"
                blur="medium"
                className="z-[0]"
              />
            )}
          </div>

          {video?.url && (
            <div
              className="w-full h-[50px] text-white bg-black cursor-pointer text-xl rounded-sm flex items-center justify-center gap-3"
              onClick={downloadVideo}
            >
              Download video
              <AiOutlineDownload size={27} />
            </div>
          )}
          <div
            className="w-full h-[50px] text-white cursor-pointer text-xl bg-[#f97316] hover:opacity-90 hover:bg-[#f97316] rounded-sm flex items-center justify-center gap-3"
            onClick={() =>
              setPhoto!(() => {
                if (!setPhoto) return;
                return {
                  images: images?.map(({id, url}) => ({id, href: url})) || [],
                  selectedImages: [],
                  theme: null,
                  quantity: null,
                  video: {
                    r2_url: video ? video.url : null,
                  },
                  isTransition: false,
                  id: null,
                  frameType: null,
                  filters: null,
                };
              })
            }
          >
            <Link
              href={`/${processedImage.id}/edit`}
              className="flex items-center justify-center gap-2 h-full w-full"
            >
              Sửa ảnh
              <MdModeEdit
                size={27}
                color="white"
              />
            </Link>
          </div>

          <div
            className="w-full h-[50px] text-white cursor-pointer text-xl bg-[#f97316] hover:opacity-90 hover:bg-[#f97316] rounded-sm flex items-center justify-center gap-3"
            onClick={() =>
              setPhoto!(() => {
                if (!setPhoto) return;
                return {
                  images: images?.map(({id, url}) => ({id, href: url})) || [],
                  selectedImages: [],
                  theme: null,
                  quantity: null,
                  video: {
                    r2_url: video ? video.url : null,
                  },
                  isTransition: false,
                  id: null,
                  frameType: null,
                  filters: null,
                };
              })
            }
          >
            <Link
              href={`/${processedImage.id}/print`}
              className="flex items-center justify-center gap-2 h-full w-full"
            >
              In thêm
              <IoCopySharp
                size={22}
                color="white"
              />
            </Link>
          </div>
        </div>
      </div>
      <DownloadError error={error} />
    </>
  );
};
export default Preview;

const DownloadError = ({error}: {error: boolean}) => {
  return (
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
  );
};
