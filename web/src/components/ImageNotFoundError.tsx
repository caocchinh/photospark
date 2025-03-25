"use client";
import Link from "next/link";
import {IoIosWarning, IoIosArrowBack} from "react-icons/io";
import {BorderTrail} from "@/components/ui/border-trail";
import {useTranslation} from "react-i18next";

const ImageNotFoundError = () => {
  const {t} = useTranslation();

  return (
    <div className="flex items-center justify-center min-w-screen min-h-screen">
      <div className="-full flex items-center justify-center  w-[90%] md:w-[400px] flex-col gap-4 ">
        <div className="p-6 w-full bg-white rounded-lg shadow-lg flex flex-col items-center justify-center gap-4 border relative">
          <BorderTrail
            style={{
              boxShadow: "0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)",
            }}
            size={100}
          />
          <IoIosWarning
            className="text-red-600"
            size={100}
          />
          <h2 className="text-3xl font-bold text-red-600">{t("An error occurred")}</h2>
          <p className="text-gray-800 text-xl uppercase">{t("Image not found!")}</p>
        </div>
        <Link
          href="/"
          className="text-white text-xl w-full uppercase bg-black px-4 py-2 rounded-md flex items-center justify-center gap-2"
        >
          <IoIosArrowBack
            className="text-white"
            size={20}
          />
          <p className="text-white text-xl">{t("Return to homepage")}</p>
        </Link>
      </div>
    </div>
  );
};

export default ImageNotFoundError;
