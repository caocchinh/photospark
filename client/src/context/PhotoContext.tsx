"use client";
import {PhotoOptions, ValidThemeType} from "@/constants/constants";
import {createContext, ReactNode, useContext, useState} from "react";

interface PhotoContextType {
  photo: PhotoOptions<ValidThemeType> | undefined;
  setPhoto: React.Dispatch<React.SetStateAction<PhotoOptions<ValidThemeType> | undefined>> | undefined;
}

const PhotoContext = createContext<PhotoContextType>({photo: undefined, setPhoto: undefined});

export const PhotoProvider = ({children}: {children: ReactNode}) => {
  const [photo, setPhoto] = useState<PhotoOptions<ValidThemeType> | undefined>(undefined);

  return <PhotoContext.Provider value={{photo, setPhoto}}>{children}</PhotoContext.Provider>;
};

export const usePhoto = () => useContext(PhotoContext);
