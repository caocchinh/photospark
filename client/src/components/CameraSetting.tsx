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

const CameraSetting = () => {
  const {t} = useTranslation();
  const {camera, setCamera, availableCameras, startCamera, stopCamera, cameraStream} = usePhoto();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

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
      if (camera && currentVideoRef && videoReady && cameraStream) {
        try {
          console.log("Asigning stream to video ref");
          currentVideoRef.srcObject = cameraStream;
        } catch (err) {
          console.error("Error accessing the camera: ", err);
        }
      } else {
        await startCamera();
      }
    };

    if (isOpen) {
      getVideo();
    }

    return () => {
      console.log("Stopping camera skibidi rizz");
      stopCamera();
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
          className="flex items-center justify-center gap-1"
        >
          <p> {t("Camera settings")}</p> <PiVideoCameraFill />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="min-w-[90vw] min-h-[90vh] flex flex-col items-center justify-center">
        <div className="flex gap-4 w-full items-center justify-around">
          <video
            ref={setVideoRef}
            autoPlay
            playsInline
            muted
            className="h-[80%] w-[80%] object-contain -scale-x-100 rounded-sm"
          />
          <div className="flex items-center justify-center flex-col gap-3">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-center text-2xl font-semibold">{t("Choose camera source")}</AlertDialogTitle>
            </AlertDialogHeader>

            <Select
              value={camera?.deviceId}
              onValueChange={(value) => {
                const device = availableCameras.find((d) => d.deviceId === value);
                if (device) {
                  console.log("Setting camera to", device);
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
