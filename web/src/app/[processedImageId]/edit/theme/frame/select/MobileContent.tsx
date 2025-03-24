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
import {Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle} from "@/components/ui/drawer";
import {ScrollArea} from "@/components/ui/scroll-area";
import {IoMdImages} from "react-icons/io";
import {GoArrowSwitch} from "react-icons/go";
import {SheetContent, SheetDescription, SheetHeader, SheetTitle} from "@/components/ui/sheet";
import {Sheet} from "@/components/ui/sheet";

const MobileContent = () => {
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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
          <div className={cn("flex items-center flex-col justify-evenly w-full h-full", isSelected ? "pointer-events-none" : null)}>
            <h1
              className="text-5xl font-semibold mb-4 flex gap-2 uppercase text-center"
              id="mobile-frame-title"
            >
              Chọn hình
            </h1>

            <div className="flex flex-col md:flex-row items-center justify-center w-full h-full gap-4">
              <div className="relative h-full flex items-center justify-center">
                <Drawer
                  open={isDrawerOpen}
                  onOpenChange={setIsDrawerOpen}
                >
                  <DrawerContent className="h-[90vh] min-w-screen flex items-center justify-start flex-col">
                    <DrawerHeader className="w-[80%] flex items-center justify-center gap-3">
                      <DrawerTitle className="text-xl font-semibold uppercase text-center">Bấm vào hình để chọn</DrawerTitle>
                      <Button
                        onClick={() => setIsSheetOpen(true)}
                        className="w-full flex items-center justify-center gap-2 text-sm px-14 py-3 rounded-sm cursor-pointer"
                      >
                        <GoArrowSwitch className="rotate-90" />
                        Đổi vị trí hình
                      </Button>
                      <DrawerClose
                        className="w-full"
                        asChild
                      >
                        <Button className="w-full rounded-sm bg-green-600 hover:bg-green-700 cursor-pointer">Hoàn tất</Button>
                      </DrawerClose>
                    </DrawerHeader>
                    <ScrollArea className="h-[70%] w-full flex items-center justify-center">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-[90%] m-auto ">
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
                    </ScrollArea>
                  </DrawerContent>
                </Drawer>
                <Sheet
                  open={isSheetOpen}
                  onOpenChange={setIsSheetOpen}
                >
                  <SheetContent className="sm:!max-w-sm flex flex-col items-center justify-start">
                    <SheetHeader className="!pb-0">
                      <SheetTitle className="text-2xl font-semibold uppercase text-center flex items-center justify-center gap-2">
                        Đổi vị trí hình <GoArrowSwitch className="rotate-90" />
                      </SheetTitle>
                      <SheetDescription className="text-red-500 text-lg text-center">Kéo hình để đổi vị trí</SheetDescription>
                    </SheetHeader>
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
                      className="grid grid-cols-1 gap-3 items-center justify-center p-4"
                    >
                      {slots.map((slotIndex, index) => (
                        <Reorder.Item
                          value={slotIndex}
                          key={slotIndex}
                          z={100}
                          as="div"
                          className="flex items-center justify-center"
                          draggable={true}
                        >
                          <div
                            className="hover:cursor-grab active:cursor-grabbing z-50 flex items-center justify-center"
                            style={{
                              width: photo.theme!.frame.slotDimensions.width,
                            }}
                          >
                            {selectedImage[index]?.href ? (
                              <Image
                                src={selectedImage[index]?.href}
                                alt="image"
                                width={350}
                                height={350}
                                className="pointer-events-none object-cover w-full h-full"
                              />
                            ) : (
                              <div
                                className=" bg-gray-200 rounded-sm w-full"
                                style={{
                                  height: photo.theme!.frame.slotDimensions.height,
                                }}
                              ></div>
                            )}
                          </div>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  </SheetContent>
                </Sheet>
                <div
                  className="cursor-pointer"
                  id="mobile-frame-container"
                  onClick={() => setIsDrawerOpen(true)}
                >
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
              <div className="flex flex-col w-full md:w-[35%] gap-5 items-start justify-center ">
                {photo && (
                  <div className="w-full flex gap-4 flex-col items-center justify-center">
                    <Button
                      onClick={() => setIsDrawerOpen(true)}
                      className="w-full flex items-center justify-center gap-2 text-sm px-14 py-6 cursor-pointer"
                    >
                      <IoMdImages />
                      Chọn hình
                    </Button>
                    <Button
                      onClick={() => setIsSheetOpen(true)}
                      className="w-full flex items-center justify-center gap-2 text-sm px-14 py-6 cursor-pointer"
                    >
                      <GoArrowSwitch className="rotate-90" />
                      Đổi vị trí hình
                    </Button>
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
        </div>
      )}
    </>
  );
};

export default MobileContent;
