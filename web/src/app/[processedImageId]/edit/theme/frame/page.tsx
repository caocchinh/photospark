"use client";
import {Carousel, CarouselContent, CarouselItem, type CarouselApi} from "@/components/ui/carousel";
import {FrameOptions} from "@/constants/constants";
import {usePhoto} from "@/context/PhotoContext";
import {cn} from "@/lib/utils";
import {WheelGesturesPlugin} from "embla-carousel-wheel-gestures";
import Image from "next/image";
import Link from "next/link";
import {useCallback, useEffect, useRef, useState, useMemo} from "react";
import {FaArrowLeft} from "react-icons/fa6";
import {IoIosArrowBack, IoIosArrowForward} from "react-icons/io";
import {useRouter} from "next/navigation";
import {GlowEffect} from "@/components/ui/glow-effect";

import {ValidThemeType} from "@/constants/types";
import {ROUTES} from "@/constants/routes";

const FrameEditpage = () => {
  const {photo, setPhoto} = usePhoto();
  const router = useRouter();
  const [api, setApi] = useState<CarouselApi>();
  const filteredFrames = useMemo(() => {
    if (!photo || !photo.theme) return [];
    return FrameOptions[photo.theme.name].filter((item) => item.type == photo.frameType);
  }, [photo]);

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

    initializationDoneRef.current = true;
  }, [api, filteredFrames, photo]);

  useEffect(() => {
    if (!api || !photo) {
      return;
    }

    const handleAPISelect = () => {
      if (!api) return;
      const selectedIndex = api.selectedScrollSnap();
      handleCarouselItemClick(selectedIndex);
      handleFrameChange(filteredFrames[selectedIndex]);
    };

    api.on("select", handleAPISelect);
    return () => {
      api.off("select", handleAPISelect);
    };
  }, [api, filteredFrames, handleCarouselItemClick, handleFrameChange, photo]);

  const handleCaptureClick = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();

      if (!photo || !photo.theme || !setPhoto) return;

      setChosen(true);
      setPhoto((prevStyle) => {
        if (prevStyle) {
          return {...prevStyle, error: false};
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
        <>
          <div className={cn("flex items-center w-[90%] justify-center gap-24 h-full", chosen ? "pointer-events-none" : null)}>
            <div className="flex items-center flex-col justify-center gap-4 w-max">
              <h1 className="text-5xl font-semibold uppercase">Chọn frame</h1>
              <div className="relative rounded border-2 border-gray-500 flex items-center justify-center py-8 px-2 bg-gray-100 w-[50vw]">
                <IoIosArrowBack
                  size={60}
                  className="text-primary hover:cursor-pointer carousel-pointer"
                  onClick={handleLeftClick}
                />
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
                        className="flex gap-4 basis-[100%] items-center justify-center "
                      >
                        {Array.from({length: item.type == "singular" ? 1 : 2}, (_, index) => {
                          return (
                            <Image
                              key={index}
                              src={item.src}
                              alt="Frame"
                              height={235}
                              width={item.type == "singular" ? 235 : 120}
                              className={cn(item.type == "singular" ? "w-[17vw]" : "w-[9vw]")}
                            />
                          );
                        })}
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
                <IoIosArrowForward
                  size={60}
                  className="text-primary hover:cursor-pointer carousel-pointer"
                  onClick={handleRightClick}
                />
              </div>
              <div className="w-[50vw]"></div>
            </div>
            <div className="flex flex-col items-center justify-center gap-8 h-[80vh]">
              <div className="flex flex-col gap-4 w-full">
                <Link
                  href={`/${photo?.previousProcessedImageId}/${ROUTES.THEME}`}
                  className="flex  text-center items-center justify-center gap-2 bg-foreground text-background rounded px-4 py-2 hover:opacity-[85%] w-full"
                >
                  <FaArrowLeft />
                  Chọn theme khác
                </Link>
                <Link
                  href={`/${photo?.previousProcessedImageId}/${ROUTES.HOME}`}
                  className="flex text-center items-center justify-center gap-2 bg-foreground text-background rounded px-4 py-2 hover:opacity-[85%] w-full"
                >
                  <FaArrowLeft />
                  Chọn layout khác
                </Link>
                <div className="relative">
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
                    onClick={handleCaptureClick}
                  >
                    Chọn ảnh
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default FrameEditpage;
