"use client";
import Image from "next/image";
import { TextShimmer } from "./ui/text-shimmer";
import { useTranslation } from "react-i18next";

const Sponsor = () => {
  const { t } = useTranslation();
  return (
    <footer className="relative dark:border-t-white  flex-wrap px-4 border-t-black border-dashed border-t-2 border-2 py-1  bottom-0 flex items-center justify-center w-full overflow-hidden bg-white gap-2 h-max">
      <TextShimmer
        className="w-max relative   [--base-color:#000000] [--base-gradient-color:white] text-center text-md p-2 gap-3"
        duration={6}
      >
        {t("this_event_is_sponsored_by")}
      </TextShimmer>
      <div className="flex items-center justify-center gap-2">
        <a
          href="https://didongviet.vn/"
          target="_blank"
          rel="noopener noreferrer"
          title="Di Động Việt"
        >
          <Image
            width={160}
            height={160}
            src="/assets/ddv.jpg"
            alt="Di động Việt logo"
          />
        </a>
        <a
          href="https://vinfast.com/"
          target="_blank"
          rel="noopener noreferrer"
          title="Vinfast"
        >
          <Image
            width={50}
            height={50}
            src="/assets/vinfast.jpg"
            alt="Vinfast logo"
          />
        </a>
      </div>
    </footer>
  );
};

export default Sponsor;
