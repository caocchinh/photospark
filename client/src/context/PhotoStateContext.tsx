"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  PhotoOptions,
  ValidThemeType,
  ValidFrameType,
} from "@/constants/types";
import { FrameOptions } from "@/constants/constants";

interface PhotoStateContextType {
  photo: PhotoOptions<ValidThemeType> | undefined;
  quantityType: "manual" | "auto";
  setPhoto:
    | React.Dispatch<
        React.SetStateAction<PhotoOptions<ValidThemeType> | undefined>
      >
    | undefined;
  setQuantityType: (quantityType: "manual" | "auto") => void;
  updatePhotoTheme: (themeName: ValidThemeType, frameIndex: number) => void;
  updatePhotoQuantity: (quantity: number) => void;
  addPhotoImage: (id: string, imageData: string, r2Url?: string) => void;
  setSelectedImages: (
    selectedImages: Array<{ id: string; data: string; href: string }>
  ) => void;
  updateVideoData: (videoBlob: Blob | null, r2Url: string | null) => void;
  updateFrame: (
    frameAttribute: (typeof FrameOptions)[ValidThemeType][number]
  ) => void;
  clearPhotoState: () => void;
  updateFrameType: (frameType: ValidFrameType) => void;
}

const PhotoStateContext = createContext<PhotoStateContextType>({
  photo: undefined,
  setPhoto: undefined,
  updatePhotoTheme: () => {},
  quantityType: "manual",
  setQuantityType: () => {},
  updatePhotoQuantity: () => {},
  addPhotoImage: () => {},
  setSelectedImages: () => {},
  updateVideoData: () => {},
  updateFrame: () => {},
  clearPhotoState: () => {},
  updateFrameType: () => {},
});

export const PhotoStateProvider = ({ children }: { children: ReactNode }) => {
  const [photo, setPhoto] = useState<PhotoOptions<ValidThemeType> | undefined>(
    undefined
  );
  const [quantityType, setQuantityType] = useState<"manual" | "auto">("manual");

  useEffect(() => {
    const quantityType = localStorage.getItem("quantityType");
    if (quantityType) {
      setQuantityType(quantityType as "manual" | "auto");
    } else {
      localStorage.setItem("quantityType", "manual");
    }
  }, []);

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

  const updateFrame = (
    frameAttribute: (typeof FrameOptions)[ValidThemeType][number]
  ) => {
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

  const setSelectedImages = (
    selectedImages: Array<{ id: string; data: string; href: string }>
  ) => {
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

  const updateFrameType = (frameType: ValidFrameType) => {
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
        frameType: frameType,
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
        setQuantityType,
        updatePhotoTheme,
        updatePhotoQuantity,
        addPhotoImage,
        setSelectedImages,
        updateVideoData,
        quantityType,
        clearPhotoState,
        updateFrame,
        updateFrameType,
      }}
    >
      {children}
    </PhotoStateContext.Provider>
  );
};

export const usePhotoState = () => useContext(PhotoStateContext);
