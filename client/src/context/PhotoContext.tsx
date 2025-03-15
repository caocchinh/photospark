"use client";
import {AUTO_SELECT_COUNTDOWN_DURATION, FrameOptions, PhotoOptions, ValidThemeType} from "@/constants/constants";
import {createContext, ReactNode, useContext, useEffect, useRef, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {ROUTES} from "@/constants/routes";

interface PhotoContextType {
  photo: PhotoOptions<ValidThemeType> | undefined;
  setPhoto: React.Dispatch<React.SetStateAction<PhotoOptions<ValidThemeType> | undefined>> | undefined;
  autoSelectCountdown: number;
}

const PhotoContext = createContext<PhotoContextType>({photo: undefined, setPhoto: undefined, autoSelectCountdown: AUTO_SELECT_COUNTDOWN_DURATION});

export const PhotoProvider = ({children}: {children: ReactNode}) => {
  const [photo, setPhoto] = useState<PhotoOptions<ValidThemeType> | undefined>(undefined);
  const photoRef = useRef(photo);

  const [autoSelectCountdown, setAutoSelectCountdown] = useState(AUTO_SELECT_COUNTDOWN_DURATION);
  const pathname = usePathname();
  const [shouldRunCountdown, setShouldRunCountdown] = useState(false);
  const router = useRouter();
  const routerRef = useRef(router);

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

  return <PhotoContext.Provider value={{photo, setPhoto, autoSelectCountdown}}>{children}</PhotoContext.Provider>;
};

export const usePhoto = () => useContext(PhotoContext);
