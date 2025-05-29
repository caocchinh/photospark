"use client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { FrameOptions } from "@/constants/constants";
import { usePhoto } from "@/context/PhotoContext";
import { cn } from "@/lib/utils";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { GlowEffect } from "@/components/ui/glow-effect";
import { ValidThemeType } from "@/constants/types";
import { ROUTES } from "@/constants/routes";
import { useTranslation } from "react-i18next";
import {
  MdOutlineArrowForwardIos,
  MdOutlineArrowBackIos,
} from "react-icons/md";
import { useReloadConfirm } from "@/hooks/useReloadConfirm";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const FrameEditpage = () => {
  useReloadConfirm();
  const { photo, setPhoto } = usePhoto();
  const [api, setApi] = useState<CarouselApi>();
  const filteredFrames = useMemo(() => {
    if (!photo || !photo.theme) return [];
    return FrameOptions[photo.theme.name].filter(
      (item) => item.type == photo.frameType
    );
  }, [photo]);
  const [current, setCurrent] = useState(0);
  const initializationDoneRef = useRef(false);
  const [chosen, setChosen] = useState<boolean>(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (!photo?.frameType || !photo?.theme) {
      window.location.href = `/${photo?.previousProcessedImageId}${ROUTES.HOME}`;
      return;
    }
  }, [photo]);

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
    if (!api || filteredFrames.length === 0) return;
    // Calculate new index with wraparound
    const newIndex = current - 1 <= 0 ? filteredFrames.length : current - 1;

    // Update carousel position
    api.scrollTo(newIndex - 1);

    // Update state directly
    setCurrent(newIndex);
    handleFrameChange(filteredFrames[newIndex - 1]);
    console.log("Left clicked, new index:", newIndex);
  }, [api, current, filteredFrames, handleFrameChange]);

  const handleRightClick = useCallback(() => {
    if (!api || filteredFrames.length === 0) return;
    // Calculate new index with wraparound
    const newIndex = (current % filteredFrames.length) + 1;

    // Update carousel position
    api.scrollTo(newIndex - 1);

    // Update state directly
    setCurrent(newIndex);
    handleFrameChange(filteredFrames[newIndex - 1]);
    console.log("Right clicked, new index:", newIndex);
  }, [api, current, filteredFrames, handleFrameChange]);

  const handleCarouselItemClick = useCallback(
    (index: number) => {
      if (!api || filteredFrames.length === 0) return;
      console.log("Item clicked, index:", index);

      // Update carousel position
      api.scrollTo(index);

      // Update state directly
      setCurrent(index + 1);
      handleFrameChange(filteredFrames[index]);
      console.log("States updated:", index + 1);
    },
    [api, filteredFrames, handleFrameChange]
  );

  useEffect(() => {
    if (initializationDoneRef.current || !photo || !api) return;

    const initIndex = filteredFrames.findIndex(
      (item) => item.thumbnail === photo?.theme!.frame.thumbnail
    );

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
      console.log("api", api);
      if (!api) return;
      const selectedIndex = api.selectedScrollSnap();
      console.log("api", selectedIndex);
      setCurrent(selectedIndex + 1);
      handleCarouselItemClick(selectedIndex);
      handleFrameChange(filteredFrames[selectedIndex]);
    };

    api.on("select", handleAPISelect);
    return () => {
      api.off("select", handleAPISelect);
    };
  }, [api, filteredFrames, handleCarouselItemClick, handleFrameChange, photo]);

  return (
    <>
      {photo && photo.theme && (
        <div
          className={cn(
            "flex items-center w-full justify-center h-full",
            chosen ? "pointer-events-none" : null
          )}
        >
          <div className="w-[90%] sm:w-[80%] flex flex-col gap-6 ">
            <div className="flex flex-col items-center justify-between w-full gap-4 sm:flex-row sm:gap-0">
              <Link
                href={`/${photo?.previousProcessedImageId}/${ROUTES.THEME}`}
                className="w-[250px] flex text-center items-center justify-center gap-2 bg-foreground text-background rounded px-4 py-2 hover:opacity-[85%] order-1 sm:order-0 active:opacity-80"
              >
                <FaArrowLeft />
                {t("Choose another theme")}
              </Link>
              <Breadcrumb className="order-0 sm:order-1 -mt-[45px] sm:mt-0 mb-[35px] sm:mb-0 self-end sm:self-center">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <Link href={`/${photo?.previousProcessedImageId}/`}>
                      {t("Home")}
                    </Link>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-1 cursor-pointer">
                        <BreadcrumbEllipsis className="w-4 h-4" />
                        <span className="sr-only">Toggle menu</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem className="cursor-pointer active:bg-slate-200 hover:bg-slate-200">
                          <Link
                            href={`/${photo?.previousProcessedImageId}/edit/`}
                            className="w-full"
                          >
                            {t("Layout")}
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <Link
                      href={`/${photo?.previousProcessedImageId}/edit/theme/`}
                    >
                      {t("Theme")}
                    </Link>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <p className="text-black cursor-pointer">{t("Frame")}</p>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <h1 className="text-5xl font-semibold text-center uppercase">
              {t("Choose a frame")}
            </h1>

            <div className="relative flex flex-col items-center justify-center w-full gap-5 px-2 my-4">
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
                      onClick={() => {
                        handleCarouselItemClick(index);
                      }}
                      className="pl-4 md:pl-8 relative max-w-[290px] mb-8 sm:basis-[100%] md:basis-1/2 lg:basis-1/3 hover:cursor-pointer "
                    >
                      <div
                        className={cn(
                          current == index + 1
                            ? "border-red-500"
                            : "border-transparent",
                          " border-6 rounded-md",
                          "flex flex-row"
                        )}
                      >
                        {Array.from(
                          { length: item.type == "singular" ? 1 : 2 },
                          (_, _index) => {
                            return (
                              <Image
                                key={_index}
                                src={item.src}
                                alt="Frame"
                                height={235}
                                width={item.type == "singular" ? 235 : 120}
                                className={cn(
                                  item.type == "singular" ? "w-full" : "w-1/2",
                                  current != index + 1
                                    ? "blur-[2px] grayscale-25"
                                    : null
                                )}
                              />
                            );
                          }
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              <div className="flex items-center justify-center gap-4 -mt-4">
                <MdOutlineArrowBackIos
                  size={30}
                  className="text-primary hover:cursor-pointer carousel-pointer"
                  onClick={handleLeftClick}
                />

                {Array.from({ length: filteredFrames.length }, (_, index) => (
                  <div
                    key={index}
                    className="min-w-[15px] min-h-[15px] rounded-[2px] border-2 border-primary hover:cursor-pointer core-navigate"
                    style={{
                      background: current === index + 1 ? "black" : "#e2e8f0",
                    }}
                    onClick={() => handleCarouselItemClick(index)}
                  ></div>
                ))}
                <MdOutlineArrowForwardIos
                  size={30}
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
                  "flex text-center items-center justify-center gap-2 text-background rounded px-4 py-2 hover:opacity-[90%] w-full bg-green-700 z-10 relative active:opacity-80"
                )}
                onClick={() => setChosen(true)}
              >
                {t("Choose images")}
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
