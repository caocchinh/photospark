"use client";
import DoubleLayout from "@/components/layout-image/DoubleLayout";
import SingularLayout from "@/components/layout-image/SingularLayout";
import {ValidFrameType} from "@/constants/types";
import {usePhoto} from "@/context/PhotoContext";
import {useTranslation} from "react-i18next";
import Link from "next/link";
import {FaArrowLeft} from "react-icons/fa6";

const LayoutEditPage = () => {
  const {photo, setPhoto} = usePhoto();
  const {t} = useTranslation();
  const handleTypeChange = (type: ValidFrameType) => {
    if (!setPhoto) return;
    setPhoto((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        frameType: type,
      };
    });
  };

  return (
    <div className="w-full min-h-screen flex items-start justify-center bg-white ">
      <div className="flex flex-col w-[80%] gap-12 items-center justify-center">
        <Link
          href={`/${photo?.previousProcessedImageId}/`}
          className="flex text-center w-[90%] sm:w-[280px] items-center self-center sm:self-start justify-center gap-2 bg-foreground text-background rounded px-4 py-2 hover:opacity-[85%] "
        >
          <FaArrowLeft />
          {t("Back")}
        </Link>
        <h1 className="text-5xl font-semibold uppercase text-center">{t("Choose layout")}</h1>
        <div className="flex items-center justify-center gap-8 flex-wrap w-full">
          <Link
            href={`/${photo?.previousProcessedImageId}/edit/theme`}
            className=" cursor-pointer hover:scale-[1.02] active:scale-[0.99] flex items-center justify-center"
            onClick={() => handleTypeChange("singular")}
            tabIndex={-1}
          >
            <SingularLayout />
          </Link>
          <Link
            href={`/${photo?.previousProcessedImageId}/edit/theme`}
            className=" cursor-pointer hover:scale-[1.02] active:scale-[0.99] flex items-center justify-center"
            onClick={() => handleTypeChange("double")}
            tabIndex={-1}
          >
            <DoubleLayout />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LayoutEditPage;
