"use client";
import {Button} from "@/components/ui/button";
import {usePhoto} from "@/context/PhotoContext";
import {cn, findSwappedIndices} from "@/lib/utils";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Layer, Rect, Stage} from "react-konva";
import useImage from "use-image";
import {Image as KonvaImage} from "react-konva";
import Image from "next/image";
import SelectedImage from "@/components/SelectedImage";
import Link from "next/link";
import {FRAME_HEIGHT, FRAME_WIDTH, IMAGE_HEIGHT, IMAGE_WIDTH, OFFSET_X, OFFSET_Y, IMAGE_SELECT_DURATION} from "@/constants/constants";
import {uploadImageToR2} from "@/lib/r2";
import {MdOutlineCloudDone} from "react-icons/md";
import LoadingSpinner from "@/components/LoadingSpinner";
import SelectInstruction from "@/components/SelectInstruction";
import {useSocket} from "@/context/SocketContext";
import {useTranslation} from "react-i18next";
import {GlowEffect} from "@/components/ui/glow-effect";
import {SlidingNumber} from "@/components/ui/sliding-number";
import usePreventNavigation from "@/hooks/usePreventNavigation";
import {ROUTES} from "@/constants/routes";
import {Reorder} from "motion/react";

const PrintPage = () => {
  const {photo, setPhoto, isOnline} = usePhoto();
  const {navigateTo} = usePreventNavigation();
  const {socket, isSocketConnected} = useSocket();
  const [videoProcessed, setVideoProcessed] = useState(false);
  const {t} = useTranslation();

  usePreventNavigation();

  const lastImageUploaded = useMemo(() => {
    if (photo) {
      return photo!.images[photo!.images.length - 1].href != "";
    }
  }, [photo]);

  const videoRequestSent = useRef(false);

  useEffect(() => {
    if (socket && isSocketConnected && photo && !videoRequestSent.current && isOnline) {
      videoRequestSent.current = true;
      socket.emit(
        "process-video",
        {
          dataURL: photo.video.data,
          id: photo.id!,
          frameImageUrl: photo.theme!.frame.src,
          processingMode: "overlay",
        },
        async (response: {success: boolean; r2_url: string}) => {
          if (response.success) {
            console.log("Video processed", response.r2_url);

            setPhoto!((prevStyle) => {
              if (prevStyle) {
                return {...prevStyle, video: {...prevStyle.video, r2_url: response.r2_url}};
              }
            });
            setVideoProcessed(true);
          }
        }
      );
    }
  }, [isOnline, isSocketConnected, photo, setPhoto, socket]);

  useEffect(() => {
    if (!photo) return navigateTo(ROUTES.HOME);
    if (photo.selectedImages.length === photo.theme!.frame.slotCount) return navigateTo(ROUTES.FILTER);

    const uploadImage = async () => {
      if (!setPhoto) return;
      if (!lastImageUploaded) {
        const latestImage = photo.images[photo.images.length - 1];
        const r2Response = await uploadImageToR2(latestImage.data);

        if (!r2Response.error && r2Response.response) {
          const data = await r2Response.response?.json();
          const imageUrl = data.url;
          console.log("Image URL:", imageUrl);
          setPhoto(
            (prevStyle) =>
              prevStyle && {
                ...prevStyle,
                images: prevStyle.images.map((item) => (item.id === latestImage.id ? {...item, href: imageUrl} : item)),
              }
          );
        } else {
          setPhoto((prevStyle) => prevStyle && {...prevStyle, error: true, images: [], id: null});
          navigateTo(ROUTES.LAYOUT);
        }
      }
    };

    uploadImage();
  }, [photo, navigateTo, setPhoto, lastImageUploaded]);
  const [frameImg, frameImgStatus] = useImage(photo ? photo.theme!.frame.src : "");

  const [selectedImage, setSelectedImage] = useState<Array<{id: string; data: string; href: string} | null>>(
    Array.from({length: photo ? photo.theme!.frame.slotCount : 0}, () => null)
  );
  const [timeLeft, setTimeLeft] = useState(IMAGE_SELECT_DURATION);
  const [isTimeOver, setIsTimeOver] = useState(false);
  const photoRef = useRef(photo);
  const [lastRemovedImage, setLastRemovedImage] = useState<number>(photo ? photo.theme!.frame.slotCount - 1 : 0);
  const isSingle = useMemo(() => {
    if (!photo) return 1;
    return photo.frameType == "singular" ? 1 : 2;
  }, [photo]);
  const [selected, setSelected] = useState(false);
  const [slots, setSlots] = useState<Array<number>>(Array.from({length: photo ? photo.theme!.frame.slotCount : 0}, (_, index) => index));
  const [isDragging, setIsDragging] = useState(false);

  const handleContextSelect = useCallback(
    async (images: Array<{id: string; data: string; href: string}>) => {
      setPhoto!((prevStyle) => {
        if (prevStyle) {
          return {
            ...prevStyle,
            selectedImages: images,
          };
        }
      });
      navigateTo(ROUTES.FILTER);
    },
    [navigateTo, setPhoto]
  );

  useEffect(() => {
    if (isSocketConnected && isOnline) {
      if (timeLeft > 0) {
        const timerId = setInterval(() => {
          setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);
        return () => clearInterval(timerId);
      } else {
        setIsTimeOver(true);
      }
    }
  }, [timeLeft, isSocketConnected, isOnline]);

  const handleSelect = useCallback(
    (image: {id: string; data: string; href: string} | null) => {
      if (photo && image !== null) {
        const isSelected = selectedImage.some((img) => img?.id === image.id);
        const maxImages = photo.theme!.frame.slotCount;
        const currentSelectedImages = selectedImage.filter((img) => img !== null);
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
        } else if (isSelected && maxImages - currentSelectedImages.length >= 0) {
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

  const filteredSelectedImages = useMemo(() => selectedImage.filter((img) => img !== null), [selectedImage]);

  useEffect(() => {
    if (!isTimeOver || !photoRef.current) return;

    const itemLeft = photoRef.current!.theme!.frame.slotCount - filteredSelectedImages.length;
    if (itemLeft > 0) {
      const unselectedImage = photoRef.current!.images.filter((item) => !filteredSelectedImages.includes(item));

      const shuffledImages = [...unselectedImage].sort(() => Math.random() - 0.5);

      setSelectedImage((prevImages) => {
        const newImages = [...prevImages];
        let currentIndex = 0;

        for (let i = 0; i < newImages.length && currentIndex < itemLeft; i++) {
          if (newImages[i] === null) {
            newImages[i] = shuffledImages[currentIndex];
            currentIndex++;
          }
        }
        return newImages;
      });
    }
  }, [isTimeOver, filteredSelectedImages, photo, lastImageUploaded]);

  useEffect(() => {
    if (isTimeOver && lastImageUploaded && videoProcessed) {
      handleContextSelect(filteredSelectedImages);
    }
  }, [isTimeOver, filteredSelectedImages, handleContextSelect, lastImageUploaded, videoProcessed]);

  return (
    <div className="w-full h-full flex items-center justify-center gap-3 flex-col">
      <div
        className={cn(
          "flex items-center justify-evenly w-full h-full",
          isTimeOver || frameImgStatus != "loaded" || selected ? "pointer-events-none" : null
        )}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <div className="relative h-full flex items-center justify-center">
            <div className="frame-container">
              <Reorder.Group
                values={slots}
                onReorder={(newSlotOrder) => {
                  const swappedIndices = findSwappedIndices(slots, newSlotOrder);
                  setSlots(newSlotOrder);
                  setSelectedImage((prevImages) => {
                    const reorderedImages = [...prevImages];
                    const [removed] = reorderedImages.splice(swappedIndices.fromIndex, 1);
                    reorderedImages.splice(swappedIndices.toIndex, 0, removed);
                    return reorderedImages;
                  });
                }}
                as="div"
                className="flex absolute flex-col z-50"
                style={{
                  gap:
                    isSingle == 2 && photo
                      ? (photo.theme!.frame.slotPositions[0].y / isSingle) * 0.7
                      : photo
                      ? OFFSET_Y * 2 + photo.theme!.frame.slotPositions[0].y
                      : 0,
                  top: photo ? photo.theme!.frame.slotPositions[0].y + OFFSET_Y / isSingle : 0,
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
                        handleSelect(selectedImage[index]);
                      }
                    }}
                  >
                    <div
                      style={{
                        width: FRAME_WIDTH / isSingle,
                        height: photo ? photo.theme!.frame.slotDimensions.height : 0,
                      }}
                      className="hover:cursor-grab active:cursor-grabbing z-50 bg-transparent"
                    ></div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>

              {frameImg && photo && (
                <Stage
                  width={IMAGE_WIDTH / isSingle}
                  height={IMAGE_HEIGHT}
                >
                  <Layer>
                    <Rect
                      width={IMAGE_WIDTH / isSingle}
                      height={IMAGE_HEIGHT}
                      fill="white"
                    />
                  </Layer>
                  <Layer
                    x={OFFSET_X / isSingle}
                    y={OFFSET_Y / isSingle}
                  >
                    {selectedImage.map((item, index) => (
                      <SelectedImage
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
                  <Layer
                    x={OFFSET_X / isSingle}
                    y={OFFSET_Y / isSingle}
                  >
                    <KonvaImage
                      image={frameImg}
                      height={FRAME_HEIGHT}
                      width={FRAME_WIDTH / isSingle}
                    />
                  </Layer>
                </Stage>
              )}

              <SelectInstruction open={isTimeOver} />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap w-[60%] gap-11 items-start justify-center ">
          {photo && (
            <div className="flex gap-2">
              <h1 className="text-5xl font-semibold mb-4 flex gap-2 uppercase">{t("Choose pictures")} </h1>
              <span className="text-rose-500 text-5xl font-bold ">
                <SlidingNumber
                  value={timeLeft}
                  padStart={true}
                />
              </span>
            </div>
          )}

          <div className="flex gap-4 items-center justify-center flex-wrap ">
            {photo && (
              <>
                {photo.images.map((item, index) => (
                  <div
                    key={index}
                    className={cn(
                      "bg-gray-200 rounded border-4 border-transparent hover:border-black hover:cursor-pointer",
                      selectedImage.some((img) => img?.id === item.id) ? "border-rose-500 hover:border-rose-500" : null
                    )}
                    onClick={() => handleSelect(item)}
                  >
                    <Image
                      height={280}
                      width={280}
                      src={item.data}
                      alt="image"
                      priority
                      className={cn(
                        "pointer-events-none",
                        `w-[${photo.theme!.frame.slotDimensions.width * 1.1}px] h-[${photo.theme!.frame.slotDimensions.height * 1.1}px]`
                      )}
                    />
                  </div>
                ))}
              </>
            )}
          </div>
          {photo && (
            <div className="relative w-full h-full">
              {(photo.theme!.frame.slotCount - filteredSelectedImages.length == 0 || isTimeOver) && (
                <>
                  <GlowEffect
                    colors={["#FF5733", "#33FF57", "#3357FF", "#F1C40F"]}
                    mode="colorShift"
                    blur="soft"
                    duration={3}
                    scale={1}
                    className="z-[0]"
                  />
                </>
              )}
              <Button
                asChild
                className="relative"
                onClick={() => setSelected(true)}
              >
                <Link
                  href="#"
                  className={cn(
                    "flex items-center justify-center gap-2 text-2xl px-14 py-6 w-full",
                    photo
                      ? photo.theme!.frame.slotCount - filteredSelectedImages.length != 0 || isTimeOver || !lastImageUploaded || !videoProcessed
                        ? "pointer-events-none opacity-80"
                        : null
                      : null,
                    selected ? "pointer-events-none opacity-[85%]" : null
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    handleContextSelect(filteredSelectedImages);
                  }}
                >
                  {t("Choose a filter")}
                  {!lastImageUploaded || !videoProcessed ? (
                    <LoadingSpinner size={15} />
                  ) : (
                    <MdOutlineCloudDone
                      size={15}
                      color="white"
                    />
                  )}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrintPage;
