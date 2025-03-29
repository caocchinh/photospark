"use client";
import usePreventNavigation from "@/hooks/usePreventNavigation";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import CollabTransition from "@/components/CollabTransition";
import {useTranslation} from "react-i18next";
import {Button} from "@/components/ui/button";
import {Check, ChevronsUpDown} from "lucide-react";
import {cn} from "@/lib/utils";
import Image from "next/image";
import {Command, CommandGroup, CommandItem, CommandList} from "@/components/ui/command";
import {Card, CardContent, CardTitle} from "@/components/ui/card";
import Link from "next/link";
import {ROUTES} from "@/constants/routes";
import SingularLayout from "@/components/layout-image/SingularLayout";
import DoubleLayout from "@/components/layout-image/DoubleLayout";
import {MdSettings} from "react-icons/md";
import {useCallback, useState} from "react";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import CameraSetting from "@/components/CameraSetting";
import {RxCross1} from "react-icons/rx";
import Cooldown from "@/components/Cooldown";
import {LANGUAGE_LIST} from "@/constants/constants";
import {usePhotoState} from "@/context/PhotoStateContext";
import {useCountdown} from "@/context/CountdownContext";

const LayoutPage = () => {
  const {photo, updateFrameType} = usePhotoState();
  const {autoSelectCountdownTimer} = useCountdown();
  const {t, i18n} = useTranslation();
  usePreventNavigation();
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isWrongPassword, setIsWrongPassword] = useState(false);
  const [language, setLanguage] = useState(() => {
    const defaultLang = LANGUAGE_LIST.find((lang) => lang.value === i18n.language);
    return defaultLang?.label ?? "English";
  });

  const handleLanguageSelect = useCallback(
    (currentValue: string) => {
      const selectedLang = LANGUAGE_LIST.find((lang) => lang.label === currentValue);
      if (selectedLang) {
        setLanguage(currentValue);
        i18n.changeLanguage(selectedLang.value);
      }
      setIsOpen(false);
    },
    [i18n]
  );

  return (
    <>
      <Cooldown />
      <div
        className={cn(
          "w-[90%] h-full flex items-center justify-start flex-col relative",
          autoSelectCountdownTimer <= 0 ? "pointer-events-none" : null
        )}
      >
        {!photo && <CollabTransition />}

        <Popover
          open={isOpen}
          onOpenChange={setIsOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isOpen}
              className="w-[200px] justify-between self-end"
            >
              <div className="flex items-center gap-2 justify-center">
                {language ? LANGUAGE_LIST.find((_language) => _language.label === language)?.label : t("Select language...")}
                <Image
                  src={LANGUAGE_LIST.find((_language) => _language.label === language)?.image_src ?? ""}
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
                  {LANGUAGE_LIST.map((_language) => (
                    <CommandItem
                      key={_language.value}
                      value={_language.label}
                      onSelect={handleLanguageSelect}
                    >
                      {_language.label}
                      <Image
                        src={_language.image_src}
                        alt="language"
                        width={20}
                        height={20}
                      />
                      <Check className={cn("ml-auto", language === _language.label ? "opacity-100" : "opacity-0")} />
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
            onClick={() => updateFrameType("singular")}
            tabIndex={-1}
          >
            <SingularLayout />
          </Link>
          <Link
            href={ROUTES.THEME}
            className=" cursor-pointer hover:scale-[1.02] active:scale-[0.99] "
            onClick={() => updateFrameType("double")}
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
            className="w-[250px]"
            sideOffset={10}
            style={{marginRight: "77px"}}
          >
            {isPasswordCorrect ? (
              <CameraSetting />
            ) : (
              <form
                className="flex flex-col gap-4 w-full h-full"
                onSubmit={(e) => {
                  e.preventDefault();
                  setIsPasswordCorrect(password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD);
                  setIsWrongPassword(password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD);
                }}
              >
                <Label
                  htmlFor="password"
                  className={cn(isWrongPassword ? "text-red-500" : "", "text-center")}
                >
                  {t("Enter password to access settings")}
                </Label>
                <div className="relative">
                  <Input
                    type="password"
                    value={password}
                    id="password"
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setIsWrongPassword(false);
                    }}
                    className={cn(isWrongPassword ? "border-red-500" : "")}
                  />
                  {password.length > 0 && (
                    <RxCross1
                      className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-red-500"
                      onClick={() => {
                        setPassword("");
                        setIsWrongPassword(false);
                      }}
                    />
                  )}
                </div>
                <Card className="flex items-center justify-center border w-full h-full flex-wrap p-2 gap-2">
                  {Array.from({length: 9}).map((_, index) => (
                    <div
                      onClick={() => {
                        setPassword(password + (index + 1));
                        setIsWrongPassword(false);
                      }}
                      key={index}
                      className="w-[25%] h-12 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center cursor-pointer "
                    >
                      {index + 1}
                    </div>
                  ))}
                </Card>

                <Button
                  type="submit"
                  className={cn(isWrongPassword ? "bg-red-500 hover:bg-red-600" : "")}
                >
                  {isWrongPassword ? t("Wrong password") : t("Submit")}
                </Button>
              </form>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
};

export default LayoutPage;
