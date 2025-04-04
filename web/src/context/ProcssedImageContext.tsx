"use client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {Button} from "@/components/ui/button";
import {ImageTable, ProcessedImageTable, VideoTable} from "@/drizzle/schema";
import {isEmbeddedBrowser} from "@/lib/utils";
import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {MdWarning} from "react-icons/md";
import {RiExternalLinkLine} from "react-icons/ri";

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

      <AlertDialog open={isEmbededBrowser}>
        <AlertDialogContent className="flex flex-col items-center justify-center gap-4 border border-red-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 text-4xl font-bold">{t("An error occurred")}</AlertDialogTitle>
          </AlertDialogHeader>
          <MdWarning
            className="text-red-500"
            size={100}
          />
          <AlertDialogDescription className="text-2xl text-center">
            {t("This application is not optimized for embeded browser. Please open the link in an external browser.")}
          </AlertDialogDescription>
          <AlertDialogFooter>
            <Button asChild>
              <a
                href={window.location.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 cursor-pointer"
              >
                {t("Open in external browser")}
                <RiExternalLinkLine />
              </a>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProcessedImageContext.Provider>
  );
};

export const useProcessedImage = () => useContext(ProcessedImageContext);
