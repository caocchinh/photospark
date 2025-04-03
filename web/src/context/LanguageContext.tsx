"use client";

import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";

interface LanguageContextType {
  isLanguageInitialized: boolean;
}

const LanguageContext = createContext<LanguageContextType>({isLanguageInitialized: false});

export const LanguageProvider = ({children}: {children: ReactNode}) => {
  const {i18n} = useTranslation();
  const [isLanguageInitialized, setIsLanguageInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("selectedLanguage");
      if (savedLanguage) {
        i18n.changeLanguage(savedLanguage);
      }
    }
    setIsLanguageInitialized(true);
  }, [i18n]);

  return <LanguageContext.Provider value={{isLanguageInitialized}}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
