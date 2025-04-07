/* eslint-disable @next/next/no-img-element */
"use client";

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
import {LuRefreshCcw, LuLink} from "react-icons/lu";
import LanguageBar from "@/components/LanguageBar";
import {useTranslation} from "react-i18next";
import {useRouter} from "next/navigation";
import NavBar from "@/components/NavBar";
import {useProcessedImage} from "@/context/ProcssedImageContext";
import Head from "next/head";
import {IoQrCodeSharp} from "react-icons/io5";
import {Dialog, DialogContent, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {QRCodeCanvas} from "qrcode.react";

const Preview = () => {
  const {processedImage, images, video} = useProcessedImage();
  const {t} = useTranslation();
  const stageRef = useRef<StageElement | null>(null);
  const [error, setError] = useState(false);
  const [isAllImagesLoaded, setIsAllImagesLoaded] = useState(false);
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [initialCountDown, setInitialCountDown] = useState(10);
  const [isDownloading, setIsDownloading] = useState(false);
  const qrRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (initialCountDown > 0 && !isAllImagesLoaded) {
        setInitialCountDown((prev) => prev - 1);
        console.log(initialCountDown);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [initialCountDown, isAllImagesLoaded]);

  if (!processedImage) {
    return null;
  }

  const downloadImage = () => {
    if (!stageRef.current || !isAllImagesLoaded) return;
    try {
      const dataURL = stageRef.current.toDataURL({
        pixelRatio: 2,
        mimeType: "image/jpg",
      });

      const link = document.createElement("a");
      link.download = generateTimestampFilename("VTEAM", "jpg");
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      setError(true);
    } finally {
      setIsDownloading(false);
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
      <Head>
        <link
          rel="preload"
          href={processedImage.frameURL}
          as="image"
        />
      </Head>
      <NavBar captureDate={processedImage.createdAt} />
      <div className="flex flex-col items-center justify-center gap-8 p-4  h-max w-full relative z-[0] bg-white pt-20 preview-page-container">
        <div className="w-[95%] flex items-center justify-end">
          <LanguageBar />
        </div>

        <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-8 m-8 mt-3 h-max ">
          <div className="relative min-w-[300px] sm:min-w-[400px] w-full md:w-max">
            <div className={cn(!isAllImagesLoaded && "pointer-events-none opacity-0")}>
              <FrameStage
                processedImage={processedImage}
                images={images?.map((image) => ({
                  ...image,
                  url: ["r2.dev", process.env.NEXT_PUBLIC_R2_PUBLIC_BUCKET_PRODUCTION_URL].some(
                    (bucketUrl) => bucketUrl && image.url.includes(bucketUrl)
                  )
                    ? `/api/proxy?url=${encodeURIComponent(image.url)}`
                    : image.url,
                }))}
                stageRef={stageRef}
                setIsAllImagesLoaded={setIsAllImagesLoaded}
              />
            </div>
            {!isAllImagesLoaded && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-10 flex-col sm:flex-row h-full">
                <img
                  src="/work.gif"
                  alt="so cute"
                  className="w-[150px] h-[150px] mb-0 sm:mb-10"
                />
                <div className="flex items-center justify-center gap-2 flex-col">
                  <LoadingSpinner size={100} />

                  <Button
                    variant="outline"
                    className="mt-4 cursor-pointer flex items-center gap-2"
                    disabled={isAllImagesLoaded || initialCountDown > 0}
                    onClick={() => {
                      if (initialCountDown <= 0) {
                        setInitialCountDown(10);
                        router.refresh();
                      }
                    }}
                  >
                    {t("Reload")}
                    <LuRefreshCcw className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 flex-col w-[90%] md:w-[70%] lg:w-[280px]">
            <div className="relative w-full h-[50px]">
              <div
                className={cn(
                  "w-full h-full text-white cursor-pointer text-xl bg-black rounded-sm relative z-10 flex items-center justify-center gap-3",
                  !isAllImagesLoaded && "pointer-events-none opacity-50"
                )}
                onClick={() => {
                  setIsDownloading(true);
                  downloadImage();
                }}
              >
                {isAllImagesLoaded ? t("Download image") : t("Loading image")}
                {!isAllImagesLoaded || isDownloading ? <LoadingSpinner size={25} /> : <AiOutlineDownload size={27} />}
              </div>
              {isAllImagesLoaded && (
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
            <Dialog>
              <DialogTrigger asChild>
                <div className="w-full h-[50px] text-white bg-black cursor-pointer text-xl rounded-sm flex items-center justify-center gap-3">
                  {t("QR Code")}
                  <IoQrCodeSharp size={27} />
                </div>
              </DialogTrigger>
              <DialogContent className="flex items-center justify-center gap-2 w-max p-9 flex-col">
                <DialogTitle className="sr-only">{t("QR Code")}</DialogTitle>
                <QRCodeCanvas
                  ref={qrRef}
                  value={window.location.href}
                  title={"VTEAM Photobooth"}
                  size={300}
                  marginSize={2}
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"H"}
                  imageSettings={{
                    src: "/vteam-logo.webp",
                    x: undefined,
                    y: undefined,
                    height: 64,
                    width: 73,
                    opacity: 1,
                    excavate: true,
                  }}
                />
                <Button
                  className="cursor-pointer flex items-center gap-2 w-full rounded-sm"
                  onClick={() => {
                    if (qrRef.current) {
                      const canvas = qrRef.current;
                      const link = document.createElement("a");
                      link.download = generateTimestampFilename("VTEAM QR", "jpg");
                      link.href = canvas.toDataURL("image/png");
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                >
                  {t("Download QR")}
                  <AiOutlineDownload size={27} />
                </Button>
              </DialogContent>
            </Dialog>
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
    </>
  );
};
export default Preview;
