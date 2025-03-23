"use client";
import {Carousel, CarouselContent, CarouselItem, type CarouselApi} from "@/components/ui/carousel";
import {FrameOptions} from "@/constants/constants";
import {usePhoto} from "@/context/PhotoContext";
import {cn} from "@/lib/utils";
import {WheelGesturesPlugin} from "embla-carousel-wheel-gestures";
import Image from "next/image";
import Link from "next/link";
import {useCallback, useEffect, useRef, useState, useMemo} from "react";
import {FaArrowLeft, FaArrowRight} from "react-icons/fa6";
import {useRouter} from "next/navigation";
import {GlowEffect} from "@/components/ui/glow-effect";

import {ValidThemeType} from "@/constants/types";
import {ROUTES} from "@/constants/routes";
import {MdOutlineKeyboardDoubleArrowLeft, MdOutlineKeyboardDoubleArrowRight} from "react-icons/md";

const FrameEditpage = () => {
  const {photo, setPhoto} = usePhoto();
  const router = useRouter();
  const [api, setApi] = useState<CarouselApi>();
  const filteredFrames = useMemo(() => {
    if (!photo || !photo.theme) return [];
    return FrameOptions[photo.theme.name].filter((item) => item.type == photo.frameType);
  }, [photo]);
  const [current, setCurrent] = useState(0);
  const initializationDoneRef = useRef(false);
  const [chosen, setChosen] = useState<boolean>(false);

  useEffect(() => {
    if (!photo?.theme) return router.push(`/${photo?.previousProcessedImageId}/${ROUTES.HOME}`);
    if (photo.selectedImages.length > 0) return router.push(`/${photo?.previousProcessedImageId}/${ROUTES.SELECT}`);
  }, [photo, router]);

  const handleFrameChange = useCallback(
    (frameAttribute: (typeof FrameOptions)[ValidThemeType][number]) => {
      if (!setPhoto) return;
      setPhoto((prevStyle) => {
        if (!prevStyle || !prevStyle.theme) return prevStyle;
        return {
          ...prevStyle,
          theme: {
            ...prevStyle.theme,
            name: prevStyle.theme.name,
            frame: frameAttribute,
          },
        };
      });
    },
    [setPhoto]
  );

  const handleLeftClick = useCallback(() => {
    if (!api) return;
    api.scrollPrev();
  }, [api]);

  const handleRightClick = useCallback(() => {
    if (!api) return;
    api.scrollNext();
  }, [api]);

  const handleCarouselItemClick = useCallback(
    (index: number) => {
      if (!api) return;
      api.scrollTo(index);
    },
    [api]
  );

  useEffect(() => {
    if (initializationDoneRef.current || !photo || !api) return;

    const initIndex = filteredFrames.findIndex((item) => item.thumbnail === photo?.theme!.frame.thumbnail);

    if (initIndex !== -1) {
      api.scrollTo(initIndex);
    }
    setCurrent(initIndex + 1);

    initializationDoneRef.current = true;
  }, [api, filteredFrames, photo]);

  useEffect(() => {
    if (!api || !photo) {
      return;
    }

    const handleAPISelect = () => {
      if (!api) return;
      const selectedIndex = api.selectedScrollSnap();
      setCurrent(selectedIndex + 1);
      handleCarouselItemClick(selectedIndex);
      handleFrameChange(filteredFrames[selectedIndex]);
    };

    api.on("select", handleAPISelect);
    return () => {
      api.off("select", handleAPISelect);
    };
  }, [api, filteredFrames, handleCarouselItemClick, handleFrameChange, photo]);

  const handleFrameChosen = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();

      if (!photo || !photo.theme || !setPhoto) return;

      setChosen(true);
      setPhoto((prevStyle) => {
        if (prevStyle) {
          return {...prevStyle};
        }
        return prevStyle;
      });

      router.push(`/${photo?.previousProcessedImageId}/${ROUTES.SELECT}`);
      return;
    },
    [photo, setPhoto, router, setChosen]
  );

  return (
    <>
      {photo && photo.theme && (
        <div className={cn("flex items-center w-full justify-center h-full", chosen ? "pointer-events-none" : null)}>
          <div className="w-[90%] sm:w-[80%] flex flex-col gap-6 ">
            <div className="flex items-center justify-center self-start gap-4 flex-wrap">
              <Link
                href={`/${photo?.previousProcessedImageId}/${ROUTES.THEME}`}
                className="flex text-center items-center justify-center gap-2 bg-foreground text-background rounded px-4 py-2 hover:opacity-[85%] "
              >
                <FaArrowLeft />
                Chọn theme khác
              </Link>
              <Link
                href={`/${photo?.previousProcessedImageId}/${ROUTES.HOME}`}
                className="flex text-center items-center justify-center gap-2 bg-foreground text-background rounded px-4 py-2 hover:opacity-[85%] "
              >
                <FaArrowLeft />
                Chọn layout khác
              </Link>
            </div>
            <h1 className="text-5xl font-semibold uppercase text-center">Chọn frame</h1>

            <div className="relative flex items-center justify-center flex-col my-4 px-2 w-full gap-5">
              <Carousel
                setApi={setApi}
                plugins={[WheelGesturesPlugin()]}
                opts={{
                  align: "center",
                  loop: true,
                }}
              >
                <CarouselContent>
                  {filteredFrames.map((item, index) => (
                    <CarouselItem
                      key={index}
                      className="pl-8 relative max-w-[290px] mb-8 sm:basis-[100%] md:basis-1/2 lg:basis-1/3 hover:cursor-pointer "
                    >
                      <div className={cn(current == index + 1 ? "border-red-500" : "border-transparent", " border-6 rounded-md", "flex flex-row")}>
                        {Array.from({length: item.type == "singular" ? 1 : 2}, (_, _index) => {
                          return (
                            <Image
                              key={_index}
                              src={item.src}
                              alt="Frame"
                              height={235}
                              width={item.type == "singular" ? 235 : 120}
                              onClick={() => {
                                handleCarouselItemClick(index);
                              }}
                              className={cn(item.type == "singular" ? "w-full" : "w-1/2")}
                            />
                          );
                        })}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              <div className="flex gap-4 items-center justify-center -mt-4">
                <MdOutlineKeyboardDoubleArrowLeft
                  size={45}
                  className="text-primary hover:cursor-pointer carousel-pointer"
                  onClick={handleLeftClick}
                />

                {Array.from({length: filteredFrames.length}, (_, index) => (
                  <div
                    key={index}
                    className="min-w-[15px] min-h-[15px] border-2 border-primary hover:cursor-pointer core-navigate"
                    style={{
                      background: current === index + 1 ? "black" : "#e2e8f0",
                    }}
                    onClick={() => {
                      api?.scrollTo(index);
                    }}
                  ></div>
                ))}
                <MdOutlineKeyboardDoubleArrowRight
                  size={45}
                  className="text-primary hover:cursor-pointer carousel-pointer"
                  onClick={handleRightClick}
                />
              </div>
            </div>

            <div className="relative w-full">
              <GlowEffect
                colors={["#FF5733", "#33FF57", "#3357FF", "#F1C40F"]}
                mode="colorShift"
                blur="soft"
                duration={3}
                scale={1.02}
              />
              <Link
                href={`/${photo?.previousProcessedImageId}/${ROUTES.SELECT}`}
                className={cn(
                  "flex text-center items-center justify-center gap-2 text-background rounded px-4 py-2 hover:opacity-[85%] w-full bg-green-700 z-10 relative"
                )}
                onClick={handleFrameChosen}
              >
                Chọn ảnh
                <FaArrowRight />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FrameEditpage;
