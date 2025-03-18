"use client";
import {usePhoto} from "@/context/PhotoContext";
import {cn} from "@/lib/utils";
import {useState, useEffect, useRef, useCallback} from "react";
import useSound from "use-sound";
import {NUM_OF_IMAGE} from "@/constants/constants";
import {ImCamera} from "react-icons/im";
import LoadingSpinner from "@/components/LoadingSpinner";
import {uploadImageToR2} from "@/lib/r2";
import {useTranslation} from "react-i18next";
import {SlidingNumber} from "@/components/ui/sliding-number";
import {TextShimmer} from "@/components/ui/text-shimmer";
import usePreventNavigation from "@/hooks/usePreventNavigation";
import {createProcessedImage} from "@/server/actions";
import {ROUTES} from "@/constants/routes";

const CapturePage = () => {
  const duration = Infinity;
  const {setPhoto, photo} = usePhoto();
  const [count, setCount] = useState(duration);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [cycles, setCycles] = useState(1);
  const photoRef = useRef(photo);
  const maxCycles = NUM_OF_IMAGE;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [image, setImage] = useState<Array<{id: string; data: string}>>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | undefined>();
  const [cameraSize, setCameraSize] = useState<{width: number; height: number} | undefined>(undefined);
  const [playCameraShutterSound] = useSound("/shutter.mp3", {volume: 1});
  const [uploadedImages, setUploadedImages] = useState<Array<{id: string; href: string}>>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [cameraConstraints, setCameraConstraints] = useState<MediaTrackConstraints | null>(null);
  const {t} = useTranslation();
  const {navigateTo} = usePreventNavigation();

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

  useEffect(() => {
    const getVideoDevices = async () => {
      try {
        if (preloadedCamera) {
          setSelectedDevice(preloadedCamera.deviceId);
          setVideoDevices((prev) => {
            if (prev.length > 0) return prev;

            navigator.mediaDevices
              .enumerateDevices()
              .then((deviceInfos) => {
                const availableVideoDevices = deviceInfos.filter((device) => device.kind === "videoinput");
                setVideoDevices(availableVideoDevices);
              })
              .catch((error) => console.error("Error enumerating devices:", error));

            return prev;
          });
          return;
        }

        await navigator.mediaDevices.getUserMedia({video: true}).then((stream) => {
          stream.getTracks().forEach((track) => track.stop());
        });
        const deviceInfos = await navigator.mediaDevices.enumerateDevices();
        const availableVideoDevices = deviceInfos.filter((device) => device.kind === "videoinput");
        setVideoDevices(availableVideoDevices);

        if (availableVideoDevices.length > 0) {
          setSelectedDevice(availableVideoDevices[0].deviceId);
        }
        console.log("Available video devices:", availableVideoDevices);
      } catch (error) {
        console.error("Error enumerating devices:", error);
      }
    };

    if (!selectedDevice) {
      getVideoDevices();
    }
  }, [selectedDevice, preloadedCamera]);

  const handleCameraChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setIsCameraReady(false);
    if (videoRef.current?.srcObject instanceof MediaStream) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }
    setSelectedDevice(event.target.value);
  };

  const handleCapture = useCallback(async () => {
    if (!photo) return;
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", {colorSpace: "display-p3", willReadFrequently: true});

      if (context) {
        canvas.width = cameraSize!.width || photo.theme!.frame.slotDimensions.width;
        canvas.height = cameraSize!.height || photo.theme!.frame.slotDimensions.height;
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
  }, [cameraSize, cycles, maxCycles, navigateTo, photo, setPhoto]);

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
    if (preloadedCamera && videoRef.current && !isCameraReady) {
      console.log("Using preloaded camera");
      try {
        videoRef.current.srcObject = preloadedCamera.stream;

        setCameraSize(preloadedCamera.dimensions);

        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            ?.play()
            .then(() => {
              console.log("Video playback started from preloaded camera");
              setIsCameraReady(true);
              setIsCountingDown(true);
              handleRecording();
              clearPreloadedCamera();
            })
            .catch((e) => {
              console.error("Video playback failed from preloaded camera:", e);
              if (videoRef.current?.srcObject instanceof MediaStream) {
                const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                tracks.forEach((track) => track.stop());
                videoRef.current.srcObject = null;
              }
              clearPreloadedCamera();
            });
        };
      } catch (error) {
        console.error("Error using preloaded camera:", error);
        clearPreloadedCamera();
      }
    }
  }, [preloadedCamera, isCameraReady, clearPreloadedCamera, handleRecording]);

  useEffect(() => {
    const getVideo = async () => {
      if (!photoRef.current?.theme!.frame.slotDimensions || !cameraConstraints) return;
      if (preloadedCamera && !isCameraReady) return;

      try {
        console.log("Attempting to access camera with constraints:", cameraConstraints);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: cameraConstraints,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            console.log("Video element metadata loaded");
            videoRef.current
              ?.play()
              .then(() => {
                console.log("Video playback started");
                setIsCameraReady(true);
                setIsCountingDown(true);
                handleRecording();
              })
              .catch((e) => console.error("Video playback failed:", e));
          };

          const videoTrack = stream.getVideoTracks()[0];
          const settings = videoTrack.getSettings();
          console.log("Camera settings:", settings);
          setCameraSize({width: settings.width || 0, height: settings.height || 0});
        } else {
          console.error("Video ref is not available");
        }
      } catch (err) {
        console.error("Error accessing the camera: ", err);
      }
    };

    if (!isCameraReady && selectedDevice && cameraConstraints && (!preloadedCamera || (preloadedCamera && !videoRef.current?.srcObject))) {
      getVideo();
    }
  }, [handleRecording, selectedDevice, isCameraReady, cameraConstraints]);

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
  ]);

  useEffect(() => {
    const videoElement = videoRef.current;

    return () => {
      if (videoElement?.srcObject instanceof MediaStream) {
        const tracks = (videoElement.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => {
          track.stop();
          console.log("Camera track stopped");
        });
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
      }
    };
  }, [mediaRecorder]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {photo && (
        <>
          <div className="w-full h-full gap-2 flex items-center justify-evenly">
            {videoDevices.length > 1 && (
              <div className="absolute top-4 right-4 z-10 bg-white/80 p-2 rounded-md shadow-md">
                <select
                  value={selectedDevice}
                  onChange={handleCameraChange}
                  className="p-2 border rounded-md"
                  disabled={isCountingDown}
                >
                  {videoDevices.map((device, index) => (
                    <option
                      key={device.deviceId}
                      value={device.deviceId}
                    >
                      {device.label || `Camera ${index + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="relative w-max h-[88vh]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full object-contain -scale-x-100 rounded-sm"
              />
              {isCameraReady && (
                <>
                  <div
                    className={cn(
                      "absolute top-1/2  left-1/2 text-8xl text-white text-center w-full",
                      !isCameraReady || cycles > maxCycles || count === 0 ? "hidden" : null
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
            {isCameraReady && (
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
