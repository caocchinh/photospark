"use client";
import {useEffect, useState} from "react";
import Image from "next/image";
import {useTranslation} from "react-i18next";
import {SlidingNumber} from "@/components/ui/sliding-number";
import usePreventNavigation from "@/hooks/usePreventNavigation";
import {ROUTES} from "@/constants/routes";
import {usePhotoState} from "@/context/PhotoStateContext";
import {useRouter} from "next/navigation";

const ReviewPage = () => {
  const {photo, setPhoto} = usePhotoState();
  const [timeLeft, setTimeLeft] = useState(6);
  const router = useRouter();
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!photo) {
      router.push(ROUTES.HOME);
      return;
    }
  }, [photo, router]);
  const {navigateTo} = usePreventNavigation();

  const {t} = useTranslation();
  usePreventNavigation();

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined = undefined;

    if (timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      if (timeLeft == 1) {
        setPhoto!((prev) => ({...prev!, isTransition: true}));
      }
    } else {
      setPhoto!(undefined);
      navigateTo(ROUTES.HOME);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [navigateTo, setPhoto, timeLeft]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-6">
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
          <div className="flex flex-col items-center justify-center gap-5">
            <div className="flex flex-col items-center justify-center gap-2">
              <h1 className="text-4xl font-semibold text-center">{t("Please go outside to take the photo")}</h1>
              <span className="text-4xl font-bold text-rose-500 ">
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
