"use client";

import {LANGUAGE_LIST} from "@/constants/constants";
import {useCallback, useState, useEffect} from "react";
import {Command, CommandGroup, CommandItem, CommandList} from "@/components/ui/command";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {Check, ChevronsUpDown} from "lucide-react";
import Image from "next/image";
import {cn} from "@/lib/utils";
import {useTranslation} from "react-i18next";

const LanguageBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {t, i18n} = useTranslation();
  const [language, setLanguage] = useState("English");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("selectedLanguage");
      if (savedLanguage) {
        const langObject = LANGUAGE_LIST.find((lang) => lang.value === savedLanguage);
        if (langObject) {
          i18n.changeLanguage(savedLanguage);
          setLanguage(langObject.label);
          return;
        }
      }
    }
    const defaultLang = LANGUAGE_LIST.find((lang) => lang.value === i18n.language);
    if (defaultLang) {
      setLanguage(defaultLang.label);
    }
  }, [i18n]);

  const handleLanguageSelect = useCallback(
    (currentValue: string) => {
      const selectedLang = LANGUAGE_LIST.find((lang) => lang.label === currentValue);
      if (selectedLang) {
        setLanguage(currentValue);
        i18n.changeLanguage(selectedLang.value);
        localStorage.setItem("selectedLanguage", selectedLang.value);
      }
      setIsOpen(false);
    },
    [i18n]
  );

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-[200px] justify-between cursor-pointer"
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
                  className="cursor-pointer"
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
  );
};

export default LanguageBar;
