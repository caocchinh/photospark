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
import {useEffect, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import {PiVideoCameraFill} from "react-icons/pi";
import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue} from "@/components/ui/select";
import {IoMdCheckmark} from "react-icons/io";

const CameraSetting = () => {
  const {t} = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const {camera, setCamera} = usePhoto();
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const getVideoDevices = async () => {
      await navigator.mediaDevices.getUserMedia({video: true}).then((stream) => {
        stream.getTracks().forEach((track) => track.stop());
      });
      const deviceInfos = await navigator.mediaDevices.enumerateDevices();
      const availableVideoDevices = deviceInfos.filter((device) => device.kind === "videoinput");
      setVideoDevices(availableVideoDevices);
    };

    getVideoDevices();
  }, []);

  useEffect(() => {
    const getVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: camera?.deviceId,
            width: {ideal: 1280, max: 1920},
            height: {ideal: 720, max: 1080},
            aspectRatio: {ideal: 16 / 9},
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        } else {
          console.error("Video ref is not available");
        }
      } catch (err) {
        console.error("Error accessing the camera: ", err);
      }
    };

    if (camera && isOpen) {
      console.log("Camera and isOpen", camera, isOpen);
      getVideo();
    }
  }, [camera, isOpen]);

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
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-[80%] w-[80%] object-contain -scale-x-100 rounded-sm overflow-hidden"
          />
          <div className="flex items-center justify-center flex-col gap-3">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-center text-2xl font-semibold">{t("Choose camera source")}</AlertDialogTitle>
            </AlertDialogHeader>

            <Select
              value={camera?.deviceId}
              onValueChange={(value) => {
                const device = videoDevices.find((d) => d.deviceId === value);
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
                  {videoDevices.map((device) => (
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
