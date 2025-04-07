"use client";

import {createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {usePhotoState} from "./PhotoStateContext";
import {ROUTES} from "@/constants/routes";
import {AUTO_SELECT_COUNTDOWN_DURATION, FrameOptions} from "@/constants/constants";
import {ValidThemeType} from "@/constants/types";
import {useSocket} from "./SocketContext";

interface CountdownContextType {
  autoSelectCountdownTimer: number;
  shouldRunCountdown: boolean;
  setShouldRunCountdown: React.Dispatch<React.SetStateAction<boolean>> | undefined;
}

const CountdownContext = createContext<CountdownContextType>({
  autoSelectCountdownTimer: AUTO_SELECT_COUNTDOWN_DURATION,
  shouldRunCountdown: false,
  setShouldRunCountdown: undefined,
});

export const CountdownProvider = ({children}: {children: ReactNode}) => {
  const {photo, setPhoto} = usePhotoState();
  const [autoSelectCountdownTimer, setAutoSelectCountdownTimer] = useState(AUTO_SELECT_COUNTDOWN_DURATION);
  const [shouldRunCountdown, setShouldRunCountdown] = useState(false);
  const pathName = usePathname();
  const router = useRouter();
  const routerRef = useRef(router);
  const photoRef = useRef(photo);
  const {isSocketConnected, isOnline} = useSocket();

  const isValidPageForCountdown = useMemo(() => {
    return pathName === ROUTES.HOME || pathName === ROUTES.THEME || pathName === ROUTES.FRAME;
  }, [pathName]);

  // Update refs to keep latest values
  useEffect(() => {
    if (autoSelectCountdownTimer >= 0) {
      photoRef.current = photo;
    }
  }, [autoSelectCountdownTimer, photo]);

  useEffect(() => {
    if (autoSelectCountdownTimer >= 0) {
      routerRef.current = router;
    }
  }, [router, autoSelectCountdownTimer]);

  // Control countdown start/stop
  useEffect(() => {
    if (autoSelectCountdownTimer === AUTO_SELECT_COUNTDOWN_DURATION) {
      if (isValidPageForCountdown && photoRef.current && isSocketConnected && isOnline) {
        setShouldRunCountdown(true);
      }
    } else if (!isValidPageForCountdown) {
      setShouldRunCountdown(false);
      if (autoSelectCountdownTimer !== AUTO_SELECT_COUNTDOWN_DURATION) {
        setAutoSelectCountdownTimer(AUTO_SELECT_COUNTDOWN_DURATION);
      }
    }
  }, [autoSelectCountdownTimer, isSocketConnected, isOnline, isValidPageForCountdown, pathName]);

  // Countdown timer and auto-navigation
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined = undefined;

    if (shouldRunCountdown && photoRef.current && isSocketConnected && isOnline) {
      if (autoSelectCountdownTimer > 0) {
        timer = setTimeout(() => {
          setAutoSelectCountdownTimer(autoSelectCountdownTimer - 1);
        }, 1000);
      } else if (autoSelectCountdownTimer <= 0 && setPhoto) {
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

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [shouldRunCountdown, autoSelectCountdownTimer, isSocketConnected, isOnline, setPhoto]);

  return (
    <CountdownContext.Provider
      value={{
        autoSelectCountdownTimer,
        shouldRunCountdown,
        setShouldRunCountdown,
      }}
    >
      {children}
    </CountdownContext.Provider>
  );
};

export const useCountdown = () => useContext(CountdownContext);
