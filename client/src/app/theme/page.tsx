"use client";
import {CardContent, CardTitle} from "@/components/ui/card";
import {FrameOptions, ThemeSelectButton} from "@/constants/constants";
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

const ThemePage = () => {
  const {photo, setPhoto} = usePhotoState();
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!photo || !photo.frameType) {
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
          <div className="flex items-start justify-evenly w-full">
            <div className="flex flex-col w-max items-center justify-center gap-6">
              <CardTitle className="text-5xl uppercase">{t("Current layout")}</CardTitle>
              {photo.frameType == "singular" ? <SingularLayout /> : <DoubleLayout />}
              <Link
                href={ROUTES.HOME}
                className="w-full self-start ext-white py-2 rounded flex items-center justify-center gap-2 bg-black text-white"
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
                          className="rounded w-full h-full"
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
