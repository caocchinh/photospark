"use client";
import {ProcessedImageTable, ImageTable, VideoTable} from "@/drizzle/schema";
import {useRef, useState, useEffect} from "react";
import {Stage as StageElement} from "konva/lib/Stage";
import {cn, generateTimestampFilename} from "@/lib/utils";
import Link from "next/link";
import {GlowEffect} from "@/components/ui/glow-effect";
import LoadingSpinner from "@/components/LoadingSpinner";
import {AiOutlineDownload} from "react-icons/ai";
import {MdModeEdit} from "react-icons/md";
import {IoCopySharp} from "react-icons/io5";
import FrameStage from "@/components/FrameStage";
import GeneralError from "@/components/GeneralError";
import {Button} from "@/components/ui/button";
import {getImages, getProcessedImage} from "@/server/actions";
import {LuRefreshCcw, LuLink} from "react-icons/lu";
import LanguageBar from "@/components/LanguageBar";
import {useTranslation} from "react-i18next";

const Preview = ({
  initialProcessedImage,
  initialImages,
  video,
}: {
  initialProcessedImage: typeof ProcessedImageTable.$inferSelect;
  initialImages?: Array<typeof ImageTable.$inferSelect>;
  video?: typeof VideoTable.$inferSelect;
}) => {
  const {t} = useTranslation();
  const stageRef = useRef<StageElement | null>(null);
  const [error, setError] = useState(false);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [images, setImages] = useState<Array<typeof ImageTable.$inferSelect>>(initialImages || []);
  const [processedImage, setProcessedImage] = useState<typeof ProcessedImageTable.$inferSelect>(initialProcessedImage);
  const [isRefreshButtonDisabled, setIsRefreshButtonDisabled] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [copied, setCopied] = useState(false);
  const [initialCountDown, setInitialCountDown] = useState(7);

  useEffect(() => {
    const interval = setInterval(() => {
      if (initialCountDown > 0) {
        setInitialCountDown((prev) => prev - 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [initialCountDown]);

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
    <div className="flex flex-col items-center justify-center gap-8 p-4 mt-3 h-max w-full">
      <div className="w-[95%] flex items-center justify-end">
        <LanguageBar />
      </div>

      <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-8 m-8 mt-3 h-max ">
        <div className="relative min-w-[300px] w-full md:w-max">
          <div className={cn(!allImagesLoaded && "pointer-events-none opacity-0")}>
            <FrameStage
              processedImage={processedImage}
              images={images}
              stageRef={stageRef}
              onLoadingComplete={setAllImagesLoaded}
              imagesLoaded={imagesLoaded}
              setImagesLoaded={setImagesLoaded}
            />
          </div>
          {!allImagesLoaded && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-2 flex-col">
              <LoadingSpinner size={100} />
              <Button
                variant="outline"
                className="mt-4 cursor-pointer flex items-center gap-2"
                disabled={isRefreshButtonDisabled || allImagesLoaded || initialCountDown > 0}
                onClick={async () => {
                  try {
                    setIsRefreshButtonDisabled(true);
                    setAllImagesLoaded(false);
                    setImagesLoaded(0);
                    setImages([]);
                    if (processedImage.id) {
                      const processedImageResult = await getProcessedImage(processedImage.id);
                      const imagesResult = await getImages(processedImage.id);

                      if (processedImageResult.error || imagesResult.error) {
                        throw new Error("Failed to reload images");
                      }
                      setProcessedImage(processedImageResult.data!);
                      setImages(imagesResult.data!);
                      setError(false);
                    }
                  } catch {
                    setError(true);
                  } finally {
                    if (initialCountDown <= 0) {
                      setTimeout(() => {
                        setIsRefreshButtonDisabled(false);
                      }, 5000);
                    }
                  }
                }}
              >
                {t("Reload image")}
                <LuRefreshCcw className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
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
              {allImagesLoaded ? t("Download image") : t("Loading image")}
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
              {t("Download video")}
              <AiOutlineDownload size={27} />
            </div>
          )}
          <div
            className="w-full h-[50px] text-white bg-black cursor-pointer text-xl rounded-sm flex items-center justify-center gap-3"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setCopied(true);
              setTimeout(() => {
                setCopied(false);
              }, 2000);
            }}
          >
            {copied ? t("Copied!") : t("Copy image link")}
            <LuLink size={27} />
          </div>
          <div className="w-full h-[50px] text-white cursor-pointer text-xl bg-[#f97316] hover:opacity-90 hover:bg-[#f97316] rounded-sm flex items-center justify-center gap-3">
            <Link
              href={`/${processedImage.id}/edit`}
              className="flex items-center justify-center gap-2 h-full w-full"
            >
              {t("Edit image")}
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
              {t("Print more")}
              <IoCopySharp
                size={22}
                color="white"
              />
            </Link>
          </div>
        </div>
      </div>
      <GeneralError
        error={error}
        message={t("Error while downloading image!")}
      />
    </div>
  );
};
export default Preview;
