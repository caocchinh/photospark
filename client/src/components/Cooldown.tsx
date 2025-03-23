"use client";
import {AlertDialog, AlertDialogContent, AlertDialogTitle} from "@/components/ui/alert-dialog";
import {useTranslation} from "react-i18next";
import Image from "next/image";
import {useState} from "react";
import {useEffect} from "react";
import {usePhoto} from "@/context/PhotoContext";
import {SlidingNumber} from "./ui/sliding-number";

const Cooldown = () => {
  const {t} = useTranslation();
  const [timeLeft, setTimeLeft] = useState(7);
  const {photo} = usePhoto();

  useEffect(() => {
    if (!photo) {
      if (timeLeft > 0) {
        const timeLeftr = setTimeout(() => {
          setTimeLeft(timeLeft - 1);
        }, 1000);
        return () => clearTimeout(timeLeftr);
      }
    }
  }, [timeLeft, photo]);

  return (
    <>
      {!photo && (
        <AlertDialog open={timeLeft > 0}>
          <AlertDialogContent className="flex flex-col items-center justify-center pointer-events-none">
            <AlertDialogTitle className="text-center uppercase text-3xl font-semibold">
              {t("Please go out and let the other group in!")}
            </AlertDialogTitle>
            <div className="flex items-center justify-center -mt-7 gap-7">
              <Image
                src="/fairy.gif"
                alt="cooldown"
                unoptimized
                width={250}
                height={250}
              />
              <h3 className="text-6xl font-semibold text-red-500">
                <SlidingNumber value={timeLeft} />
              </h3>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};

export default Cooldown;
