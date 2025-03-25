"use client";
import {TextShimmer} from "@/components/ui/text-shimmer";
import Image from "next/image";
import {useTranslation} from "react-i18next";

const Footer = () => {
  const {t} = useTranslation();

  return (
    <footer className="w-full bottom-0 flex items-center justify-center bg-black flex-col sm:flex-row pb-4 sm:pb-1">
      <TextShimmer
        className="w-max [--base-color:#f97316] [--base-gradient-color:#fdba74] text-center text-md p-2 gap-3"
        duration={6}
      >
        {t("This application is developed and sponsored by VECTR")}
      </TextShimmer>
      <Image
        width={25}
        height={25}
        src="/vectr.png"
        alt="Vectr logo"
      />
    </footer>
  );
};

export default Footer;
