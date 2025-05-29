"use client";

import { Button } from "@/components/ui/button";
import { cn, findSwappedIndices } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Layer, Rect, Stage } from "react-konva";
import useImage from "use-image";
import { Image as KonvaImage } from "react-konva";
import Image from "next/image";
import FrameImage from "@/components/FrameImage";
import {
  FRAME_HEIGHT,
  FRAME_WIDTH,
  IMAGE_HEIGHT,
  IMAGE_WIDTH,
  OFFSET_X,
  OFFSET_Y,
  IMAGE_SELECT_DURATION,
  CLICK_SOUND_URL,
  CLICK_SOUND_VOUME,
} from "@/constants/constants";
import { uploadImageToR2 } from "@/lib/r2";
import { MdOutlineCloudDone } from "react-icons/md";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useSocket } from "@/context/SocketContext";
import { useTranslation } from "react-i18next";
import { GlowEffect } from "@/components/ui/glow-effect";
import { SlidingNumber } from "@/components/ui/sliding-number";
import usePreventNavigation from "@/hooks/usePreventNavigation";
import { ROUTES } from "@/constants/routes";
import { Reorder } from "motion/react";
import { usePhotoState } from "@/context/PhotoStateContext";
import useSound from "use-sound";

const SelectPage = () => {
  const { photo, setPhoto, updateVideoData, setSelectedImages } =
    usePhotoState();
  const [playClick] = useSound(CLICK_SOUND_URL, { volume: CLICK_SOUND_VOUME });

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!photo) {
      window.location.href = ROUTES.HOME;
      return;
    }
  }, [photo]);
  const { socket, isSocketConnected, isOnline } = useSocket();
  const [videoProcessed, setVideoProcessed] = useState(false);
  const { t } = useTranslation();
  const isLastImageUploadedAttempt = useRef(false);

  const [isLastImageUploaded, setLastImageUploaded] = useState(false);
  const { navigateTo } = usePreventNavigation();

  usePreventNavigation();
  const videoRequestSent = useRef(false);

  useEffect(() => {
    if (
      socket &&
      isSocketConnected &&
      photo &&
      !videoRequestSent.current &&
      isOnline
    ) {
      videoRequestSent.current = true;
      socket.emit(
        "process-video",
        {
          dataURL: photo.video.data,
          id: photo.id!,
        },
        async (response: { success: boolean; r2_url: string }) => {
          if (response.success) {
            console.log("Video processed", response.r2_url);
            updateVideoData(null, response.r2_url);
          } else {
            updateVideoData(null, null);
          }
          setVideoProcessed(true);
        }
      );
    }
  }, [isOnline, isSocketConnected, photo, setPhoto, socket, updateVideoData]);

  useEffect(() => {
    if (!photo || !setPhoto) return;

    const uploadImage = async () => {
      if (
        !isLastImageUploaded &&
        photo.images.some((item) => item.href == "") &&
        !isLastImageUploadedAttempt.current
      ) {
        isLastImageUploadedAttempt.current = true;
        const latestImage = photo.images.find((item) => item.href == "");
        if (!latestImage) return;
        const r2Response = await uploadImageToR2(latestImage.data);
        if (!r2Response.error && r2Response.response) {
          const data = await r2Response.response?.json();
          const imageUrl = data.url;
          console.log("Image URL:", imageUrl);
          setPhoto(
            (prevStyle) =>
              prevStyle && {
                ...prevStyle,
                images: prevStyle.images.map((item) =>
                  item.id === latestImage.id
                    ? { ...item, href: imageUrl }
                    : item
                ),
              }
          );
          setLastImageUploaded(true);
        } else {
          setPhoto(
            (prevStyle) =>
              prevStyle && { ...prevStyle, error: true, images: [], id: null }
          );
          navigateTo(ROUTES.FRAME);
          isLastImageUploadedAttempt.current = true;
        }
      }
    };

    uploadImage();
  }, [photo, navigateTo, setPhoto, isLastImageUploaded]);
  const [frameImg, frameImgStatus] = useImage(
    photo ? photo.theme!.frame.src : ""
  );

  const [selectedImage, setSelectedImage] = useState<
    Array<{ id: string; data: string; href: string } | null>
  >(
    Array.from({ length: photo ? photo.theme!.frame.slotCount : 0 }, () => null)
  );
  const [timeLeft, setTimeLeft] = useState(IMAGE_SELECT_DURATION);
  const [isTimeOver, setIsTimeOver] = useState(false);
  const [lastRemovedImage, setLastRemovedImage] = useState<number>(
    photo ? photo.theme!.frame.slotCount - 1 : 0
  );
  const isSingle = useMemo(() => {
    if (!photo) return 1;
    return photo.frameType == "singular" ? 1 : 2;
  }, [photo]);
  const [isSelected, setIsSelected] = useState(false);
  const [slots, setSlots] = useState<Array<number>>(
    Array.from(
      { length: photo ? photo.theme!.frame.slotCount : 0 },
      (_, index) => index
    )
  );
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined = undefined;

    if (
      isSocketConnected &&
      isOnline &&
      !isSelected &&
      frameImgStatus === "loaded"
    ) {
      if (timeLeft > 0) {
        timer = setTimeout(() => {
          setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);
      } else {
        setIsTimeOver(true);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timeLeft, isSocketConnected, isOnline, isSelected, frameImgStatus]);

  const handleSelect = useCallback(
    (image: { id: string; data: string; href: string } | null) => {
      if (photo && image !== null) {
        const isSelected = selectedImage.some((img) => img?.id === image.id);
        const maxImages = photo.theme!.frame.slotCount;
        const currentSelectedImages = selectedImage.filter(
          (img) => img !== null
        );
        if (!isSelected && maxImages - currentSelectedImages.length > 0) {
          setSelectedImage((prevImages) => {
            const firstNullIndex = prevImages.findIndex((img) => img === null);

            if (firstNullIndex !== -1) {
              const newImages = [...prevImages];
              newImages[firstNullIndex] = image;
              return newImages;
            }
            return [...prevImages, image];
          });
        } else if (
          isSelected &&
          maxImages - currentSelectedImages.length >= 0
        ) {
          setSelectedImage((prevImages) => {
            const newImage = [...prevImages];
            const index = prevImages.findIndex((img) => img?.id === image.id);
            if (index !== -1) {
              newImage[index] = null;
              setLastRemovedImage(index);
            }
            return newImage;
          });
        } else if (maxImages - currentSelectedImages.length == 0) {
          setSelectedImage((prevImages) => {
            const newImage = [...prevImages];
            newImage[lastRemovedImage!] = image;
            return newImage;
          });
        }
      }
    },
    [lastRemovedImage, photo, selectedImage]
  );

  const filteredSelectedImages = useMemo(
    () =>
      selectedImage.filter((img) => img !== null) as Array<{
        id: string;
        data: string;
        href: string;
      }>,
    [selectedImage]
  );

  useEffect(() => {
    if (!isTimeOver || !photo) return;
    if (photo.theme!.frame.slotCount != filteredSelectedImages.length) {
      const itemLeft =
        photo.theme!.frame.slotCount - filteredSelectedImages.length;
      if (itemLeft > 0) {
        const unselectedImage = photo.images.filter(
          (item) => !filteredSelectedImages.includes(item)
        );

        const shuffledImages = [...unselectedImage].sort(
          () => Math.random() - 0.5
        );

        setSelectedImage((prevImages) => {
          const newImages = [...prevImages];
          let currentIndex = 0;

          for (
            let i = 0;
            i < newImages.length && currentIndex < itemLeft;
            i++
          ) {
            if (newImages[i] === null) {
              newImages[i] = shuffledImages[currentIndex];
              currentIndex++;
            }
          }
          return newImages;
        });
      }
    } else {
      if (
        photo.selectedImages.length == 0 &&
        videoProcessed &&
        isLastImageUploaded
      ) {
        setSelectedImages(filteredSelectedImages);
        return navigateTo(ROUTES.FILTER);
      }
    }
  }, [
    filteredSelectedImages,
    isLastImageUploaded,
    isTimeOver,
    navigateTo,
    photo,
    setSelectedImages,
    videoProcessed,
  ]);

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <div
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center",
          frameImgStatus != "loaded"
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        )}
      >
        <div className="loader"></div>
      </div>
      <div
        className={cn(
          "w-full h-full flex items-center justify-center gap-3 flex-col transition duration-300",
          frameImgStatus != "loaded"
            ? "opacity-0 pointer-events-none"
            : "opacity-100"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-evenly w-full h-full",
            isTimeOver || isSelected ? "pointer-events-none" : null
          )}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative flex items-center justify-center h-full">
              <div className="frame-container">
                <Reorder.Group
                  values={slots}
                  onReorder={(newSlotOrder) => {
                    const swappedIndices = findSwappedIndices(
                      slots,
                      newSlotOrder
                    );
                    setSlots(newSlotOrder);
                    setSelectedImage((prevImages) => {
                      const reorderedImages = [...prevImages];
                      const [removed] = reorderedImages.splice(
                        swappedIndices.fromIndex,
                        1
                      );
                      reorderedImages.splice(
                        swappedIndices.toIndex,
                        0,
                        removed
                      );
                      return reorderedImages;
                    });
                  }}
                  as="div"
                  className="absolute z-50 flex flex-col"
                  style={{
                    gap:
                      isSingle == 2 && photo
                        ? (photo.theme!.frame.slotPositions[0].y / isSingle) *
                          0.7
                        : photo
                        ? OFFSET_Y * 2 + photo.theme!.frame.slotPositions[0].y
                        : 0,
                    top: photo
                      ? photo.theme!.frame.slotPositions[0].y +
                        OFFSET_Y / isSingle
                      : 0,
                    left: OFFSET_X / isSingle,
                  }}
                >
                  {slots.map((slotIndex, index) => (
                    <Reorder.Item
                      value={slotIndex}
                      key={slotIndex}
                      z={100}
                      as="div"
                      draggable={true}
                      onDragStart={() => {
                        setIsDragging(true);
                      }}
                      onDragEnd={() => {
                        setIsDragging(false);
                      }}
                      onClick={() => {
                        if (selectedImage[index] && !isDragging) {
                          playClick();
                          handleSelect(selectedImage[index]);
                        }
                      }}
                    >
                      <div
                        style={{
                          width: FRAME_WIDTH / isSingle,
                          height: photo
                            ? photo.theme!.frame.slotDimensions.height
                            : 0,
                        }}
                        className="z-50 bg-transparent hover:cursor-grab active:cursor-grabbing"
                      ></div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>

                {frameImg && photo && (
                  <Stage width={IMAGE_WIDTH / isSingle} height={IMAGE_HEIGHT}>
                    <Layer>
                      <Rect
                        width={IMAGE_WIDTH / isSingle}
                        height={IMAGE_HEIGHT}
                        fill="white"
                      />
                    </Layer>
                    <Layer x={OFFSET_X / isSingle} y={OFFSET_Y / isSingle}>
                      {selectedImage.map((item, index) => (
                        <FrameImage
                          key={index}
                          url={item?.data}
                          y={photo.theme!.frame.slotPositions[index].y}
                          x={photo.theme!.frame.slotPositions[index].x}
                          filter={null}
                          height={photo.theme!.frame.slotDimensions.height}
                          width={photo.theme!.frame.slotDimensions.width}
                        />
                      ))}
                    </Layer>
                    <Layer x={OFFSET_X / isSingle} y={OFFSET_Y / isSingle}>
                      <KonvaImage
                        image={frameImg}
                        height={FRAME_HEIGHT}
                        width={FRAME_WIDTH / isSingle}
                      />
                    </Layer>
                  </Stage>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col w-[60%] gap-11 items-start justify-center ">
            {photo && (
              <div className="flex justify-center w-full gap-2 item-center ">
                <h1 className="flex gap-2 mb-4 text-5xl font-semibold uppercase">
                  {t("Choose pictures")}{" "}
                </h1>
                <span className="text-5xl font-bold text-rose-500 ">
                  <SlidingNumber value={timeLeft} padStart={true} />
                </span>
              </div>
            )}

            <div className="flex items-center justify-center w-full flex-wrap  gap-2 ">
              {photo && (
                <>
                  {photo.images.map((item, index) => (
                    <div
                      key={index}
                      className={cn(
                        "bg-gray-200 rounded border-4 border-transparent hover:border-black hover:cursor-pointer",
                        selectedImage.some((img) => img?.id === item.id)
                          ? "border-rose-500 hover:border-rose-500"
                          : null
                      )}
                      onMouseDown={() => playClick()}
                      onClick={() => handleSelect(item)}
                    >
                      <Image
                        height={300}
                        width={300}
                        src={item.data}
                        alt="image"
                        priority
                        className={cn(
                          "pointer-events-none !max-w-[unset]",
                          `w-[${
                            photo.theme!.frame.slotDimensions.width * 1.1
                          }px] h-[${
                            photo.theme!.frame.slotDimensions.height * 1.1
                          }px]`
                        )}
                      />
                    </div>
                  ))}
                </>
              )}
            </div>
            {photo && (
              <div
                className="relative w-full h-full"
                onMouseDown={() => playClick()}
              >
                {(photo.theme!.frame.slotCount -
                  filteredSelectedImages.length ==
                  0 ||
                  isTimeOver) && (
                  <GlowEffect
                    colors={["#FF5733", "#33FF57", "#3357FF", "#F1C40F"]}
                    mode="colorShift"
                    blur="soft"
                    duration={3}
                    scale={1}
                    className="z-[0]"
                  />
                )}
                <Button
                  className={cn(
                    "flex items-center justify-center gap-2 text-xl px-14 py-6 w-full relative font-light",
                    photo
                      ? photo.theme!.frame.slotCount -
                          filteredSelectedImages.length !=
                          0 ||
                        isTimeOver ||
                        !isLastImageUploaded ||
                        !videoProcessed
                        ? "pointer-events-none opacity-80"
                        : null
                      : null,
                    isSelected ? "pointer-events-none opacity-[85%]" : null
                  )}
                  onClick={() => {
                    setIsSelected(true);
                    setSelectedImages(filteredSelectedImages);
                    navigateTo(ROUTES.FILTER);
                  }}
                >
                  {t("Choose a filter")}
                  {!isLastImageUploaded || !videoProcessed ? (
                    <LoadingSpinner size={15} />
                  ) : (
                    <MdOutlineCloudDone size={15} color="white" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectPage;
