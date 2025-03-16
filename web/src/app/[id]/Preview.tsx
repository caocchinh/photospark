"use client";
import {ProcessedImageTable, ImageTable, VideoTable} from "@/drizzle/schema";
import {useRef, useEffect, useState} from "react";
import {Stage as StageElement} from "konva/lib/Stage";
import useImage from "use-image";
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
import FrameStage from "@/components/FrameStage";

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
  const [frameImg, frameImgStatus] = useImage(processedImage?.frameURL || "", "anonymous");
  const [error, setError] = useState(false);
  const {setPhoto} = usePhoto();
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);

  useEffect(() => {
    const chosenImageCount = images?.filter((image) => image.slotPositionX != null && image.slotPositionY != null).length || 0;
    if (frameImgStatus === "loaded" && imagesLoaded === chosenImageCount * (processedImage?.type == "singular" ? 1 : 2)) {
      setAllImagesLoaded(true);
    } else {
      setAllImagesLoaded(false);
    }
  }, [frameImgStatus, imagesLoaded, images, processedImage?.type]);

  const handleImageLoaded = () => {
    setImagesLoaded((prev) => prev + 1);
  };

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
        <FrameStage
          processedImage={processedImage}
          images={images}
          onImageLoaded={handleImageLoaded}
          stageRef={stageRef}
          frameImg={frameImg}
        />

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

          <div className="w-full h-[50px] text-white cursor-pointer text-xl bg-[#f97316] hover:opacity-90 hover:bg-[#f97316] rounded-sm flex items-center justify-center gap-3">
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
