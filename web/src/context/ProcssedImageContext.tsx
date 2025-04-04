"use client";
import GeneralError from "@/components/GeneralError";
import {ImageTable, ProcessedImageTable, VideoTable} from "@/drizzle/schema";
import {isEmbeddedBrowser} from "@/lib/utils";
import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
interface ProcessedImageContextType {
  processedImage?: typeof ProcessedImageTable.$inferSelect;
  images?: Array<typeof ImageTable.$inferSelect>;
  video?: typeof VideoTable.$inferSelect;
}

const ProcessedImageContext = createContext<ProcessedImageContextType>({processedImage: undefined, images: undefined, video: undefined});

export const ProcessedImageProvider = ({
  children,
  processedImage,
  images,
  video,
}: {
  children: ReactNode;
  processedImage: typeof ProcessedImageTable.$inferSelect;
  images: Array<typeof ImageTable.$inferSelect>;
  video?: typeof VideoTable.$inferSelect;
}) => {
  const [isEmbededBrowser, setIsEmbededBrowser] = useState(false);
  const {t} = useTranslation();
  useEffect(() => {
    if (!navigator || !navigator.userAgent || typeof window === "undefined") {
      return;
    }
    setIsEmbededBrowser(isEmbeddedBrowser());
  }, []);

  return (
    <ProcessedImageContext.Provider value={{processedImage, images, video}}>
      {children}

      <GeneralError
        error={isEmbededBrowser}
        message={t("This application is not optimized for embeded browser. Please open the link in an external browser.")}
      />
    </ProcessedImageContext.Provider>
  );
};

export const useProcessedImage = () => useContext(ProcessedImageContext);
