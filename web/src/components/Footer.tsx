"use client";
import {TextShimmer} from "@/components/ui/text-shimmer";
import Image from "next/image";
import {useTranslation} from "react-i18next";

const Footer = () => {
  const {t} = useTranslation();

  return (
    <footer className="bottom-0 w-full bg-black ">
      <a
        className="flex flex-col items-center justify-center w-full h-full pb-4 cursor-pointer sm:flex-row sm:pb-1"
        target="_blank"
        rel="noopener"
        href="https://www.instagram.com/vectr.vcp/"
      >
        <TextShimmer
          className="whitespace-wrap [--base-color:#f97316] [--base-gradient-color:#fdba74] text-center text-md p-2 gap-3"
          duration={6}
        >
          {t("This application is developed and sponsored by VECTR")}
        </TextShimmer>
        <Image
          width={25}
          height={25}
          src="/vectr.webp"
          alt="Vectr logo"
        />
      </a>
    </footer>
  );
};

export default Footer;
