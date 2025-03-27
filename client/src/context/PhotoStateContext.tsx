"use client";

import {createContext, ReactNode, useContext, useState} from "react";
import {PhotoOptions, ValidThemeType} from "@/constants/types";
import {FrameOptions} from "@/constants/constants";

interface PhotoStateContextType {
  photo: PhotoOptions<ValidThemeType> | undefined;
  setPhoto: React.Dispatch<React.SetStateAction<PhotoOptions<ValidThemeType> | undefined>> | undefined;
  updatePhotoTheme: (themeName: ValidThemeType, frameIndex: number) => void;
  updatePhotoQuantity: (quantity: number) => void;
  addPhotoImage: (id: string, imageData: string, r2Url?: string) => void;
  setSelectedImages: (selectedImages: Array<{id: string; data: string; href: string}>) => void;
  updateVideoData: (videoBlob: Blob | null, r2Url: string | null) => void;
  updateFrame: (frameAttribute: (typeof FrameOptions)[ValidThemeType][number]) => void;
  clearPhotoState: () => void;
}

const PhotoStateContext = createContext<PhotoStateContextType>({
  photo: undefined,
  setPhoto: undefined,
  updatePhotoTheme: () => {},
  updatePhotoQuantity: () => {},
  addPhotoImage: () => {},
  setSelectedImages: () => {},
  updateVideoData: () => {},
  updateFrame: () => {},
  clearPhotoState: () => {},
});

export const PhotoStateProvider = ({children}: {children: ReactNode}) => {
  const [photo, setPhoto] = useState<PhotoOptions<ValidThemeType> | undefined>(undefined);

  // Helper functions for updating photo state
  const updatePhotoTheme = (themeName: ValidThemeType, frameIndex: number) => {
    const frame = FrameOptions[themeName][frameIndex];
    setPhoto((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        theme: {
          name: themeName,
          frame,
        },
      };
    });
  };

  const updatePhotoQuantity = (quantity: number) => {
    setPhoto((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        quantity,
      };
    });
  };

  const addPhotoImage = (id: string, imageData: string, r2Url?: string) => {
    setPhoto((prev) => {
      if (!prev) return prev;

      const newImage = {
        id,
        data: imageData,
        href: r2Url ? r2Url : "",
      };

      return {
        ...prev,
        images: [...(prev.images || []), newImage],
      };
    });
  };

  const updateFrame = (frameAttribute: (typeof FrameOptions)[ValidThemeType][number]) => {
    setPhoto((prevStyle) => {
      if (!prevStyle || !prevStyle.theme) return prevStyle;
      return {
        ...prevStyle,
        theme: {
          ...prevStyle.theme,
          name: prevStyle.theme.name,
          frame: frameAttribute,
        },
      };
    });
  };

  const setSelectedImages = (selectedImages: Array<{id: string; data: string; href: string}>) => {
    setPhoto((prev) => {
      if (!prev || !prev.images) return prev;
      return {
        ...prev,
        selectedImages,
      };
    });
  };

  const updateVideoData = (videoBlob: Blob | null, r2Url: string | null) => {
    setPhoto((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        video: {
          data: videoBlob,
          r2_url: r2Url,
        },
      };
    });
  };

  const clearPhotoState = () => {
    setPhoto(undefined);
  };

  return (
    <PhotoStateContext.Provider
      value={{
        photo,
        setPhoto,
        updatePhotoTheme,
        updatePhotoQuantity,
        addPhotoImage,
        setSelectedImages,
        updateVideoData,
        clearPhotoState,
        updateFrame,
      }}
    >
      {children}
    </PhotoStateContext.Provider>
  );
};

export const usePhotoState = () => useContext(PhotoStateContext);
