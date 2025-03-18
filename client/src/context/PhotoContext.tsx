"use client";
import {AUTO_SELECT_COUNTDOWN_DURATION, FrameOptions, PhotoOptions, ValidThemeType} from "@/constants/constants";
import {createContext, ReactNode, useContext, useEffect, useRef, useState, useCallback} from "react";
import {usePathname, useRouter} from "next/navigation";
import {ROUTES} from "@/constants/routes";
import {getCameraConstraints} from "@/lib/utils";

interface Camera {
  deviceId: string;
  label: string;
}

export interface PhotoContextType {
  photo: PhotoOptions<ValidThemeType> | undefined;
  setPhoto: React.Dispatch<React.SetStateAction<PhotoOptions<ValidThemeType> | undefined>> | undefined;
  autoSelectCountdown: number;
  camera: Camera | null;
  setCamera: React.Dispatch<React.SetStateAction<Camera | null>> | undefined;
  availableCameras: Array<{deviceId: string; label: string}>;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  cameraStream: MediaStream | null;
}

const PhotoContext = createContext<PhotoContextType>({
  photo: undefined,
  setPhoto: undefined,
  autoSelectCountdown: AUTO_SELECT_COUNTDOWN_DURATION,
  camera: null,
  setCamera: undefined,
  availableCameras: [],
  startCamera: () => Promise.resolve(),
  stopCamera: () => {},
  cameraStream: null,
});

export const PhotoProvider = ({children}: {children: ReactNode}) => {
  const [photo, setPhoto] = useState<PhotoOptions<ValidThemeType> | undefined>(undefined);
  const photoRef = useRef(photo);
  const [autoSelectCountdown, setAutoSelectCountdown] = useState(AUTO_SELECT_COUNTDOWN_DURATION);
  const pathname = usePathname();
  const [shouldRunCountdown, setShouldRunCountdown] = useState(false);
  const [cameraConstraints, setCameraConstraints] = useState<MediaStreamConstraints | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const router = useRouter();
  const routerRef = useRef(router);

  const [camera, setCamera] = useState<Camera | null>(null);
  const [availableCameras, setAvailableCameras] = useState<Array<{deviceId: string; label: string}>>([]);

  useEffect(() => {
    const isValidPage = pathname === ROUTES.HOME || pathname === ROUTES.THEME || pathname === ROUTES.LAYOUT;
    if (isValidPage && photoRef.current && autoSelectCountdown === AUTO_SELECT_COUNTDOWN_DURATION) {
      setShouldRunCountdown(true);
    } else if (!isValidPage) {
      setShouldRunCountdown(false);
      if (autoSelectCountdown !== AUTO_SELECT_COUNTDOWN_DURATION) {
        setAutoSelectCountdown(AUTO_SELECT_COUNTDOWN_DURATION);
      }
    }
  }, [pathname, autoSelectCountdown]);

  useEffect(() => {
    if (autoSelectCountdown >= 0) {
      photoRef.current = photo;
    }
  }, [autoSelectCountdown, photo]);

  useEffect(() => {
    if (autoSelectCountdown >= 0) {
      routerRef.current = router;
    }
  }, [router, autoSelectCountdown]);

  useEffect(() => {
    if (shouldRunCountdown && photoRef.current) {
      if (autoSelectCountdown > 0) {
        const timer = setTimeout(() => {
          setAutoSelectCountdown(autoSelectCountdown - 1);
        }, 1000);
        return () => clearTimeout(timer);
      }
      if (autoSelectCountdown <= 0) {
        let themeToUse = photoRef.current.theme;
        const frameType = photoRef.current!.frameType;

        if (!themeToUse) {
          const validThemeNames = Object.keys(FrameOptions).filter((themeName) =>
            FrameOptions[themeName as ValidThemeType].some((frame) => frame.type === frameType)
          ) as ValidThemeType[];

          const randomThemeName = validThemeNames[Math.floor(Math.random() * validThemeNames.length)];

          const themesFrames = FrameOptions[randomThemeName].filter((frame) => frame.type === frameType);
          const randomThemeFrame = themesFrames[Math.floor(Math.random() * themesFrames.length)];

          themeToUse = {name: randomThemeName, frame: randomThemeFrame};
        } else {
          const filteredFrame = FrameOptions[themeToUse!.name].filter((item) => item.type === frameType);
          const randomFrame = filteredFrame[Math.floor(Math.random() * filteredFrame.length)];
          themeToUse = {name: themeToUse!.name, frame: randomFrame};
        }

        setPhoto((prev) => {
          if (prev) {
            return {
              ...prev,
              theme: prev.theme ? prev.theme : {name: themeToUse!.name, frame: themeToUse!.frame},
              quantity: prev.quantity ? prev.quantity : 1 * (frameType == "singular" ? 1 : 2),
              images: [],
              selectedImages: [],
              video: {
                data: new Blob(),
                r2_url: null,
              },
              id: null,
              error: false,
              isTransition: false,
            };
          }
          return prev;
        });
        routerRef.current.push(ROUTES.CAPTURE);
      }
    }
  }, [shouldRunCountdown, autoSelectCountdown]);

  useEffect(() => {
    const getVideoDevices = async () => {
      const deviceInfos = await navigator.mediaDevices.enumerateDevices();
      const availableVideoDevices = deviceInfos.filter((device) => device.kind === "videoinput");
      setCamera({deviceId: availableVideoDevices[0].deviceId, label: availableVideoDevices[0].label});
      setAvailableCameras(availableVideoDevices);
    };

    if (!camera && !availableCameras.length) {
      getVideoDevices();
    }
  }, [camera, availableCameras]);

  useEffect(() => {
    if (!photo?.theme?.frame.slotDimensions) return;

    setCameraConstraints({
      video: getCameraConstraints(photo.theme.frame.slotDimensions.width, photo.theme.frame.slotDimensions.height, camera?.deviceId),
    });
  }, [photo?.theme?.frame.slotDimensions, camera]);

  const startCamera = useCallback(async () => {
    try {
      console.log("Creating new stream");
      if (!cameraStream) {
        setCameraStream(
          await navigator.mediaDevices.getUserMedia({
            video: cameraConstraints
              ? cameraConstraints.video
              : {
                  width: {ideal: 1280},
                  height: {ideal: 720},
                  aspectRatio: {exact: 16 / 9},
                  deviceId: camera?.deviceId ? {exact: camera.deviceId} : undefined,
                },
          })
        );
      }
      console.log("Camera started successfully");
    } catch (err) {
      console.error("Error accessing the camera: ", err);
    }
  }, [camera?.deviceId, cameraConstraints, cameraStream]);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      console.log("Stopping stream");
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  }, [cameraStream]);

  // useEffect(() => {
  //   if ((pathname === ROUTES.LAYOUT || pathname === ROUTES.CAPTURE || autoSelectCountdown <= 7) && camera && cameraConstraints) {
  //     console.log("skibidi");
  //     startCamera();
  //   }

  //   return () => {
  //     stopCamera();
  //   };
  // }, [autoSelectCountdown, camera, cameraConstraints, pathname, startCamera, stopCamera]);

  return (
    <PhotoContext.Provider value={{photo, setPhoto, autoSelectCountdown, camera, setCamera, availableCameras, startCamera, stopCamera, cameraStream}}>
      {children}
    </PhotoContext.Provider>
  );
};

export const usePhoto = () => useContext(PhotoContext);
