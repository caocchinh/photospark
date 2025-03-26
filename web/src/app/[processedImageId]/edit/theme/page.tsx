"use client";
import {CardContent, CardTitle} from "@/components/ui/card";
import {FrameOptions, ThemeSelectButton} from "@/constants/constants";
import {usePhoto} from "@/context/PhotoContext";
import Image from "next/image";
import React, {useEffect} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {FaArrowLeftLong} from "react-icons/fa6";
import {ValidThemeType} from "@/constants/types";
import {useTranslation} from "react-i18next";
import {useReloadConfirm} from "@/hooks/useReloadConfirm";
import {Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator} from "@/components/ui/breadcrumb";

const ThemePage = () => {
  useReloadConfirm();
  const {photo, setPhoto} = usePhoto();
  const router = useRouter();
  const {t} = useTranslation();
  useEffect(() => {
    if (!photo?.frameType) return router.push(`/${photo?.previousProcessedImageId}/edit/`);
  }, [photo, router]);
  const handleThemeChange = (name: ValidThemeType) => {
    if (!setPhoto || !photo) return;
    setPhoto((prev) => {
      if (prev) {
        return {
          ...prev,
          theme: {
            name: name,
            frame: FrameOptions[name].filter((item) => item.type == photo.frameType)[0],
          },
          quantity: 1,
        };
      }
      return prev;
    });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full gap-12">
      <div className="w-[90%] flex items-center justify-between  sm:flex-row flex-col">
        <Link
          href={`/${photo?.previousProcessedImageId}/edit/`}
          className="w-[260px] p-2 rounded flex items-center justify-center gap-2 bg-black text-white order-1 sm:order-0"
        >
          <FaArrowLeftLong />
          {t("Choose another layout")}
        </Link>
        <Breadcrumb className="order-0 sm:order-1 -mt-[45px] sm:mt-0 mb-[35px] sm:mb-0 self-end sm:self-center">
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link href={`/${photo?.previousProcessedImageId}/`}>{t("Home")}</Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Link href={`/${photo?.previousProcessedImageId}/edit/`}>{t("Layout")}</Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <p className="text-black">{t("Theme")}</p>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {photo && photo.frameType && (
        <div className="flex flex-col items-center justify-center w-full gap-12">
          <div className="flex flex-col items-center justify-center gap-8 w-[80%]">
            <CardTitle className="text-5xl font-semibold uppercase text-center">{t("Choose a theme")}</CardTitle>
            <CardContent className="flex items-center justify-center gap-8 flex-wrap w-[90%]">
              {ThemeSelectButton.map((item, index) => {
                const hasMatchingFrame = FrameOptions[item.theme].some((frame) => frame.type === photo.frameType);
                return hasMatchingFrame ? (
                  <Link
                    href={`/${photo?.previousProcessedImageId}/edit/theme/frame`}
                    onClick={() => handleThemeChange(item.theme)}
                    key={index}
                  >
                    <div
                      className="cursor-pointer w-[220px] h-[220px] hover:scale-[1.02] active:scale-[0.99]"
                      title={item.title}
                    >
                      <Image
                        height={220}
                        width={220}
                        alt={item.title}
                        src={item.image_src}
                        className="rounded w-full h-full"
                        style={item.style}
                      />
                    </div>
                  </Link>
                ) : null;
              })}
            </CardContent>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemePage;
