"use client";
import {Button} from "@/components/ui/button";
import {usePhoto} from "@/context/PhotoContext";
import {cn} from "@/lib/utils";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Layer, Rect, Stage} from "react-konva";
import useImage from "use-image";
import {Image as KonvaImage} from "react-konva";
import Image from "next/image";
import SelectedImage from "@/components/SelectedImage";
import Link from "next/link";
import {FRAME_HEIGHT, FRAME_WIDTH, IMAGE_HEIGHT, IMAGE_WIDTH, OFFSET_X, OFFSET_Y} from "@/constants/constants";
import {DragDropContext, Droppable, Draggable, DropResult, DragUpdate} from "react-beautiful-dnd";
import {uploadImageToR2} from "@/lib/r2";
import {MdOutlineCloudDone} from "react-icons/md";
import LoadingSpinner from "@/components/LoadingSpinner";
import SelectInstruction from "@/components/SelectInstruction";
import {useSocket} from "@/context/SocketContext";
import {useTranslation} from "react-i18next";
import {GlowEffect} from "@/components/ui/glow-effect";
import {SlidingNumber} from "@/components/ui/sliding-number";
import {useViewportScale} from "@/hooks/useViewportScale";
import usePreventNavigation from "@/hooks/usePreventNavigation";
import {ROUTES} from "@/constants/routes";

const PrintPage = () => {
  const {photo, setPhoto} = usePhoto();
  const {navigateTo} = usePreventNavigation();
  const {socket, isConnected} = useSocket();
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
    if (socket && isConnected && photo && !videoRequestSent.current) {
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
  }, [isConnected, photo, setPhoto, socket]);

  useEffect(() => {
    if (!photo) return navigateTo(ROUTES.HOME);
    if (photo.selectedImages.length === photo.theme!.frame.slotCount) return navigateTo(ROUTES.FILTER);

    const uploadImage = async () => {
      if (!setPhoto) return;
      if (!lastImageUploaded) {
        const latestImage = photo.images[photo.images.length - 1];
        const r2Response = await uploadImageToR2(latestImage.data);

        if (r2Response.ok) {
          const data = await r2Response.json();
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
          setPhoto((prevStyle) => prevStyle && {...prevStyle, error: true, images: []});
          navigateTo(ROUTES.LAYOUT);
        }
      }
    };

    uploadImage();
  }, [photo, navigateTo, setPhoto, lastImageUploaded]);
  const [frameImg] = useImage(photo ? photo.theme!.frame.src : "");

  const [selectedImage, setSelectedImage] = useState<Array<{id: string; data: string; href: string} | null>>(
    Array.from({length: photo ? photo.theme!.frame.slotCount : 0}, () => null)
  );
  const [timeLeft, setTimeLeft] = useState(99999);
  const [isTimeOver, setIsTimeOver] = useState(false);
  const photoRef = useRef(photo);
  const [lastRemovedImage, setLastRemovedImage] = useState<number>(photo ? photo.theme!.frame.slotCount - 1 : 0);
  const isSingle = useMemo(() => {
    if (!photo) return 1;
    return photo.frameType == "singular" ? 1 : 2;
  }, [photo]);
  const [selected, setSelected] = useState(false);
  const scaleContainerRef = useViewportScale({baseHeight: 650});
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const [slots, setSlots] = useState<number[]>(() => Array.from({length: photo ? photo.theme!.frame.slotCount : 0}, (_, index) => index));

  const handleDragUpdate = (update: DragUpdate) => {
    if (!update.destination) {
      return;
    }

    const sourceIndex = update.source.index;
    const destinationIndex = update.destination.index;
    setSelectedImageIndex(destinationIndex);
    setSelectedImage((prevImages) => {
      const reorderedImages = [...prevImages];
      const [removed] = reorderedImages.splice(selectedImageIndex ? selectedImageIndex : sourceIndex, 1);
      reorderedImages.splice(destinationIndex, 0, removed);
      return reorderedImages;
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    const sourceDroppableId = result.source.droppableId;
    const destinationDroppableId = result.destination.droppableId;

    if (sourceIndex === destinationIndex && sourceDroppableId === destinationDroppableId) {
      return;
    }
    const reorderedSlots = Array.from(slots);
    const [removed] = reorderedSlots.splice(sourceIndex, 1);
    reorderedSlots.splice(destinationIndex, 0, removed);
    setSlots(reorderedSlots);
    setSelectedImageIndex(null);
  };

  const handleContextSelect = useCallback(
    async (images: Array<{id: string; data: string; href: string}>) => {
      try {
        setPhoto!((prevStyle) => {
          if (prevStyle) {
            return {
              ...prevStyle,
              selectedImages: images,
            };
          }
        });
        navigateTo(ROUTES.FILTER);
      } catch (error) {
        console.error("Failed to upload images:", error);
      }
    },
    [navigateTo, setPhoto]
  );

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(timerId);
    } else {
      setIsTimeOver(true);
    }
  }, [timeLeft]);

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
      <div className={cn("flex items-center justify-evenly w-full h-full", isTimeOver || selected ? "pointer-events-none" : null)}>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="relative h-full flex items-center justify-center">
            <div
              ref={scaleContainerRef}
              className="transform-gpu scale-[calc(var(--scale-factor,0.75))] origin-center"
            >
              <DragDropContext
                onDragEnd={handleDragEnd}
                onDragUpdate={handleDragUpdate}
              >
                <Droppable
                  droppableId="photo-slots"
                  direction="vertical"
                  isDropDisabled={false}
                  isCombineEnabled={false}
                  ignoreContainerClipping={false}
                >
                  {(provided) => (
                    <div
                      className="flex absolute flex-col"
                      style={{
                        top: photo ? photo.theme!.frame.slotPositions[0].y + OFFSET_Y / isSingle : 0,
                        left: OFFSET_X / isSingle,
                        gap:
                          isSingle == 2 && photo
                            ? (photo.theme!.frame.slotPositions[0].y / isSingle) * 0.7
                            : photo
                            ? OFFSET_Y * 2 + photo.theme!.frame.slotPositions[0].y
                            : 0,
                      }}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {slots.map((slotIndex, index) => (
                        <Draggable
                          key={`slot-${slotIndex}`}
                          draggableId={`slot-${slotIndex}`}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              className="z-50"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => {
                                if (selectedImage[index]) {
                                  handleSelect(selectedImage[index]);
                                }
                              }}
                            >
                              <div
                                style={{
                                  width: FRAME_WIDTH / isSingle,
                                  height: photo ? photo.theme!.frame.slotDimensions.height : 0,
                                  backgroundColor: "transparent",
                                }}
                                className="hover:cursor-grab active:cursor-grabbing z-50"
                              ></div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

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
                    {slots.map((slotIndex) => (
                      <SelectedImage
                        key={`image-${slotIndex}`}
                        url={selectedImage[slotIndex]?.data}
                        y={photo.theme!.frame.slotPositions[slotIndex].y}
                        x={photo.theme!.frame.slotPositions[slotIndex].x}
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
              <h1 className="text-5xl font-bold mb-4 flex gap-2">{t("Choose pictures")} </h1>
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
