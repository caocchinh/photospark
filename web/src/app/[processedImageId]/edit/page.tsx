"use client";
import DoubleLayout from "@/components/layout-image/DoubleLayout";
import SingularLayout from "@/components/layout-image/SingularLayout";
import { ValidFrameType } from "@/constants/types";
import { usePhoto } from "@/context/PhotoContext";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { FrameOptions } from "@/constants/constants";

const LayoutEditPage = () => {
  const { photo, setPhoto } = usePhoto();
  const { t } = useTranslation();

  const handleTypeChange = (type: ValidFrameType) => {
    if (!setPhoto) return;
    setPhoto((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        frameType: type,
        selectedImages: [],
        filter: null,
      };
    });
  };

  return (
    <div className="flex items-start justify-center w-full min-h-screen bg-white ">
      <div className="flex flex-col w-[80%] gap-12 items-center justify-center">
        <div className="flex flex-col items-center justify-between w-full gap-4 sm:flex-row sm:gap-0">
          <Link
            href={`/${photo?.previousProcessedImageId}/`}
            className="flex text-center w-[90%] sm:w-[280px] items-center self-center sm:self-start justify-center gap-2 bg-foreground text-background rounded px-4 py-2 hover:opacity-[85%] order-1 sm:order-0 active:opacity-80"
          >
            <FaArrowLeft />
            {t("Back")}
          </Link>
          <Breadcrumb className="order-0 sm:order-1 -mt-[45px] sm:mt-0 mb-[35px] sm:mb-0 self-end sm:self-center">
            <BreadcrumbList>
              <BreadcrumbItem>
                <Link href={`/${photo?.previousProcessedImageId}/`}>
                  {t("Home")}
                </Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <p className="text-black cursor-pointer">{t("Layout")}</p>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <h1 className="text-5xl font-semibold text-center uppercase">
          {t("Choose a layout")}
        </h1>
        <div className="flex flex-wrap items-center justify-center w-full gap-8">
          {Object.values(FrameOptions).some((frames) =>
            frames.some((frame) => frame.type === "singular")
          ) && (
            <Link
              href={`/${photo?.previousProcessedImageId}/edit/theme`}
              className=" cursor-pointer hover:scale-[1.02] active:scale-[0.99] flex items-center justify-center"
              onClick={() => handleTypeChange("singular")}
              tabIndex={-1}
            >
              <SingularLayout />
            </Link>
          )}

          {Object.values(FrameOptions).some((frames) =>
            frames.some((frame) => frame.type === "double")
          ) && (
            <Link
              href={`/${photo?.previousProcessedImageId}/edit/theme`}
              className=" cursor-pointer hover:scale-[1.02] active:scale-[0.99] flex items-center justify-center"
              onClick={() => handleTypeChange("double")}
              tabIndex={-1}
            >
              <DoubleLayout />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default LayoutEditPage;
