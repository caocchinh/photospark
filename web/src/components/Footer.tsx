"use client";
import {TextShimmer} from "@/components/ui/text-shimmer";
import Image from "next/image";
import {useTranslation} from "react-i18next";

const Footer = () => {
  const {t} = useTranslation();

  return (
    <footer className="w-full bottom-0 bg-black  ">
      <a
        className="w-full h-full cursor-pointer flex items-center justify-center flex-col sm:flex-row pb-4 sm:pb-1"
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
