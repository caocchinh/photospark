"use client";
import {CardContent, CardTitle} from "@/components/ui/card";
import {CLICK_SOUND_URL, CLICK_SOUND_VOUME, FrameOptions, ThemeSelectButton} from "@/constants/constants";
import {usePhotoState} from "@/context/PhotoStateContext";
import Image from "next/image";
import React, {useEffect} from "react";
import Link from "next/link";
import {ROUTES} from "@/constants/routes";
import {useTranslation} from "react-i18next";
import {FaArrowLeftLong} from "react-icons/fa6";
import SingularLayout from "@/components/layout-image/SingularLayout";
import DoubleLayout from "@/components/layout-image/DoubleLayout";
import {cn} from "@/lib/utils";
import {ValidThemeType} from "@/constants/types";
import {useCountdown} from "@/context/CountdownContext";
import useSound from "use-sound";

const ThemePage = () => {
  const {photo, setPhoto} = usePhotoState();
  const [playClick] = useSound(CLICK_SOUND_URL, {volume: CLICK_SOUND_VOUME});

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!photo) {
      window.location.href = ROUTES.HOME;
      return;
    }
  }, [photo]);
  const {autoSelectCountdownTimer} = useCountdown();
  const {t} = useTranslation();

  const handleThemeChange = (name: ValidThemeType) => {
    if (!setPhoto || !photo) return;
    setPhoto((prev) => {
      if (prev) {
        return {
          ...prev,
          theme: {
            name: name,
            frame: FrameOptions[name].filter((item) => item.type == photo.frameType)[0],
          },
          quantity: 1,
        };
      }
      return prev;
    });
  };

  return (
    <>
      {photo && (
        <div className={cn("w-full h-full flex items-center", autoSelectCountdownTimer <= 0 ? "pointer-events-none" : null)}>
          <div className="flex items-start w-full justify-evenly">
            <div className="flex flex-col items-center justify-center gap-6 w-max">
              <CardTitle className="text-5xl uppercase">{t("Current layout")}</CardTitle>
              {photo.frameType == "singular" ? <SingularLayout /> : <DoubleLayout />}
              <Link
                onMouseDown={() => playClick()}
                href={ROUTES.HOME}
                className="flex items-center self-start justify-center w-full gap-2 py-2 text-white bg-black rounded ext-white"
              >
                <FaArrowLeftLong />
                {t("Choose another layout")}
              </Link>
            </div>
            <div className="flex flex-col items-center justify-center gap-8 w-max">
              <CardTitle className="text-5xl uppercase">{t("Choose a theme")}</CardTitle>
              <CardContent className="flex items-center justify-center gap-8 flex-wrap w-[90%]">
                {ThemeSelectButton.map((item, index) => {
                  const hasMatchingFrame = FrameOptions[item.theme].some((frame) => frame.type === photo.frameType);
                  return hasMatchingFrame ? (
                    <Link
                      onMouseDown={() => playClick()}
                      href={ROUTES.FRAME}
                      onClick={() => handleThemeChange(item.theme)}
                      key={index}
                    >
                      <div
                        className="cursor-pointer w-[220px] h-[220px] hover:scale-[1.02] active:scale-[0.99]"
                        title={item.title}
                      >
                        <Image
                          height={220}
                          width={220}
                          alt={item.title}
                          src={item.image_src}
                          className="w-full h-full rounded"
                          style={item.style}
                        />
                      </div>
                    </Link>
                  ) : null;
                })}
              </CardContent>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ThemePage;
