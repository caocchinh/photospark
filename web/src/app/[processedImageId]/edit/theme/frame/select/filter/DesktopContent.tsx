/* eslint-disable @next/next/no-img-element */
"use client";
import {usePhoto} from "@/context/PhotoContext";
import {useCallback, useEffect, useRef, useState} from "react";
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
import {useRouter} from "next/navigation";
import {createImage, createVideo} from "@/server/actions";
import {FaArrowLeft} from "react-icons/fa";
import Link from "next/link";
import {TbWand} from "react-icons/tb";
import {
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {AlertDialog} from "@/components/ui/alert-dialog";

const DesktopContent = () => {
  const {photo, setPhoto} = usePhoto();
  const filterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const uploadAttemptedRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (!photo) return router.push(`/`);
    if (photo.selectedImages.length == 0) return router.push(`/${photo?.previousProcessedImageId}/${ROUTES.HOME}`);
  }, [photo, router, setPhoto]);

  const [frameImg, frameImgStatus] = useImage(photo?.theme?.frame?.src || "");

  const [filter, setFilter] = useState<string | null>(null);
  const stageRef = useRef<StageElement | null>(null);
  const [isMediaUploaded, setIsMediaUploaded] = useState(false);

  const filterRef = useRef(filter);

  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

  const uploadImageToDatabase = useCallback(async () => {
    if (!photo || uploadAttemptedRef.current) return;

    uploadAttemptedRef.current = true;

    for (const image of photo.images) {
      const slotPosition = photo.selectedImages.findIndex((selectedImage) => selectedImage.id == image.id);
      try {
        const imageResponse = await createImage(
          image.href,
          photo.id!,
          slotPosition != -1 ? photo.theme!.frame.slotPositions[slotPosition].x : null,
          slotPosition != -1 ? photo.theme!.frame.slotPositions[slotPosition].y : null,
          photo.theme!.frame.slotDimensions.height,
          photo.theme!.frame.slotDimensions.width
        );

        if (imageResponse.error) {
          throw new Error("Failed to upload image to database");
        } else {
          console.log("Image uploaded to database successfully");
        }
      } catch (error) {
        console.error("Error uploading image to database:", error);
      }
    }

    if (photo.video.r2_url) {
      try {
        const videoResponse = await createVideo(photo.video.r2_url, photo.id!);
        if (videoResponse.error) {
          throw new Error("Failed to upload video to database");
        } else {
          console.log("Video uploaded to database successfully");
        }
      } catch (error) {
        console.error("Error uploading video to database:", error);
      }
    }

    setIsMediaUploaded(true);
  }, [photo]);

  const selectRandomFilter = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * FILTERS.length);
    setFilter(FILTERS[randomIndex].value);

    filterRefs.current[randomIndex]?.scrollIntoView({
      behavior: "instant",
      block: "center",
    });
  }, []);

  return (
    <div
      className={cn(
        "w-full flex items-center justify-center flex-col transition duration-300",
        frameImgStatus != "loaded" ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
    >
      {photo && frameImg && (
        <div className="flex items-center justify-evenly gap-3 h-max flex-col">
          <div className="flex items-center justify-center flex-row gap-6">
            <div className="frame-container">
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
                Random Filter - {FILTERS.find((item) => item.value == filter)?.name}
              </Button>
              <Button
                className="w-full flex items-center justify-center gap-1 rounded-sm cursor-pointer"
                onClick={() => setFilter(null)}
              >
                Reset Filter
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="flex text-sm text-center items-center justify-center gap-2 bg-foreground text-background rounded px-4 py-6 hover:opacity-[85%] w-full relative z-10 cursor-pointer">
                      Tạo hình
                      <TbWand
                        size={20}
                        color="white"
                      />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-center uppercase">Bạn có chắc chưa?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex items-center justify-center gap-4 flex-col">
                      <AlertDialogCancel className="bg-red-600 hover:bg-red-700 w-full text-white hover:text-white cursor-pointer">
                        Hủy
                      </AlertDialogCancel>
                      <AlertDialogAction className="bg-green-600 hover:bg-green-700 w-full text-white hover:text-white cursor-pointer">
                        Chắc
                      </AlertDialogAction>
                    </AlertDialogFooter>
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
                  Chọn lại hình
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesktopContent;
