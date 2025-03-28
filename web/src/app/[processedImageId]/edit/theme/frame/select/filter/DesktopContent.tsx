/* eslint-disable @next/next/no-img-element */
"use client";
import {usePhoto} from "@/context/PhotoContext";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import useImage from "use-image";
import {Image as KonvaImage, Rect} from "react-konva";
import {Layer, Stage} from "react-konva";
import FrameImage from "@/components/FrameImage";
import {Button} from "@/components/ui/button";
import {FILTERS, FRAME_HEIGHT, FRAME_WIDTH, IMAGE_HEIGHT, IMAGE_WIDTH, OFFSET_X, OFFSET_Y} from "@/constants/constants";
import {cn} from "@/lib/utils";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Stage as StageElement} from "konva/lib/Stage";
import {GlowEffect} from "@/components/ui/glow-effect";
import {ROUTES} from "@/constants/routes";
import {IoIosCheckmark} from "react-icons/io";
import {FaArrowLeft} from "react-icons/fa";
import Link from "next/link";
import {TbWand} from "react-icons/tb";
import {AlertDialogHeader, AlertDialogContent, AlertDialogTitle, AlertDialogTrigger, AlertDialogCancel} from "@/components/ui/alert-dialog";
import {AlertDialog} from "@/components/ui/alert-dialog";
import {RxCross2} from "react-icons/rx";
import LoadingSpinner from "@/components/LoadingSpinner";
import GeneralError from "@/components/GeneralError";
import {useTranslation} from "react-i18next";
import {useImageUpload} from "@/hooks/useImageUpload";

const DesktopContent = () => {
  const {photo} = usePhoto();
  const filterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const NEW_PROCESSED_IMAGE_ID = useMemo(() => {
    return crypto.randomUUID();
  }, []);

  const {uploadImageToDatabase, isMediaUploaded, isUploading, error} = useImageUpload(NEW_PROCESSED_IMAGE_ID);
  const {t} = useTranslation();
  const [frameImg, frameImgStatus] = useImage(photo?.theme?.frame?.src || "", "anonymous");
  const [filter, setFilter] = useState<string | null>(null);
  const stageRef = useRef<StageElement | null>(null);
  const filterRef = useRef(filter);
  const dummyLinkRef = useRef<HTMLAnchorElement>(null);
  const uploadAttemptedRef = useRef(false);

  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

  const handleImageUpload = useCallback(async () => {
    if (uploadAttemptedRef.current) return;
    uploadAttemptedRef.current = true;
    const result = await uploadImageToDatabase(filter ? filter : "");
    if (result && dummyLinkRef.current) {
      dummyLinkRef.current.click();
    }
  }, [filter, uploadImageToDatabase]);

  const selectRandomFilter = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * FILTERS.length);
    setFilter(FILTERS[randomIndex].value);

    filterRefs.current[randomIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, []);

  return (
    <>
      <div className="relative w-full h-full">
        {frameImgStatus != "loaded" && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="loader"></div>
          </div>
        )}
        <div
          className={cn(
            "w-full flex items-center justify-center flex-col transition duration-300",
            frameImgStatus != "loaded" ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >
          {photo && frameImg && (
            <div className="flex items-center justify-evenly gap-3 h-max flex-col">
              <div className="flex items-center justify-center flex-row gap-6">
                <div className="pointer-events-none">
                  <Stage
                    ref={stageRef}
                    width={IMAGE_WIDTH}
                    height={IMAGE_HEIGHT}
                  >
                    <Layer>
                      <Rect
                        width={IMAGE_WIDTH}
                        height={IMAGE_HEIGHT}
                        fill="white"
                      />
                    </Layer>
                    {Array.from({length: photo.frameType == "singular" ? 1 : 2}, (_, _index) => (
                      <Layer
                        key={_index}
                        x={OFFSET_X}
                        y={OFFSET_Y}
                      >
                        {photo.selectedImages.map((item, index) => {
                          return (
                            item.href && (
                              <FrameImage
                                key={item.id}
                                url={item.href}
                                y={photo.theme!.frame.slotPositions[index].y}
                                x={photo.theme!.frame.slotPositions[index].x + (FRAME_WIDTH / 2) * _index}
                                height={photo.theme!.frame.slotDimensions.height}
                                width={photo.theme!.frame.slotDimensions.width}
                                filter={filter || ""}
                                crossOrigin="anonymous"
                              />
                            )
                          );
                        })}
                      </Layer>
                    ))}

                    {Array.from({length: photo.frameType == "singular" ? 1 : 2}, (_, index) => (
                      <Layer
                        key={index}
                        x={OFFSET_X}
                        y={OFFSET_Y}
                      >
                        <KonvaImage
                          image={frameImg}
                          x={(FRAME_WIDTH / 2) * index}
                          height={FRAME_HEIGHT}
                          width={FRAME_WIDTH / (photo.frameType == "singular" ? 1 : 2)}
                        />
                      </Layer>
                    ))}
                  </Stage>
                </div>
                <div className="flex items-center justify-center flex-col gap-5">
                  <ScrollArea className=" h-[60vh] w-[100%] ">
                    <div className="flex-wrap flex gap-4 items-center justify-center">
                      {FILTERS.map((item, index) => (
                        <div
                          ref={(el) => {
                            filterRefs.current[index] = el;
                          }}
                          className={cn(
                            "basis-1/6 flex flex-col gap-2 items-center justify-center border-[4px] cursor-pointer rounded hover:border-black",
                            filter == item.value ? "border-rose-500 hover:border-rose-500" : null
                          )}
                          key={index}
                          onClick={() => setFilter(item.value)}
                        >
                          <img
                            src={photo?.selectedImages[0]?.href}
                            alt="filtered image"
                            className={cn(item.filter, "w-full")}
                            crossOrigin="anonymous"
                          />
                          <p>{item.name}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <Button
                    className="w-full mt-2 rounded-sm cursor-pointer"
                    onClick={selectRandomFilter}
                  >
                    {t("Random Filter")} - {FILTERS.find((item) => item.value == filter)?.name}
                  </Button>
                  <Button
                    className="w-full flex items-center justify-center gap-1 rounded-sm cursor-pointer"
                    onClick={() => setFilter(null)}
                  >
                    {t("Reset Filter")}
                    {!filter && <IoIosCheckmark size={35} />}
                  </Button>
                  <div className="relative w-full">
                    <GlowEffect
                      colors={["#FF5733", "#33FF57", "#3357FF", "#F1C40F"]}
                      mode="colorShift"
                      blur="soft"
                      duration={3}
                      scale={1}
                    />
                    <AlertDialog
                      open={isOpen}
                      onOpenChange={setIsOpen}
                    >
                      <AlertDialogTrigger asChild>
                        <Button className="flex text-sm text-center items-center justify-center gap-2 text-background rounded px-4 py-6 hover:opacity-[85%] w-full relative z-10 cursor-pointer bg-green-700 hover:bg-green-700">
                          {t("Create image")}
                          <TbWand
                            size={20}
                            color="white"
                          />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="flex items-center justify-center gap-4 flex-col">
                        <RxCross2
                          size={25}
                          color="red"
                          className={cn("absolute top-[11px] right-[11px] cursor-pointer", isUploading ? "pointer-events-none" : null)}
                          onClick={() => setIsOpen(false)}
                        />
                        <AlertDialogHeader className="flex items-center justify-center gap-4 flex-col">
                          <AlertDialogTitle className="text-center uppercase text-3xl">{t("Are you sure?")}</AlertDialogTitle>
                        </AlertDialogHeader>
                        <img
                          src="/heart.gif"
                          alt="awww"
                          className="w-[45%]"
                          crossOrigin="anonymous"
                        />
                        <div className="flex items-center justify-center gap-3 flex-col w-full">
                          <AlertDialogCancel
                            className={cn(
                              "bg-red-600 hover:bg-red-700 w-full text-white hover:text-white cursor-pointer",
                              isUploading ? "pointer-events-none" : null
                            )}
                          >
                            {t("Cancel")}
                          </AlertDialogCancel>
                          <Button
                            className="bg-green-600 hover:bg-green-700 w-full text-white hover:text-white cursor-pointer"
                            onClick={handleImageUpload}
                            disabled={isMediaUploaded}
                          >
                            {isUploading && !isMediaUploaded && t("Processing...")}
                            {!isUploading && !isMediaUploaded && t("Sure")}
                            {isMediaUploaded && t("Navigating...")}
                            {isUploading && (
                              <LoadingSpinner
                                size={21}
                                color="white"
                              />
                            )}
                          </Button>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <Button
                    asChild
                    className="relative"
                  >
                    <Link
                      href={`/${photo?.previousProcessedImageId}/${ROUTES.SELECT}`}
                      className="flex items-center justify-center gap-2 text-2xl px-14 py-6 w-full"
                    >
                      <FaArrowLeft />
                      {t("Choose other images")}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
          <Link
            ref={dummyLinkRef}
            href={`/${NEW_PROCESSED_IMAGE_ID}`}
            style={{display: "none"}}
          />
        </div>
      </div>
      {error && (
        <GeneralError
          error={error}
          message={t("An error occurred while creating the image!")}
        />
      )}
    </>
  );
};

export default DesktopContent;
