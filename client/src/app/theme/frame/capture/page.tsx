"use client";
import {cn} from "@/lib/utils";
import {useState, useEffect, useRef, useCallback} from "react";
import useSound from "use-sound";
import {NUM_OF_CAPTURE_IMAGE, CAPTURE_DURATION} from "@/constants/constants";
import {uploadImageToR2} from "@/lib/r2";
import {SlidingNumber} from "@/components/ui/sliding-number";
import usePreventNavigation from "@/hooks/usePreventNavigation";
import {createProcessedImage} from "@/server/actions";
import {ROUTES} from "@/constants/routes";
import {CountdownCircleTimer} from "react-countdown-circle-timer";
import CameraLoading from "@/components/CameraLoading";
import {usePhotoState} from "@/context/PhotoStateContext";
import {useCamera} from "@/context/CameraContext";
import {useSocket} from "@/context/SocketContext";

const CapturePage = () => {
  const {photo, setPhoto, addPhotoImage, updateVideoData} = usePhotoState();
  const {cameraStream, stopCamera, startCamera} = useCamera();
  const [count, setCount] = useState(CAPTURE_DURATION);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [cycles, setCycles] = useState(1);
  const [videoIntrinsicSize, setVideoIntrinsicSize] = useState<{width: number; height: number} | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const {isSocketConnected, isOnline} = useSocket();
  const [isVideoRefReady, setIsVideoRefReady] = useState(false);
  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    if (node !== null) {
      videoRef.current = node;
      setIsVideoRefReady(true);
    }
  }, []);
  const [playCameraShutterSound] = useSound("/shutter.mp3", {volume: 1});
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const {navigateTo} = usePreventNavigation();
  const photoRef = useRef(photo);
  const [numberOfUploadedImage, setNumberOfUploadedImage] = useState(0);
  const initializationDoneRef = useRef(false);

  useEffect(() => {
    if (!photo) return navigateTo(ROUTES.HOME);
    if (!photo.theme) return navigateTo(ROUTES.HOME);
    if (!photo.frameType) return navigateTo(ROUTES.HOME);
  }, [photo, navigateTo]);

  useEffect(() => {
    const initializeProcessedImage = async () => {
      if (initializationDoneRef.current || !photoRef.current) {
        return;
      }

      initializationDoneRef.current = true;

      const processedImageId = crypto.randomUUID();
      setPhoto!((prevStyle) => {
        if (prevStyle) {
          return {...prevStyle, id: processedImageId};
        }
        return prevStyle;
      });

      try {
        const response = await createProcessedImage(
          processedImageId,
          photoRef.current.theme!.name,
          photoRef.current.theme!.frame.src,
          photoRef.current.frameType,
          photoRef.current.theme!.frame.slotCount
        );

        if (response?.error) {
          throw new Error("Error creating processed image");
        }
        console.log("Processed image created successfully: ", processedImageId);
      } catch (error) {
        console.error("Error creating processed image:", error);
        stopCamera();
        setPhoto!((prevStyle) => {
          if (prevStyle) {
            return {...prevStyle, error: true, id: null, images: []};
          }
          return prevStyle;
        });
        if (mediaRecorder && mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }

        navigateTo(ROUTES.FRAME);
      }
    };

    if (photoRef.current && !initializationDoneRef.current && isSocketConnected && isCountingDown && isOnline) {
      initializeProcessedImage();
    }
  }, [cameraStream, isSocketConnected, isCountingDown, mediaRecorder, navigateTo, setPhoto, stopCamera, isOnline]);

  const handleCapture = useCallback(async () => {
    if (!photo) return;
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", {colorSpace: "display-p3", willReadFrequently: true});

      if (context) {
        canvas.width = videoIntrinsicSize!.width || photo.theme!.frame.slotDimensions.width;
        canvas.height = videoIntrinsicSize!.height || photo.theme!.frame.slotDimensions.height;
        context.scale(-1, 1);
        context.translate(-canvas.width, 0);
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL("image/jpeg", 1.0);
        if (cycles == NUM_OF_CAPTURE_IMAGE) {
          addPhotoImage(cycles.toString(), dataURL);
          return;
        }

        const r2Response = await uploadImageToR2(dataURL);

        if (!r2Response.error && r2Response.response) {
          const data = await r2Response.response?.json();
          const imageUrl = data.url;
          console.log("Image URL:", imageUrl);
          setNumberOfUploadedImage((prev) => prev + 1);
          addPhotoImage(cycles.toString(), dataURL, imageUrl);
        } else {
          setPhoto!((prevStyle) => prevStyle && {...prevStyle, error: true, id: null, images: []});
          stopCamera();
          if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
          }
          navigateTo(ROUTES.FRAME);
        }
      }
    }
  }, [addPhotoImage, cycles, mediaRecorder, navigateTo, photo, setPhoto, stopCamera, videoIntrinsicSize]);

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
      if (event.data && event.data.size > 0 && isOnline && isSocketConnected && cycles != NUM_OF_CAPTURE_IMAGE) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = () => {
      const videoBlob = new Blob(chunks, {type: "video/webm"});
      if (videoBlob.size > 0) {
        updateVideoData(videoBlob, null);
      }
      chunks = [];
    };

    setMediaRecorder(recorder);
    recorder.start(100);
  }, [cycles, isOnline, isSocketConnected, updateVideoData]);

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
            setVideoIntrinsicSize({
              width: videoRef.current!.videoWidth,
              height: videoRef.current!.videoHeight,
            });
            videoRef.current?.play().then(() => {
              console.log("Video playback started from camera");
              setTimeout(() => {
                setIsCountingDown(true);
                handleRecording();
              }, 2500);
            });
          };
        } catch (error) {
          console.error("Error :", error);
        }
      }
    };
    if (!isCountingDown && cycles != NUM_OF_CAPTURE_IMAGE) {
      getVideo();
    }
  }, [isCountingDown, handleRecording, cameraStream, isVideoRefReady, startCamera, cycles]);

  useEffect(() => {
    if (
      cycles == NUM_OF_CAPTURE_IMAGE &&
      count <= 0 &&
      numberOfUploadedImage >= NUM_OF_CAPTURE_IMAGE - 1 &&
      photo?.images.length == NUM_OF_CAPTURE_IMAGE
    ) {
      setIsCountingDown(false);
      if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
      }
      stopCamera();
      navigateTo(ROUTES.SELECT);
      return;
    }
    const timer = setInterval(async () => {
      if (isCountingDown && isSocketConnected && isOnline) {
        if (count > 0 && cycles <= NUM_OF_CAPTURE_IMAGE) {
          setCount((prevCount) => prevCount - 1);
          if (count == 1) {
            handleCapture();
            playCameraShutterSound();
          }
          return;
        }
        if (count <= 0 && cycles < NUM_OF_CAPTURE_IMAGE && photo?.id) {
          setCycles((prevCycle) => prevCycle + 1);
          setCount(CAPTURE_DURATION);
          return;
        }

        if (cycles == NUM_OF_CAPTURE_IMAGE && count <= 0) {
          setIsCountingDown(false);
          if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
          }
          stopCamera();
          return;
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [
    count,
    cycles,
    handleCapture,
    isCountingDown,
    mediaRecorder,
    playCameraShutterSound,
    navigateTo,
    setPhoto,
    stopCamera,
    isSocketConnected,
    isOnline,
    photo?.id,
    numberOfUploadedImage,
    photo?.images.length,
  ]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {photo && (
        <>
          {!isCountingDown && cycles == 1 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center">
              <CameraLoading />
            </div>
          )}
          <div
            className={cn(
              "w-full h-full gap-2 flex items-center justify-evenly transition duration-300",
              isCountingDown ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <div className="relative w-max h-[88vh]">
              <video
                ref={setVideoRef}
                autoPlay
                playsInline
                muted
                className={cn("h-full object-contain -scale-x-100 rounded-sm ")}
              />
              {isCountingDown && (
                <>
                  <div
                    className={cn(
                      "absolute top-1/2  left-1/2 text-8xl text-white text-center w-full",
                      !isCountingDown || cycles > NUM_OF_CAPTURE_IMAGE || count === 0 ? "hidden" : null
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
            </div>

            <div className="mt-3 relative">
              <div className="flex items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="font-bold text-4xl">
                  <SlidingNumber
                    value={cycles}
                    padStart={false}
                  />
                </span>
                <h1 className="font-bold text-4xl text-center">/{NUM_OF_CAPTURE_IMAGE}</h1>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <CountdownCircleTimer
                  isPlaying={isCountingDown && isSocketConnected && isOnline && cycles < NUM_OF_CAPTURE_IMAGE}
                  strokeWidth={9}
                  trailStrokeWidth={9}
                  updateInterval={1}
                  size={135}
                  strokeLinecap="square"
                  key={`${cycles}-${count}`}
                  initialRemainingTime={count}
                  duration={CAPTURE_DURATION}
                  colors="#000000"
                ></CountdownCircleTimer>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center",
              !isCountingDown && cycles == NUM_OF_CAPTURE_IMAGE ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <div className="loader"></div>
          </div>
        </>
      )}
    </div>
  );
};

export default CapturePage;
