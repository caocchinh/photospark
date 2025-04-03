"use client";
import {ImageTable, ProcessedImageTable, VideoTable} from "@/drizzle/schema";
import {createContext, ReactNode, useContext} from "react";

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
  return <ProcessedImageContext.Provider value={{processedImage, images, video}}>{children}</ProcessedImageContext.Provider>;
};

export const useProcessedImage = () => useContext(ProcessedImageContext);
