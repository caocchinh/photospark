"use client";
import {ValidFrameType} from "@/constants/constants";
import {usePhoto} from "@/context/PhotoContext";
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
import Link from "next/link";
import {ROUTES} from "@/constants/routes";
import SingularLayout from "@/components/layout-image/SingularLayout";
import DoubleLayout from "@/components/layout-image/DoubleLayout";
import {MdSettings} from "react-icons/md";
import {useState} from "react";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import CameraSetting from "@/components/CameraSetting";

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
  const {photo, setPhoto, autoSelectCountdown} = usePhoto();
  const {t, i18n} = useTranslation();
  usePreventNavigation();
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [value, setValue] = useState(() => {
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
    <div className={cn("w-[90%] h-full flex items-center justify-start flex-col relative", autoSelectCountdown <= 0 ? "pointer-events-none" : null)}>
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

      <CardTitle className="text-5xl uppercase mb-8">{t("Choose a layout")}</CardTitle>
      <CardContent className="flex items-center justify-center gap-12 w-[90%]">
        <Link
          href={ROUTES.THEME}
          className=" cursor-pointer hover:scale-[1.02] active:scale-[0.99]"
          onClick={() => handleTypeChange("singular")}
          tabIndex={-1}
        >
          <SingularLayout />
        </Link>
        <Link
          href={ROUTES.THEME}
          className=" cursor-pointer hover:scale-[1.02] active:scale-[0.99] "
          onClick={() => handleTypeChange("double")}
          tabIndex={-1}
        >
          <DoubleLayout />
        </Link>
      </CardContent>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="absolute top-0 right-0 z-50"
          >
            <MdSettings />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-max"
          sideOffset={10}
          style={{marginRight: "77px"}}
        >
          {isPasswordCorrect ? (
            <CameraSetting />
          ) : (
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                setIsPasswordCorrect(password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD);
              }}
            >
              <Label htmlFor="password">{t("Enter password to access settings")}</Label>
              <Input
                type="password"
                value={password}
                id="password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button type="submit">{t("Submit")}</Button>
            </form>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ThemePage;
