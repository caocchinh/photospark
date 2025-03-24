"use client";

import {Button} from "@/components/ui/button";
import {usePhoto} from "@/context/PhotoContext";
import {cn, findSwappedIndices} from "@/lib/utils";
import {useCallback, useEffect, useMemo, useState} from "react";
import {Layer, Rect, Stage} from "react-konva";
import useImage from "use-image";
import {Image as KonvaImage} from "react-konva";
import Image from "next/image";
import Link from "next/link";
import {FRAME_HEIGHT, FRAME_WIDTH, IMAGE_HEIGHT, IMAGE_WIDTH, OFFSET_X, OFFSET_Y} from "@/constants/constants";
import {GlowEffect} from "@/components/ui/glow-effect";
import {ROUTES} from "@/constants/routes";
import {Reorder} from "motion/react";
import FrameImage from "@/components/FrameImage";
import {useRouter} from "next/navigation";
import {FaArrowRight, FaArrowLeft} from "react-icons/fa6";

const DesktopContent = () => {
  const {photo, setPhoto} = usePhoto();
  const router = useRouter();
  useEffect(() => {
    if (!photo?.theme) return router.push(`/${photo?.previousProcessedImageId}/${ROUTES.HOME}`);
  }, [photo, router]);
  const [frameImg, frameImgStatus] = useImage(photo?.theme?.frame?.src || "");

  const [selectedImage, setSelectedImage] = useState<Array<{id: string; href: string} | null>>(
    photo?.selectedImages && photo.selectedImages.length > 0
      ? [...photo.selectedImages]
      : Array.from({length: photo?.theme?.frame?.slotCount || 0}, () => null)
  );
  const [lastRemovedImage, setLastRemovedImage] = useState<number>(photo?.theme?.frame?.slotCount ? photo.theme.frame.slotCount - 1 : 0);
  const isSingle = useMemo(() => {
    if (!photo) return 1;
    return photo.frameType == "singular" ? 1 : 2;
  }, [photo]);
  const [isSelected, setIsSelected] = useState(false);
  const [slots, setSlots] = useState<Array<number>>(Array.from({length: photo?.theme?.frame?.slotCount || 0}, (_, index) => index));
  const [isDragging, setIsDragging] = useState(false);

  const handleContextSelect = useCallback(
    async (images: Array<{id: string; href: string}>) => {
      setPhoto!((prevStyle) => {
        if (prevStyle) {
          return {
            ...prevStyle,
            selectedImages: images,
          };
        }
      });
      router.push(ROUTES.FILTER);
    },
    [router, setPhoto]
  );

  const handleSelect = useCallback(
    (image: {id: string; href: string} | null) => {
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

  return (
    <>
      {photo && photo.theme && (
        <div
          className={cn(
            "w-full h-full flex items-center justify-center gap-3 flex-col transition duration-300",
            frameImgStatus != "loaded" ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >
          <div className={cn("flex items-center justify-evenly w-full h-full", isSelected ? "pointer-events-none" : null)}>
            <div className="flex flex-col items-center justify-center h-full">
              <div className="relative h-full flex items-center justify-center">
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
                        <FrameImage
                          key={index}
                          url={item?.href || ""}
                          y={photo.theme!.frame.slotPositions[index].y}
                          x={photo.theme!.frame.slotPositions[index].x}
                          filter={""}
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
              </div>
            </div>
            <div className="flex flex-col w-[60%] gap-5 items-start justify-center ">
              {photo && (
                <div className="flex gap-2 w-full item-center justify-center ">
                  <h1 className="text-5xl font-semibold mb-4 flex gap-2 uppercase"> Chọn hình</h1>
                </div>
              )}

              <div
                className="grid gap-2 items-center justify-center justify-items-center w-full"
                id="image-grid"
              >
                {photo && (
                  <>
                    {photo.images.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-center"
                        onClick={() => handleSelect(item)}
                      >
                        <Image
                          height={280}
                          width={280}
                          src={item.href}
                          alt="image"
                          priority
                          className={cn(
                            "rounded border-4 border-transparent hover:border-black hover:cursor-pointer",
                            `w-[${photo.theme!.frame.slotDimensions.width * 1.1}px] h-[${photo.theme!.frame.slotDimensions.height * 1.1}px]`,
                            selectedImage.some((img) => img?.id === item.id) ? "border-rose-500 hover:border-rose-500" : null
                          )}
                        />
                      </div>
                    ))}
                  </>
                )}
              </div>
              {photo && (
                <div className="w-full flex gap-4 flex-col items-center justify-center">
                  <div className="relative w-full h-full">
                    {photo.theme!.frame.slotCount - filteredSelectedImages.length == 0 && (
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
                      asChild
                      className="relative"
                      onClick={() => setIsSelected(true)}
                    >
                      <Link
                        href={`/${photo?.previousProcessedImageId}/${ROUTES.FILTER}`}
                        className={cn(
                          "flex items-center justify-center gap-2 text-2xl px-14 py-6 w-full",
                          photo
                            ? photo.theme!.frame.slotCount - filteredSelectedImages.length != 0
                              ? "pointer-events-none opacity-80"
                              : null
                            : null,
                          isSelected ? "pointer-events-none opacity-[85%]" : null
                        )}
                        onClick={(e) => {
                          e.preventDefault();
                          handleContextSelect(filteredSelectedImages);
                        }}
                      >
                        Chọn filter
                        <FaArrowRight />
                      </Link>
                    </Button>
                  </div>
                  <Button
                    asChild
                    className="relative"
                    onClick={() => setIsSelected(true)}
                  >
                    <Link
                      href={`/${photo?.previousProcessedImageId}/${ROUTES.FRAME}`}
                      className="flex items-center justify-center gap-2 text-2xl px-14 py-6 w-full"
                    >
                      <FaArrowLeft />
                      Chọn frame khác
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DesktopContent;
