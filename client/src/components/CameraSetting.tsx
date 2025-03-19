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
import {usePhoto} from "@/context/PhotoContext";
import {useEffect, useRef, useState, useCallback} from "react";
import {useTranslation} from "react-i18next";
import {PiVideoCameraFill} from "react-icons/pi";
import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue} from "@/components/ui/select";
import {IoMdCheckmark} from "react-icons/io";
import {cn} from "@/lib/utils";

import {MdWarning} from "react-icons/md";
import CameraLoading from "./CameraLoading";
const CameraSetting = () => {
  const {t} = useTranslation();
  const {camera, photo, setCamera, availableCameras, startCamera, stopCamera, cameraStream, setShouldRunCountdown, autoSelectCountdown} = usePhoto();
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
      open={isOpen && autoSelectCountdown > 0}
      onOpenChange={setIsOpen}
    >
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center justify-center gap-1 w-full"
          disabled={autoSelectCountdown <= 0}
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
              "h-[80%] w-[80%] object-contain -scale-x-100 rounded-sm",
              camera && videoRefReady && cameraStream && !isError ? "opacity-100 block" : "opacity-0 absolute"
            )}
          />
          {!(camera && videoRefReady && cameraStream && !isError) && isOpen && <CameraLoading />}
          {isError && (
            <div className="flex items-center justify-center flex-col gap-3">
              <MdWarning
                className="text-red-500"
                size={130}
              />
              <p className="text-red-500 text-4xl uppercase font-semibold">{t("Error loading camera")}!</p>
            </div>
          )}

          <div className="flex items-center justify-center flex-col gap-3">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-center text-2xl font-semibold">{t("Choose camera source")}</AlertDialogTitle>
            </AlertDialogHeader>

            <Select
              disabled={!(camera && videoRefReady && cameraStream)}
              value={camera?.deviceId}
              onValueChange={(value) => {
                const device = availableCameras.find((d) => d.deviceId === value);
                if (device) {
                  stopCamera();
                  setCamera!({deviceId: device.deviceId, label: device.label});
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={camera?.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{t("Available cameras")}</SelectLabel>
                  {availableCameras.map((device) => (
                    <SelectItem
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
            disabled={!(camera && videoRefReady && cameraStream)}
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
