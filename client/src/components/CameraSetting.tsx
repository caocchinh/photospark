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
import LoadingSpinner from "./LoadingSpinner";
import {ImCamera} from "react-icons/im";
import {TextShimmer} from "./ui/text-shimmer";
import {MdWarning} from "react-icons/md";

const CameraSetting = () => {
  const {t} = useTranslation();
  const {camera, setCamera, availableCameras, startCamera, stopCamera, cameraStream} = usePhoto();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [isError, setIsError] = useState(false);

  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    if (node !== null) {
      console.log("Setting video ref");
      videoRef.current = node;
      setVideoReady(true);
    }
  }, []);

  useEffect(() => {
    const currentVideoRef = videoRef.current;

    const getVideo = async () => {
      if (camera && currentVideoRef && videoReady) {
        try {
          if (!cameraStream) {
            await startCamera();
            return;
          }
          console.log("Asigning stream to video ref");
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
  }, [camera, startCamera, stopCamera, isOpen, videoReady, cameraStream]);

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center justify-center gap-1 w-full"
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
              camera && videoReady && cameraStream && !isError ? "opacity-100 block" : "opacity-0 absolute"
            )}
          />
          {!(camera && videoReady && cameraStream && !isError) && isOpen && (
            <div className="flex items-center justify-center gap-8 flex-col w-full">
              <div className="relative">
                <LoadingSpinner
                  size={200}
                  color="black"
                />
                <ImCamera
                  className="text-4xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  size={80}
                />
              </div>
              <TextShimmer
                className=" font-semibold text-3xl uppercase text-center whitespace-nowrap  [--base-color:black] [--base-gradient-color:gray]"
                duration={1.5}
                spread={4}
              >
                {t("Waiting for camera...")}
              </TextShimmer>
            </div>
          )}
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
              disabled={!(camera && videoReady && cameraStream)}
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
                  <SelectLabel>Avaiable cameras</SelectLabel>
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
          <AlertDialogAction className="bg-green-700 hover:bg-green-800 w-full">
            {t("Save")} <IoMdCheckmark color="white" />
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CameraSetting;
