"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// Import types from face-api.js but handle dynamically to avoid SSR issues
type FaceDetection = {
  score: number;
  box: { x: number; y: number; width: number; height: number };
};

type FaceApiModule = {
  nets: {
    ssdMobilenetv1: { loadFromUri: (path: string) => Promise<void> };
    faceLandmark68Net: { loadFromUri: (path: string) => Promise<void> };
    faceRecognitionNet: { loadFromUri: (path: string) => Promise<void> };
  };
  detectAllFaces: (input: HTMLImageElement) => Promise<FaceDetection[]>;
};

interface FaceApiContextType {
  isModelLoaded: boolean;
  detectFaces: (imageElement: HTMLImageElement) => Promise<number>;
}

const FaceApiContext = createContext<FaceApiContextType>({
  isModelLoaded: false,
  detectFaces: async () => 0,
});

export const FaceApiProvider = ({ children }: { children: ReactNode }) => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [faceApi, setFaceApi] = useState<FaceApiModule | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("face-api.js").then((faceApiModule) => {
        setFaceApi(faceApiModule as unknown as FaceApiModule);

        Promise.all([
          faceApiModule.nets.ssdMobilenetv1.loadFromUri("/models"),
          faceApiModule.nets.faceLandmark68Net.loadFromUri("/models"),
          faceApiModule.nets.faceRecognitionNet.loadFromUri("/models"),
        ])
          .then(() => {
            console.log("Face-API models loaded successfully");
            setIsModelLoaded(true);
          })
          .catch((error) => {
            console.error("Error loading face-api models:", error);
          });
      });
    }
  }, []);

  const detectFaces = async (
    imageElement: HTMLImageElement
  ): Promise<number> => {
    if (!isModelLoaded || !faceApi) {
      console.warn("Face models not loaded yet");
      return 0;
    }

    try {
      const detections = await faceApi.detectAllFaces(imageElement);
      return detections.length;
    } catch (error) {
      console.error("Error detecting faces:", error);
      return 0;
    }
  };

  return (
    <FaceApiContext.Provider
      value={{
        isModelLoaded,
        detectFaces,
      }}
    >
      {children}
    </FaceApiContext.Provider>
  );
};

export const useFaceApi = () => useContext(FaceApiContext);
