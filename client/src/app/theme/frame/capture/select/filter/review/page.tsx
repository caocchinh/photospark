"use client";
import {useEffect, useState} from "react";
import Image from "next/image";
import {useTranslation} from "react-i18next";
import {SlidingNumber} from "@/components/ui/sliding-number";
import usePreventNavigation from "@/hooks/usePreventNavigation";
import {ROUTES} from "@/constants/routes";
import {usePhotoState} from "@/context/PhotoStateContext";

const ReviewPage = () => {
  const {photo, setPhoto} = usePhotoState();
  const {navigateTo} = usePreventNavigation();
  const [timeLeft, setTimeLeft] = useState(6);
  const {t} = useTranslation();

  useEffect(() => {
    if (!photo) return navigateTo(ROUTES.HOME);
    if (!photo.frameType) return navigateTo(ROUTES.HOME);
    if (!photo.theme) return navigateTo(ROUTES.HOME);
    if (photo.images.length < photo.theme.frame.slotCount) return navigateTo(ROUTES.HOME);
    if (!photo.video.r2_url) return navigateTo(ROUTES.HOME);
  }, [photo, navigateTo, setPhoto]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      if (timeLeft == 1) {
        setPhoto!((prev) => ({...prev!, isTransition: true}));
      }
      return () => clearInterval(timerId);
    } else {
      setPhoto!(undefined);
      navigateTo(ROUTES.HOME);
    }
  }, [navigateTo, setPhoto, timeLeft]);

  return (
    <div className="w-full h-full flex items-center justify-center gap-6 flex-col">
      {photo && (
        <div className="flex items-center justify-around gap-4">
          <video
            className="w-[70%] rounded-lg"
            src={photo.video.r2_url!}
            autoPlay
            muted
            loop
            playsInline
            ref={(el) => {
              if (el) el.playbackRate = 8;
            }}
          />
          <div className="flex flex-col gap-5 items-center justify-center">
            <div className="flex gap-2 flex-col items-center justify-center">
              <h1 className="text-4xl font-semibold text-center">{t("Please go outside to take the photo")}</h1>
              <span className="text-rose-500 text-4xl font-bold ">
                <SlidingNumber
                  value={timeLeft}
                  padStart={true}
                />
              </span>
            </div>
            <div className="flex items-center justify-center">
              <Image
                src="/dance.gif"
                alt="dance"
                unoptimized
                width={160}
                height={160}
              />
              <Image
                src="/heart.gif"
                alt="heart"
                unoptimized
                width={160}
                height={160}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewPage;
