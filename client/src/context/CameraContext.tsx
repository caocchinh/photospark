"use client";

import {createContext, ReactNode, useContext, useState, useEffect, Dispatch, SetStateAction, useCallback, useRef} from "react";
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
  setCamera: Dispatch<SetStateAction<Camera | null>> | null;
  availableCameras: Array<{deviceId: string; label: string}>;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  cameraStream: MediaStream | null;
}

const CameraContext = createContext<CameraContextType>({
  camera: null,
  setCamera: null,
  availableCameras: [],
  startCamera: () => Promise.resolve(),
  stopCamera: () => {},
  cameraStream: null,
});

export const CameraProvider = ({children}: {children: ReactNode}) => {
  const {photo} = usePhotoState();
  const photoRef = useRef(photo);
  const [camera, setCamera] = useState<Camera | null>(null);
  const [availableCameras, setAvailableCameras] = useState<Array<{deviceId: string; label: string}>>([]);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const pathName = usePathname();

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
        setAvailableCameras(availableVideoDevices);

        if (typeof window !== "undefined") {
          const selectedCameraId = localStorage.getItem("selectedCameraId");
          if (selectedCameraId) {
            const existingCamera = availableVideoDevices.find((device) => device.deviceId === selectedCameraId);
            if (existingCamera) {
              setCamera({
                deviceId: existingCamera.deviceId,
                label: existingCamera?.label,
              });
              return;
            }
          }
          const isDefaultCameraExist = availableVideoDevices.find(
            (device) =>
              device.label &&
              process.env.NEXT_PUBLIC_DEFAULT_CAMERA &&
              device.label.toLowerCase().includes(process.env.NEXT_PUBLIC_DEFAULT_CAMERA.toLowerCase())
          );
          if (isDefaultCameraExist) {
            setCamera({
              deviceId: isDefaultCameraExist.deviceId,
              label: isDefaultCameraExist.label,
            });
            return;
          }

          if (availableVideoDevices.length > 0) {
            const defaultCamera = availableVideoDevices[0];
            setCamera({
              deviceId: defaultCamera.deviceId,
              label: defaultCamera.label,
            });
            return;
          }
          setCamera(null);
        }
      } catch (error) {
        console.error("Error enumerating devices:", error);
      }
    };

    if (!camera && !availableCameras.length) {
      getVideoDevices();
    }
  }, [camera, availableCameras]);

  useEffect(() => {
    if (photo) {
      photoRef.current = photo;
    }
  }, [photo]);

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
      let cameraConstraints: MediaStreamConstraints | null = null;

      if (photoRef.current && photoRef.current.theme?.frame.slotDimensions) {
        cameraConstraints = getCameraConstraints(
          photoRef.current.theme.frame.slotDimensions.width,
          photoRef.current.theme.frame.slotDimensions.height,
          camera?.deviceId
        );
      }

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
  }, [camera?.deviceId, cameraStream, pathName]);

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
      }}
    >
      {children}
    </CameraContext.Provider>
  );
};

export const useCamera = () => useContext(CameraContext);
