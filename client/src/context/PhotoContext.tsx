"use client";
import {FrameOptions, PhotoOptions, ValidThemeType} from "@/constants/constants";
import {createContext, ReactNode, useContext, useEffect, useRef, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {ROUTES} from "@/constants/routes";

interface PhotoContextType {
  photo: PhotoOptions<ValidThemeType> | undefined;
  setPhoto: React.Dispatch<React.SetStateAction<PhotoOptions<ValidThemeType> | undefined>> | undefined;
  timeLeft: number;
}

const PhotoContext = createContext<PhotoContextType>({photo: undefined, setPhoto: undefined, timeLeft: 10});

export const PhotoProvider = ({children}: {children: ReactNode}) => {
  const [photo, setPhoto] = useState<PhotoOptions<ValidThemeType> | undefined>(undefined);
  const photoRef = useRef(photo);

  useEffect(() => {
    photoRef.current = photo;
  }, [photo]);

  const [timeLeft, setTimeLeft] = useState(10);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (photoRef.current && (pathname === ROUTES.HOME || pathname === ROUTES.THEME || pathname === ROUTES.LAYOUT)) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      if (timeLeft <= 0) {
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
        }

        const filteredFrame = FrameOptions[themeToUse!.name].filter((item) => item.type === frameType);
        const randomFrame = filteredFrame[Math.floor(Math.random() * filteredFrame.length)];

        setPhoto((prev) => {
          if (prev) {
            return {
              ...prev,
              theme: prev.theme ? prev.theme : {name: themeToUse!.name, frame: randomFrame},
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
        router.push(ROUTES.CAPTURE);
      }
      return () => clearTimeout(timer);
    } else {
      if (timeLeft !== 10) {
        setTimeLeft(10);
      }
    }
  }, [pathname, router, timeLeft]);

  return <PhotoContext.Provider value={{photo, setPhoto, timeLeft}}>{children}</PhotoContext.Provider>;
};

export const usePhoto = () => useContext(PhotoContext);
