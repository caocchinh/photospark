"use client";
import {ValidFrameType} from "@/constants/constants";
import {usePhoto} from "@/context/PhotoContext";
import React from "react";
import usePreventNavigation from "@/hooks/usePreventNavigation";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import CollabTransition from "@/components/CollabTransition";
import {useTranslation} from "react-i18next";
import {Button} from "@/components/ui/button";
import {Check, ChevronsUpDown} from "lucide-react";
import {cn} from "@/lib/utils";
import Image from "next/image";
import {Command, CommandGroup, CommandItem, CommandList} from "@/components/ui/command";
import {CardContent, CardTitle} from "@/components/ui/card";
import {BorderTrail} from "@/components/ui/border-trail";
import Link from "next/link";
import {ROUTES} from "@/constants/routes";

const language = [
  {
    value: "vi",
    label: "Tiếng Việt",
    image_src: "/vn.svg",
  },
  {
    value: "en",
    label: "English",
    image_src: "/gb.svg",
  },
  {
    value: "fr",
    label: "Français",
    image_src: "/fr.svg",
  },
  {
    value: "cn",
    label: "繁體中文",
    image_src: "/cn.svg",
  },
];

const ThemePage = () => {
  const {photo, setPhoto} = usePhoto();
  const {t, i18n} = useTranslation();
  usePreventNavigation();

  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(() => {
    const defaultLang = language.find((lang) => lang.value === i18n.language);
    return defaultLang?.label ?? "English";
  });

  const handleLanguageSelect = (currentValue: string) => {
    const selectedLang = language.find((lang) => lang.label === currentValue);
    if (selectedLang) {
      setValue(currentValue);
      i18n.changeLanguage(selectedLang.value);
    }
    setOpen(false);
  };

  const handleTypeChange = (type: ValidFrameType) => {
    if (!setPhoto) return;
    setPhoto(() => {
      return {
        images: [],
        selectedImages: [],
        theme: null,
        quantity: null,
        video: {
          data: new Blob(),
          r2_url: null,
        },
        isTransition: false,
        id: null,
        error: false,
        frameType: type,
      };
    });
  };

  return (
    <div className="w-full h-full flex items-center justify-start flex-col">
      {!photo && <CollabTransition />}

      <Popover
        open={open}
        onOpenChange={setOpen}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between self-end"
          >
            <div className="flex items-center gap-2 justify-center">
              {value ? language.find((language) => language.label === value)?.label : t("Select language...")}
              <Image
                src={language.find((language) => language.label === value)?.image_src ?? ""}
                alt="language"
                width={20}
                height={20}
              />
            </div>
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandGroup>
                {language.map((language) => (
                  <CommandItem
                    key={language.value}
                    value={language.label}
                    onSelect={handleLanguageSelect}
                  >
                    {language.label}
                    <Image
                      src={language.image_src}
                      alt="language"
                      width={20}
                      height={20}
                    />
                    <Check className={cn("ml-auto", value === language.label ? "opacity-100" : "opacity-0")} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <CardTitle className="text-4xl uppercase mb-8">{t("Choose a layout")}</CardTitle>
      <CardContent className="flex items-center justify-center gap-12 flex-wrap w-[90%]">
        <Link
          href={ROUTES.THEME}
          className="relative shadow-lg border cursor-pointer hover:scale-[1.02] active:scale-[0.99]"
          onClick={() => handleTypeChange("singular")}
        >
          <BorderTrail
            style={{
              boxShadow: "0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)",
            }}
            size={100}
          />
          <Image
            src="/single.jpg"
            width={300}
            height={700}
            alt="single"
          />
        </Link>
        <Link
          href={ROUTES.THEME}
          className="shadow-lg border cursor-pointer hover:scale-[1.02] active:scale-[0.99] flex items-center justify-center gap-4 relative"
          onClick={() => handleTypeChange("double")}
        >
          <BorderTrail
            style={{
              boxShadow: "0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)",
            }}
            size={100}
          />
          {Array.from({length: 2}).map((_, index) => (
            <Image
              key={index}
              src="/double.jpg"
              width={150}
              height={150}
              alt="single"
            />
          ))}
        </Link>
      </CardContent>
    </div>
  );
};

export default ThemePage;
