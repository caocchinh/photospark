"use client";

import Image from "next/image";
import {BorderTrail} from "./ui/border-trail";
import {usePathname} from "next/navigation";
import {useTranslation} from "react-i18next";
import {cn} from "@/lib/utils";
import {useLanguage} from "@/context/LanguageContext";

const NavBar = ({captureDate}: {captureDate?: Date}) => {
  const pathname = usePathname();
  const {t} = useTranslation();
  const {isLanguageInitialized} = useLanguage();

  return (
    <>
      {pathname != "/" && (
        <header className={cn("py-3 px-2 sm:px-5 fixed z-[1] w-max left-5 top-4 shadow-lg rounded-md bg-white", !captureDate && "!px-2")}>
          <BorderTrail
            style={{
              boxShadow: "0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)",
            }}
            size={70}
          />
          <div className=" flex w-max justify-center items-center gap-2">
            <Image
              src="/vteam-logo.webp"
              height={50}
              width={50}
              alt="VTEAM Logo"
            />
            <div className={cn("flex flex-col", !captureDate && "!hidden")}>
              <h2 className="text-sm text-muted-foreground">{isLanguageInitialized && t("Capture day")}</h2>
              <p>
                {captureDate?.toLocaleString("vi-VN", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </header>
      )}
    </>
  );
};

export default NavBar;
