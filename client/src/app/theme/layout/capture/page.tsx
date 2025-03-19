"use client";
import {usePhoto} from "@/context/PhotoContext";
import {cn} from "@/lib/utils";
import {useState, useEffect, useRef, useCallback} from "react";
import useSound from "use-sound";
import {NUM_OF_IMAGE} from "@/constants/constants";
import {uploadImageToR2} from "@/lib/r2";
import {SlidingNumber} from "@/components/ui/sliding-number";
import usePreventNavigation from "@/hooks/usePreventNavigation";
import {createProcessedImage} from "@/server/actions";
import {ROUTES} from "@/constants/routes";
import CameraLoading from "@/components/CameraLoading";
import {TextScramble} from "@/components/ui/text-scramble";
import {useTranslation} from "react-i18next";
const CapturePage = () => {
  const duration = 2;
  const {setPhoto, photo, cameraStream, startCamera, stopCamera} = usePhoto();
  const [count, setCount] = useState(duration);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [cycles, setCycles] = useState(1);
  const maxCycles = NUM_OF_IMAGE;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoRefReady, setIsVideoRefReady] = useState(false);
  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    if (node !== null) {
      videoRef.current = node;
      setIsVideoRefReady(true);
    }
  }, []);
  const [image, setImage] = useState<Array<{id: string; data: string}>>([]);
  const [playCameraShutterSound] = useSound("/shutter.mp3", {volume: 1});
  const [uploadedImages, setUploadedImages] = useState<Array<{id: string; href: string}>>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const {navigateTo} = usePreventNavigation();
  const {t} = useTranslation();

  useEffect(() => {
    if (!photo) return navigateTo(ROUTES.HOME);
    if (photo!.images!.length == maxCycles) return navigateTo(ROUTES.SELECT);
  }, [photo, navigateTo, maxCycles]);

  useEffect(() => {
    const initializeProcessedImage = async () => {
      if (photo) {
        if (photo.id) return;
        const processedImageId = crypto.randomUUID();
        setPhoto!((prevStyle) => {
          if (prevStyle) {
            return {...prevStyle, id: processedImageId};
          }
          return prevStyle;
        });
        const response = await createProcessedImage(
          processedImageId,
          photo.theme!.name,
          photo.theme!.frame.src,
          photo.frameType,
          photo.theme!.frame.slotCount
        );
        if (response.error) {
          console.log("Error creating processed image: ", response.error);
          setPhoto!((prevStyle) => {
            if (prevStyle) {
              return {...prevStyle, error: true, id: null};
            }
            return prevStyle;
          });
          navigateTo(ROUTES.LAYOUT);
          return;
        }
        console.log("Processed image created successfully: ", processedImageId);
      }
    };
    if (!photo?.id) initializeProcessedImage();
  }, [navigateTo, photo, setPhoto]);

  const handleCapture = useCallback(async () => {
    if (!photo) return;
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", {colorSpace: "display-p3", willReadFrequently: true});

      if (context) {
        canvas.width = photo.theme!.frame.slotDimensions.width;
        canvas.height = photo.theme!.frame.slotDimensions.height;
        context.scale(-1, 1);
        context.translate(-canvas.width, 0);
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL("image/jpeg", 1.0);
        setImage((prevItems) => [...prevItems, {id: cycles.toString(), data: dataURL}]);
        if (cycles == maxCycles) return;

        const r2Response = await uploadImageToR2(dataURL);

        if (r2Response.ok) {
          const data = await r2Response.json();
          const imageUrl = data.url;
          console.log("Image URL:", imageUrl);
          setUploadedImages((prevItems) => [...prevItems, {id: cycles.toString(), href: imageUrl}]);
        } else {
          setPhoto!((prevStyle) => prevStyle && {...prevStyle, error: true});
          setUploadedImages([]);
          navigateTo(ROUTES.LAYOUT);
        }
      }
    }
  }, [cycles, maxCycles, navigateTo, photo, setPhoto]);

  const handleRecording = useCallback(() => {
    if (!videoRef.current?.srcObject) return;

    const stream = videoRef.current.srcObject as MediaStream;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", {
      colorSpace: "display-p3",
      willReadFrequently: true,
    });
    const videoTrack = stream.getVideoTracks()[0];
    const {width, height} = videoTrack.getSettings();

    canvas.width = width!;
    canvas.height = height!;

    const flippedStream = canvas.captureStream(120);

    const drawVideo = () => {
      if (videoRef.current && ctx) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      }
      requestAnimationFrame(drawVideo);
    };
    drawVideo();

    const recorder = new MediaRecorder(flippedStream, {
      mimeType: "video/webm;codecs=vp8",
      videoBitsPerSecond: 10000000,
    });

    let chunks: Blob[] = [];

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = () => {
      const videoBlob = new Blob(chunks, {type: "video/webm"});
      if (videoBlob.size > 0) {
        setPhoto!((prevStyle) => {
          if (prevStyle) {
            return {
              ...prevStyle,
              video: {
                ...prevStyle.video,
                data: videoBlob,
              },
            };
          }
        });
      }
      chunks = [];
    };

    setMediaRecorder(recorder);
    recorder.start(100);
  }, [setPhoto]);

  useEffect(() => {
    const getVideo = async () => {
      if (videoRef.current && isVideoRefReady) {
        if (!cameraStream) {
          await startCamera();
          return;
        }
        try {
          videoRef.current.srcObject = cameraStream;

          videoRef.current.onloadedmetadata = () => {
            videoRef.current
              ?.play()
              .then(() => {
                console.log("Video playback started from preloaded camera");
                setIsCountingDown(true);
                handleRecording();
              })
              .catch((e) => {
                console.error("Video playback failed from preloaded camera:", e);
                if (videoRef.current?.srcObject instanceof MediaStream) {
                  const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                  tracks.forEach((track) => track.stop());
                  videoRef.current.srcObject = null;
                }
              });
          };
        } catch (error) {
          console.error("Error :", error);
        }
      }
    };
    if (!isCountingDown) {
      getVideo();
    }
  }, [isCountingDown, handleRecording, cameraStream, isVideoRefReady, startCamera]);

  useEffect(() => {
    if (cycles < maxCycles + 1) {
      const timer = setInterval(async () => {
        if (isCountingDown) {
          if (count > 0 && cycles <= maxCycles) {
            setCount((prevCount) => prevCount - 1);
            if (count == 1) {
              handleCapture();
              playCameraShutterSound();
            }
          }
          if (count <= 0 && cycles < maxCycles && photo?.id) {
            setCycles((prevCycle) => prevCycle + 1);
            setCount(duration);
          }
          if (cycles == maxCycles && count <= 0 && uploadedImages.length == maxCycles - 1) {
            if (mediaRecorder) {
              mediaRecorder.stop();
            }
            setPhoto!((prevStyle) => {
              if (prevStyle) {
                return {
                  ...prevStyle,
                  images: image.map((item) => ({...item, href: uploadedImages.find((image) => image.id == item.id)?.href || ""})),
                };
              }
              return prevStyle;
            });
            setIsCountingDown(false);
            if (mediaRecorder && mediaRecorder.state === "recording") {
              mediaRecorder.stop();
            }
            stopCamera();

            navigateTo(ROUTES.SELECT);
          }
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [
    count,
    cycles,
    duration,
    handleCapture,
    image,
    isCountingDown,
    maxCycles,
    mediaRecorder,
    playCameraShutterSound,
    navigateTo,
    setPhoto,
    uploadedImages,
    photo?.id,
    stopCamera,
  ]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {photo && (
        <>
          <div className="w-full h-full gap-2 flex items-center justify-evenly">
            <div className="relative w-max h-[88vh]">
              <video
                ref={setVideoRef}
                autoPlay
                playsInline
                muted
                className={cn("h-full object-contain -scale-x-100 rounded-sm", isCountingDown ? "opacity-100 block" : "opacity-0 absolute")}
              />
              {isCountingDown && (
                <>
                  <div
                    className={cn(
                      "absolute top-1/2  left-1/2 text-8xl text-white text-center w-full",
                      !isCountingDown || cycles > maxCycles || count === 0 ? "hidden" : null
                    )}
                    style={{
                      fontFamily: "var(--font-buffalo)",
                    }}
                  >
                    <SlidingNumber
                      value={count}
                      padStart={false}
                    />
                  </div>

                  <div className={cn("absolute w-full h-full bg-white top-0 opacity-0", count === 0 ? "flash-efect" : null)}></div>
                </>
              )}
              {!isCountingDown && cycles == 1 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <CameraLoading />
                </div>
              )}
              {!isCountingDown && cycles == maxCycles && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <TextScramble
                    className="font-mono text-3xl"
                    duration={0.7}
                    characterSet=". "
                  >
                    {t("Processing images...")}
                  </TextScramble>
                  Đang xử lý ảnh
                </div>
              )}
            </div>
            {isCountingDown && (
              <div className="mt-3 flex items-center justify-center">
                <span className="font-bold text-5xl">
                  <SlidingNumber
                    value={cycles}
                    padStart={false}
                  />
                </span>
                <h1 className="font-bold text-5xl text-center">/{maxCycles}</h1>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CapturePage;
