"use client";
import {CardContent, CardTitle} from "@/components/ui/card";
import {FrameDefaults, ThemeSelectButton, ValidThemeType} from "@/constants/constants";
import {usePhoto} from "@/context/PhotoContext";
import Image from "next/image";
import React, {useEffect} from "react";
import Link from "next/link";
import {ROUTES} from "@/constants/routes";
import {useTranslation} from "react-i18next";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {FaArrowLeftLong} from "react-icons/fa6";

const ThemePage = () => {
  const {photo, setPhoto} = usePhoto();
  const {t} = useTranslation();
  const router = useRouter();
  useEffect(() => {
    if (!photo) return router.push(ROUTES.HOME);
    if (!photo.frameType) return router.push(ROUTES.HOME);
  }, [photo, router]);
  const handleThemeChange = (name: ValidThemeType) => {
    if (!setPhoto) return;
    setPhoto((prev) => {
      if (prev) {
        return {
          ...prev,
          theme: {
            name: name,
            frame: FrameDefaults[name],
          },
          quantity: 1 * (FrameDefaults[name].type == "singular" ? 1 : 2),
        };
      }
      return prev;
    });
  };

  return (
    <div className="w-full h-full flex items-center justify-start flex-col">
      <Link
        href={ROUTES.HOME}
        className="w-[250px] self-start"
      >
        <Button className="w-full">
          <FaArrowLeftLong />
          {t("Choose another layout")}
        </Button>
      </Link>
      <div className="flex flex-col items-center justify-center gap-8 w-full">
        <CardTitle className="text-4xl uppercase">{t("Choose a theme")}</CardTitle>
        <CardContent className="flex items-center justify-center gap-8 flex-wrap w-[90%]">
          {ThemeSelectButton.map((item, index) => (
            <Link
              href={ROUTES.LAYOUT}
              onClick={() => handleThemeChange(item.theme)}
              key={index}
            >
              <div
                className="cursor-pointer w-[200px] h-[200px] hover:scale-[1.02] active:scale-[0.99]"
                title={item.title}
              >
                <Image
                  height={220}
                  width={220}
                  alt={item.title}
                  src={item.image_src}
                  className="rounded"
                  style={item.style}
                />
              </div>
            </Link>
          ))}
        </CardContent>
      </div>
    </div>
  );
};

export default ThemePage;
