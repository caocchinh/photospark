/* eslint-disable @next/next/no-img-element */
"use client";
import {useCallback, useEffect, useRef, useState} from "react";
import useImage from "use-image";
import {Image as KonvaImage, Rect} from "react-konva";
import {Layer, Stage} from "react-konva";
import FrameImage from "@/components/FrameImage";
import {Button} from "@/components/ui/button";
import {FILTER_SELECT_DURATION, FILTERS, FRAME_HEIGHT, FRAME_WIDTH, IMAGE_HEIGHT, IMAGE_WIDTH, OFFSET_X, OFFSET_Y} from "@/constants/constants";
import {cn} from "@/lib/utils";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Stage as StageElement} from "konva/lib/Stage";
import {useSocket} from "@/context/SocketContext";
import {PiPrinter} from "react-icons/pi";
import {useTranslation} from "react-i18next";
import {GlowEffect} from "@/components/ui/glow-effect";
import {SlidingNumber} from "@/components/ui/sliding-number";
import usePreventNavigation from "@/hooks/usePreventNavigation";
import {createImage, createVideo, updateFilter} from "@/server/actions";
import QRCode from "react-qr-code";
import ReactDOM from "react-dom/client";
import {ROUTES} from "@/constants/routes";
import LoadingSpinner from "@/components/LoadingSpinner";
import {IoIosCheckmark} from "react-icons/io";
import {usePhotoState} from "@/context/PhotoStateContext";

const FilterPage = () => {
  const {photo} = usePhotoState();
  useEffect(() => {
    if (typeof window === "undefined") return;
      if (!photo) {
        window.location.href = ROUTES.HOME;
        return;
      }
      if (!photo.frameType || !photo.theme || photo.images.length < photo.theme.frame.slotCount || photo.selectedImages.length == 0) {
        window.location.href = ROUTES.HOME;
        return;
      }
  }, [photo]);
  const filterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const uploadAttemptedRef = useRef(false);
  const {t} = useTranslation();
  const [frameImg, frameImgStatus] = useImage(photo ? photo.theme!.frame.src : "");
  const [qrCodeURL, setQrCodeURL] = useState<string>("");
  const [qrCodeImage] = useImage(qrCodeURL);
  const [filter, setFilter] = useState<string | null>(null);
  const stageRef = useRef<StageElement | null>(null);
  const {socket, isSocketConnected, isOnline} = useSocket();
  const [isMediaUploaded, setIsMediaUploaded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(FILTER_SELECT_DURATION);
  const [printed, setPrinted] = useState(false);
  const {navigateTo} = usePreventNavigation();
  const filterRef = useRef(filter);
  usePreventNavigation();

  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

  const printImage = useCallback(async () => {
    if (stageRef.current && photo && socket && photo.id && !printed) {
      if (!isSocketConnected) {
        console.error("Socket not connected. Cannot print.");
        return;
      }
      if (printed) return;
      setPrinted(true);
      try {
        const filterReponse = await updateFilter(photo.id, filterRef.current ? filterRef.current : "Original");
        if (filterReponse.error) {
          throw new Error("Failed to update filter");
        } else {
          console.log("Filter updated sucessfully to database!");
        }
      } catch (error) {
        console.error("Error updating filter:", error);
      }

      const dataURL = stageRef.current.toDataURL({pixelRatio: 5});

      socket.emit(
        "print",
        {
          quantity: photo.quantity,
          dataURL: dataURL,
          theme: photo.theme!.name,
        },
        async (response: {success: boolean; message?: string}) => {
          console.log("Print event emitted:", response);
          if (!response.success) {
            console.error("Print failed:", response.message);
          }
          const videoPreload = new Promise((resolve) => {
            if (photo.video.r2_url) {
              const video = document.createElement("video");
              video.src = photo.video.r2_url;
              video.preload = "auto";
              video.onloadeddata = () => resolve(true);
              video.onerror = () => resolve(false);
            } else {
              resolve(false);
              navigateTo(ROUTES.HOME);
            }
          });
          await videoPreload;
          if (isMediaUploaded) {
            navigateTo(ROUTES.REVIEW);
          }
        }
      );
    }
  }, [photo, socket, isSocketConnected, printed, isMediaUploaded, navigateTo]);

  useEffect(() => {
    async function uploadImageToDatabase() {
      if (!photo || !socket || !isSocketConnected || !isOnline || uploadAttemptedRef.current) return;

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
          socket.emit("upload-image-error", {
            url: image.href,
            proccessedImageId: photo.id!,
            width: photo.theme!.frame.slotDimensions.width,
            height: photo.theme!.frame.slotDimensions.height,
            slotPositionX: slotPosition != -1 ? photo.theme!.frame.slotPositions[slotPosition].x : null,
            slotPositionY: slotPosition != -1 ? photo.theme!.frame.slotPositions[slotPosition].y : null,
          });
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
          socket.emit("upload-video-error", {url: photo.video.r2_url, proccessedImageId: photo.id});
        }
      }

      setIsMediaUploaded(true);
    }

    if (!isMediaUploaded) {
      uploadImageToDatabase();
    }
  }, [isSocketConnected, isMediaUploaded, photo, socket, isOnline]);

  useEffect(() => {
    if (isSocketConnected && isOnline && !printed && frameImgStatus === "loaded") {
      if (timeLeft > 0) {
        const timerId = setInterval(() => {
          setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);
        return () => clearInterval(timerId);
      } 
    }
  }, [timeLeft, isSocketConnected, isOnline, isMediaUploaded, printed, frameImgStatus]);

  useEffect(() => {
    if (isSocketConnected && isOnline && !printed && frameImgStatus === "loaded" && isMediaUploaded && timeLeft <= 0) {
      printImage();
    }
  }, [printImage, isSocketConnected, isOnline, printed, frameImgStatus, isMediaUploaded, timeLeft]);

  const selectRandomFilter = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * FILTERS.length);
    setFilter(FILTERS[randomIndex].value);

    filterRefs.current[randomIndex]?.scrollIntoView({
      behavior: "instant",
      block: "center",
    });
  }, []);

  useEffect(() => {
    if (!photo?.id || qrCodeURL != "") return;

    const canvas = document.createElement("canvas");
    const qrSize = 256;
    canvas.width = qrSize;
    canvas.height = qrSize;

    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = "-9999px";
    container.style.left = "-9999px";

    document.body.appendChild(container);

    const waitForSVG = new Promise<SVGElement>((resolve) => {
      const observer = new MutationObserver((_, obs) => {
        const svg = container.querySelector("svg");
        if (svg) {
          obs.disconnect();
          resolve(svg as SVGElement);
        }
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
      });
    });

    const root = ReactDOM.createRoot(container);
    root.render(
      <QRCode
        size={qrSize}
        value={process.env.NEXT_PUBLIC_QR_DOMAIN! + photo.id}
        viewBox={`0 0 ${qrSize} ${qrSize}`}
      />
    );

    waitForSVG.then((svg) => {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, qrSize, qrSize);
        ctx.drawImage(img, 0, 0);

        const dataUrl = canvas.toDataURL("image/png");
        setQrCodeURL(dataUrl);

        URL.revokeObjectURL(url);
        root.unmount();
        document.body.removeChild(container);
      };
      img.src = url;
    });

    return () => {
      if (qrCodeURL) {
        URL.revokeObjectURL(qrCodeURL);
      }
    };
  }, [photo, qrCodeURL]);

  return (
    <div className="w-full h-full relative">
      <div
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center",
          frameImgStatus != "loaded" ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="loader"></div>
      </div>

      <div
        className={cn(
          !timeLeft || printed ? "pointer-events-none" : null,
          "w-[95%] flex items-center justify-center flex-col transition duration-300",
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
                      {photo.selectedImages.map(({id, data}, index) => {
                        return (
                          data && (
                            <FrameImage
                              key={id}
                              url={data}
                              y={photo.theme!.frame.slotPositions[index].y}
                              x={photo.theme!.frame.slotPositions[index].x + (FRAME_WIDTH / 2) * _index}
                              height={photo.theme!.frame.slotDimensions.height}
                              width={photo.theme!.frame.slotDimensions.width}
                              filter={filter}
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

                  <Layer>
                    {Array.from({length: photo.frameType == "singular" ? 1 : 2}, (_, index) => (
                      <KonvaImage
                        key={index}
                        image={qrCodeImage}
                        x={photo.frameType == "singular" ? FRAME_WIDTH - OFFSET_X - 19 : (FRAME_WIDTH / 2) * index + OFFSET_X + FRAME_WIDTH / 2.6}
                        y={FRAME_HEIGHT - OFFSET_Y - 7}
                        height={40}
                        width={40}
                      />
                    ))}
                  </Layer>
                </Stage>
              </div>
              <div className="flex items-center justify-center flex-col gap-5">
                <div className="flex gap-2 items-center justify-center mb-4">
                  <h1 className="text-4xl font-semibold  uppercase">{t("Choose a filter")}</h1>
                  <span className="text-rose-500 text-4xl font-bold ">
                    <SlidingNumber
                      value={timeLeft}
                      padStart={true}
                    />
                  </span>
                </div>
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
                          src={photo?.selectedImages[0]?.data}
                          alt="filtered image"
                          className={cn(item.filter, "w-full")}
                        />
                        <p>{item.name}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex gap-2 w-full">
                  <Button
                    className="w-full mt-2"
                    onClick={selectRandomFilter}
                  >
                    {t("Random filter")} - {FILTERS.find((item) => item.value == filter)?.name}
                  </Button>
                  <Button
                    className="w-full mt-2 flex items-center justify-center gap-1"
                    onClick={() => setFilter(null)}
                  >
                    {t("Reset filter")}
                    {!filter && <IoIosCheckmark size={35} />}
                  </Button>
                </div>
                <div className="relative w-full">
                  <GlowEffect
                    colors={["#FF5733", "#33FF57", "#3357FF", "#F1C40F"]}
                    mode="colorShift"
                    blur="soft"
                    duration={3}
                    scale={1}
                  />
                  <Button
                    className={cn(
                      "flex text-xl text-center items-center justify-center gap-2 bg-foreground text-background rounded px-4 py-6 hover:opacity-[85%] w-full relative z-10",
                      printed || !isMediaUploaded ? "pointer-events-none opacity-[85%]" : null
                    )}
                    onClick={printImage}
                  >
                    {printed ? (
                      <>
                        {t("Printing")} <LoadingSpinner size={20} />
                      </>
                    ) : (
                      <>
                        {t("Print")}
                        <PiPrinter size={15} />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterPage;
