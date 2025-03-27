"use client";

import {createContext, ReactNode, useContext, useState, useEffect, Dispatch, SetStateAction, useCallback} from "react";
import {usePathname} from "next/navigation";
import {ROUTES} from "@/constants/routes";
import {usePhotoState} from "./PhotoStateContext";
import {getCameraConstraints} from "@/lib/utils";

interface Camera {
  deviceId: string;
  label: string;
}

interface CameraContextType {
  camera: Camera | null;
  setCamera: React.Dispatch<React.SetStateAction<Camera | null>> | null;
  availableCameras: Array<{deviceId: string; label: string}>;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  cameraStream: MediaStream | null;
  setCameraConstraints: Dispatch<SetStateAction<MediaStreamConstraints | null>> | null;
}

const CameraContext = createContext<CameraContextType>({
  camera: null,
  setCamera: null,
  availableCameras: [],
  startCamera: () => Promise.resolve(),
  stopCamera: () => {},
  cameraStream: null,
  setCameraConstraints: null,
});

export const CameraProvider = ({children}: {children: ReactNode}) => {
  const {photo} = usePhotoState();
  const [camera, setCamera] = useState<Camera | null>(null);
  const [availableCameras, setAvailableCameras] = useState<Array<{deviceId: string; label: string}>>([]);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraConstraints, setCameraConstraints] = useState<MediaStreamConstraints | null>(null);
  const pathName = usePathname();

  // Update camera constraints when photo theme changes
  useEffect(() => {
    if (!photo?.theme?.frame.slotDimensions) return;
    if (setCameraConstraints) {
      setCameraConstraints(getCameraConstraints(photo.theme.frame.slotDimensions.width, photo.theme.frame.slotDimensions.height));
    }
  }, [photo?.theme?.frame.slotDimensions, setCameraConstraints]);

  // Initialize camera devices
  useEffect(() => {
    const getVideoDevices = async () => {
      try {
        const deviceInfos = await navigator.mediaDevices.enumerateDevices();
        const availableVideoDevices = deviceInfos.filter((device) => device.kind === "videoinput");

        if (availableVideoDevices.length === 0) {
          console.error("No video devices found");
          return;
        }

        const defaultCamera = availableVideoDevices.find(
          (device) =>
            device.label &&
            process.env.NEXT_PUBLIC_DEFAULT_CAMERA &&
            device.label.toLowerCase().includes(process.env.NEXT_PUBLIC_DEFAULT_CAMERA.toLowerCase())
        );

        setCamera({
          deviceId: defaultCamera?.deviceId || availableVideoDevices[0].deviceId,
          label: defaultCamera?.label || availableVideoDevices[0].label,
        });

        setAvailableCameras(availableVideoDevices);
      } catch (error) {
        console.error("Error enumerating devices:", error);
      }
    };

    if (!camera && !availableCameras.length) {
      getVideoDevices();
    }
  }, [camera, availableCameras]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (cameraStream) {
      console.log("Stopping camera stream");
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  }, [cameraStream]);

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      console.log("Creating new camera stream");
      console.log("Camera constraints: ", cameraConstraints);
      if (!cameraStream) {
        const cameraPromise = await navigator.mediaDevices.getUserMedia({
          video:
            cameraConstraints && pathName !== ROUTES.HOME
              ? cameraConstraints.video
              : {
                  width: {ideal: 1280},
                  height: {ideal: 720},
                  aspectRatio: {exact: 16 / 9},
                  deviceId: camera?.deviceId ? {exact: camera.deviceId} : undefined,
                },
        });

        setCameraStream(cameraPromise);
      }
      console.log("Camera started successfully");
    } catch (err) {
      console.error("Error accessing the camera: ", err);
      setCameraStream(null);
      throw err;
    }
  }, [camera?.deviceId, cameraConstraints, cameraStream, pathName]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <CameraContext.Provider
      value={{
        camera,
        setCamera,
        availableCameras,
        startCamera,
        stopCamera,
        cameraStream,
        setCameraConstraints,
      }}
    >
      {children}
    </CameraContext.Provider>
  );
};

export const useCamera = () => useContext(CameraContext);
