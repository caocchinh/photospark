"use client";
import {PhotoOptions, ValidThemeType} from "@/constants/types";
import {createContext, ReactNode, useContext, useState} from "react";

interface PhotoContextType {
  photo: PhotoOptions<ValidThemeType> | undefined;
  setPhoto: React.Dispatch<React.SetStateAction<PhotoOptions<ValidThemeType> | undefined>> | undefined;
}

const PhotoContext = createContext<PhotoContextType>({photo: undefined, setPhoto: undefined});

export const PhotoProvider = ({children, images = []}: {children: ReactNode; images?: Array<{id: string; href: string}>}) => {
  const [photo, setPhoto] = useState<PhotoOptions<ValidThemeType> | undefined>(() => {
    if (images.length > 0) {
      return {
        theme: null,
        images: images,
        selectedImages: [],
        video: {
          r2_url: null,
        },
        id: null,
        frameType: null,
        filters: null,
      };
    }
    return undefined;
  });

  return <PhotoContext.Provider value={{photo, setPhoto}}>{children}</PhotoContext.Provider>;
};

export const usePhoto = () => useContext(PhotoContext);
