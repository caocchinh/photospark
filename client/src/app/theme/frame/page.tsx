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
import {IoIosArrowBack, IoIosArrowForward, IoIosCheckmark} from "react-icons/io";
import {useRouter} from "next/navigation";
import {useTranslation} from "react-i18next";
import {GlowEffect} from "@/components/ui/glow-effect";
import {ScrollArea} from "@/components/ui/scroll-area";
import {AnimatedBackground} from "@/components/ui/animated-background";
import ErrorDialog from "@/components/ErrorDialog";
import {ROUTES} from "@/constants/routes";
import {Spotlight} from "@/components/ui/spotlight";
import {ValidThemeType} from "@/constants/types";
import {PiVideoCameraLight} from "react-icons/pi";

const LayoutPage = () => {
  const {photo, setPhoto, autoSelectCountdown} = usePhoto();
  const router = useRouter();
  const {t} = useTranslation();
  const maxQuantity = 5;
  const [api, setApi] = useState<CarouselApi>();
  const filteredFrames = useMemo(() => {
    if (!photo || !photo.theme) return [];
    return FrameOptions[photo.theme.name].filter((item) => item.type == photo.frameType);
  }, [photo]);

  const [apiPreview, setApiPreview] = useState<CarouselApi>();
  const [current, setCurrent] = useState(1);
  const initializationDoneRef = useRef(false);
  const thumbnailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [chosen, setChosen] = useState<boolean>(false);

  useEffect(() => {
    if (!photo) return router.push(ROUTES.HOME);
    if (photo.images.length > 0) return router.push(ROUTES.CAPTURE);
  }, [photo, router]);

  const handleQuantityChange = (quantity: number) => {
    if (!setPhoto) return;
    setPhoto((prevStyle) => {
      if (prevStyle) {
        return {
          ...prevStyle,
          quantity: quantity,
        };
      }
      return prevStyle;
    });
  };

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
      if (!api || !apiPreview) return;
      api.scrollTo(index);
      apiPreview.scrollTo(index);
    },
    [api, apiPreview]
  );

  useEffect(() => {
    if (initializationDoneRef.current || !photo || !api || !apiPreview) return;

    const initIndex = filteredFrames.findIndex((item) => item.thumbnail === photo?.theme!.frame.thumbnail);

    if (initIndex !== -1) {
      api.scrollTo(initIndex);
      apiPreview.scrollTo(initIndex);
      setCurrent(initIndex + 1);

      const currentThumbnail = thumbnailRefs.current[initIndex];
      if (currentThumbnail) {
        currentThumbnail.scrollIntoView({
          behavior: "instant",
          block: "center",
        });
      }
    }

    initializationDoneRef.current = true;
  }, [api, apiPreview, filteredFrames, photo]);

  useEffect(() => {
    if (!api || !apiPreview || !photo) {
      return;
    }

    const handleAPISelect = () => {
      if (!api) return;
      const selectedIndex = api.selectedScrollSnap();
      if (thumbnailRefs.current[selectedIndex] == null || !photo.theme) return;
      setCurrent(selectedIndex + 1);
      handleCarouselItemClick(selectedIndex);
      handleFrameChange(filteredFrames[selectedIndex]);
      thumbnailRefs.current[selectedIndex].scrollIntoView({
        behavior: "instant",
        block: "center",
      });
    };

    const handlePreviewAPISelect = () => {
      if (!apiPreview) return;
      const selectedIndex = apiPreview.selectedScrollSnap();
      if (thumbnailRefs.current[selectedIndex] == null || !photo.theme) return;
      setCurrent(selectedIndex + 1);
      handleCarouselItemClick(selectedIndex);
      handleFrameChange(filteredFrames[selectedIndex]);
      thumbnailRefs.current[selectedIndex].scrollIntoView({
        behavior: "instant",
        block: "center",
      });
    };

    api.on("select", handleAPISelect);
    apiPreview.on("select", handlePreviewAPISelect);
    return () => {
      api.off("select", handleAPISelect);
      apiPreview.off("select", handlePreviewAPISelect);
    };
  }, [api, apiPreview, filteredFrames, handleCarouselItemClick, handleFrameChange, photo]);

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

      router.push(ROUTES.CAPTURE);
      return;
    },
    [photo, setPhoto, router, setChosen]
  );

  return (
    <>
      {photo && photo.theme && (
        <>
          <div
            className={cn(
              "flex items-center w-[90%] justify-center gap-24 h-full",
              chosen || autoSelectCountdown <= 0 ? "pointer-events-none" : null
            )}
          >
            <div className="flex items-center flex-col justify-center gap-4 w-max">
              <h1 className="text-5xl font-semibold uppercase">{t("Choose a frame")}</h1>
              <div className="relative rounded border-2 border-gray-500 flex items-center justify-center py-8 px-2 bg-gray-100 w-[50vw]">
                <Spotlight
                  className="from-[#f97316] via-[#f97316] z-10 to-[#fdba74] blur-xl "
                  size={64}
                />
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
              <div className="w-[50vw]">
                <Carousel
                  setApi={setApiPreview}
                  plugins={[WheelGesturesPlugin()]}
                  opts={{
                    align: "center",
                    loop: true,
                  }}
                >
                  <CarouselContent className="p-2">
                    {filteredFrames.map((item, index) => (
                      <CarouselItem
                        key={index}
                        className={cn("flex items-center justify-center cursor-pointer", item.type == "singular" ? " basis-1/4" : "basis-[15%]")}
                        onClick={() => {
                          handleCarouselItemClick(index);
                          handleFrameChange(item);
                        }}
                      >
                        <div
                          className={cn(
                            "bg-gray-100 p-3 rounded border border-gray-300",
                            current - 1 === index ? "scale-[1.05] border-4 border-rose-500" : null
                          )}
                        >
                          <Image
                            className="bg-white w-full max-h-[100px]"
                            src={item.src}
                            height={100}
                            width={100}
                            alt="Frame"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-8 h-[80vh]">
              <div className="flex flex-col items-center justify-center gap-4">
                <h1 className="text-5xl font-semibold uppercase text-wrap w-[100%] text-center">{t("Choose number of copies")}</h1>
                <div className="flex gap-2 flex-wrap items-center justify-center w-[350px]">
                  <AnimatedBackground
                    defaultValue={photo.frameType == "singular" ? photo.quantity!.toString() : (photo.quantity! * 2).toString()}
                    onValueChange={(value) => {
                      handleQuantityChange(parseInt(value!) / (photo.frameType == "singular" ? 1 : 2));
                    }}
                    className="rounded-lg bg-green-700"
                    transition={{
                      ease: "easeInOut",
                      duration: 0.2,
                    }}
                  >
                    {Array.from({length: maxQuantity}, (_, index) => {
                      const quantiy = (index + 1) * (photo.frameType == "singular" ? 1 : 2);
                      return (
                        <div
                          className={cn(
                            " text-2xl text-white w-[90px] hover:cursor-pointer h-[90px] flex items-center justify-center mb-3 rounded-lg border bg-black"
                          )}
                          key={index}
                          data-id={quantiy.toString()}
                        >
                          {quantiy}
                        </div>
                      );
                    })}
                  </AnimatedBackground>
                </div>
              </div>
              <ScrollArea className="w-[350px] h-[35%]">
                <div className="flex gap-4 flex-wrap items-center justify-center w-full">
                  {filteredFrames.map((item, index) => {
                    const thumbnail = item.thumbnail;
                    if (!thumbnail) return null;
                    return (
                      <div
                        ref={(el) => {
                          thumbnailRefs.current[index] = el;
                        }}
                        key={index}
                        onClick={() => {
                          handleFrameChange(item);
                          handleCarouselItemClick(index);
                        }}
                        className="relative h-[100px] w-[100px] object-cover"
                      >
                        <Image
                          src={thumbnail}
                          height={100}
                          width={100}
                          alt="Option"
                          className="hover:cursor-pointer rounded w-full h-full"
                        />

                        <IoIosCheckmark
                          color="#4ade80 "
                          className={cn("absolute w-full h-full top-0 bg-black/50", photo.theme!.frame.thumbnail == thumbnail ? "block" : "hidden")}
                          size={50}
                        />
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <div className="flex flex-col gap-4 w-full">
                <Link
                  href={ROUTES.THEME}
                  className="flex  text-center items-center justify-center gap-2 bg-foreground text-background rounded px-4 py-2 hover:opacity-[85%] w-full"
                >
                  <FaArrowLeft />
                  {t("Choose another theme")}
                </Link>
                <Link
                  href={ROUTES.HOME}
                  className="flex text-center items-center justify-center gap-2 bg-foreground text-background rounded px-4 py-2 hover:opacity-[85%] w-full"
                >
                  <FaArrowLeft />
                  {t("Choose another layout")}
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
                    href={ROUTES.CAPTURE}
                    className={cn(
                      "flex text-center items-center justify-center gap-2 bg-foreground text-background rounded px-4 py-2 hover:opacity-[85%] w-full bg-green-700 z-10 relative"
                    )}
                    onClick={handleCaptureClick}
                  >
                    {t("Capture")}
                    <PiVideoCameraLight
                      size={20}
                      color="white"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          {photo.error && <ErrorDialog />}
        </>
      )}
    </>
  );
};

export default LayoutPage;
