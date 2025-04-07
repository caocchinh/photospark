"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {Button} from "@/components/ui/button";
import {useEffect, useRef, useState, useCallback} from "react";
import {useTranslation} from "react-i18next";
import {PiVideoCameraFill} from "react-icons/pi";
import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue} from "@/components/ui/select";
import {IoMdCheckmark} from "react-icons/io";
import {cn} from "@/lib/utils";
import {MdWarning} from "react-icons/md";
import CameraLoading from "./CameraLoading";
import {useCountdown} from "@/context/CountdownContext";
import {useCamera} from "@/context/CameraContext";
import {usePhotoState} from "@/context/PhotoStateContext";
import {CLICK_SOUND_URL, CLICK_SOUND_VOUME} from "@/constants/constants";
import useSound from "use-sound";
import {IoRefresh} from "react-icons/io5";

const CameraSetting = () => {
  const [playClick] = useSound(CLICK_SOUND_URL, {volume: CLICK_SOUND_VOUME});
  const {t} = useTranslation();
  const {setCamera, camera, availableCameras, cameraStream, startCamera, stopCamera} = useCamera();
  const {setShouldRunCountdown, autoSelectCountdownTimer} = useCountdown();
  const {photo} = usePhotoState();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [videoRefReady, setVideoRefReady] = useState(false);
  const [isError, setIsError] = useState(false);

  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    if (node !== null) {
      videoRef.current = node;
      setVideoRefReady(true);
    }
  }, []);

  useEffect(() => {
    const currentVideoRef = videoRef.current;

    const getVideo = async () => {
      if (camera && currentVideoRef && videoRefReady) {
        try {
          if (!cameraStream) {
            await startCamera();
            return;
          }
          setIsError(false);
          currentVideoRef.srcObject = cameraStream;
        } catch {
          setIsError(true);
        }
      }
    };

    if (isOpen) {
      getVideo();
    }

    return () => {
      if (cameraStream) {
        stopCamera();
      }
    };
  }, [camera, startCamera, stopCamera, isOpen, videoRefReady, cameraStream]);

  useEffect(() => {
    if (setShouldRunCountdown) {
      if (isOpen) {
        console.log("Count down stopped");
        setShouldRunCountdown(false);
      } else {
        if (photo) {
          setShouldRunCountdown(true);
        }
      }
    }
  }, [isOpen, setShouldRunCountdown, photo]);

  return (
    <AlertDialog
      open={isOpen && autoSelectCountdownTimer > 1}
      onOpenChange={setIsOpen}
    >
      <AlertDialogTrigger asChild>
        <Button
          onMouseDown={() => playClick()}
          variant="outline"
          className="flex items-center justify-center gap-1 w-full"
          disabled={autoSelectCountdownTimer <= 1}
        >
          <p> {t("Camera settings")}</p> <PiVideoCameraFill />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="min-w-[90vw] min-h-[90vh] flex flex-col items-center justify-between">
        <div className="flex gap-4 w-full items-center justify-around h-full flex-1">
          <video
            ref={setVideoRef}
            autoPlay
            playsInline
            muted
            className={cn(
              "h-[75%] w-[75%] object-contain -scale-x-100 rounded-sm",
              camera && videoRefReady && cameraStream && !isError ? "opacity-100 block" : "opacity-0 absolute"
            )}
          />
          {!(camera && videoRefReady && cameraStream) && !isError && isOpen && (
            <div className="w-[70%]">
              <CameraLoading />
            </div>
          )}
          {isError && (
            <div className="flex items-center justify-center flex-col gap-3 w-[65%]">
              <MdWarning
                className="text-red-500"
                size={130}
              />
              <p className="text-red-500 text-4xl uppercase font-semibold">{t("Error loading camera")}!</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 cursor-pointer relative z-[100] w-[65%]"
              >
                {t("Refresh the application")}
                <IoRefresh />
              </Button>
            </div>
          )}

          <div className="flex items-center justify-center flex-col gap-3">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-center text-2xl font-semibold">{t("Choose camera source")}</AlertDialogTitle>
            </AlertDialogHeader>

            <Select
              disabled={!(camera && videoRefReady && cameraStream) && !isError}
              value={camera?.deviceId}
              onValueChange={(value) => {
                const device = availableCameras.find((d) => d.deviceId === value);
                if (device) {
                  stopCamera();
                  setCamera!({deviceId: device.deviceId, label: device.label});
                  if (typeof window != "undefined") {
                    localStorage.setItem("selectedCameraId", device.deviceId);
                  }
                }
              }}
            >
              <SelectTrigger className="w-full relative z-[10]">
                <SelectValue placeholder={camera?.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{t("Available cameras")}</SelectLabel>
                  {availableCameras.map((device) => (
                    <SelectItem
                      onMouseDown={() => playClick()}
                      key={device.deviceId}
                      value={device.deviceId}
                    >
                      {device.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <AlertDialogFooter className="w-full">
          <AlertDialogAction
            onMouseDown={() => playClick()}
            disabled={!(camera && videoRefReady && cameraStream) && !isError}
            className="bg-green-700 hover:bg-green-800 w-full"
            onClick={() => {
              stopCamera();
              setIsOpen(false);
            }}
          >
            {t("Save")} <IoMdCheckmark color="white" />
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CameraSetting;
