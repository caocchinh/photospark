"use client";

import {Image as KonvaImage} from "react-konva";
import {useState, useEffect, useCallback} from "react";
import {useTranslation} from "react-i18next";
import rasterizeHTML from "rasterizehtml";

const FrameImage = ({
  url,
  x,
  y,
  height,
  width,
  filter,
  crossOrigin,
  onLoad,
  setIsFilterLoading,
}: {
  url: string;
  x: number;
  y: number;
  height: number;
  width: number;
  filter: string;
  crossOrigin?: string;
  onLoad?: () => void;
  setIsFilterLoading?: (isLoading: boolean) => void;
}) => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {t} = useTranslation();

  const isAppleDevice = useCallback(() => {
    if (typeof window === "undefined") return false;

    const isAppleVendor = /apple/i.test(navigator.vendor);
    const isApplePlatform = /Mac|iPad|iPhone|iPod/.test(navigator.platform);
    const isAppleUserAgent = /Mac|iPad|iPhone|iPod/.test(navigator.userAgent);

    return isAppleVendor || isApplePlatform || isAppleUserAgent;
  }, []);

  const applyFilterWithCanvas = useCallback(
    (originalImg: HTMLImageElement) => {
      if (typeof window === "undefined") return;

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = originalImg.width;
      canvas.height = originalImg.height;
      if (context) {
        if (typeof context.filter !== "undefined" && filter) {
          context.filter = filter;
        }
        context.drawImage(originalImg, 0, 0);
      }
      setCanvas(canvas);
      setIsFilterLoading?.(false);
      setIsLoading(false);
      if (onLoad) onLoad();
    },
    [filter, onLoad, setIsFilterLoading]
  );

  const isAppleDeviceDetected = useCallback(() => {
    return typeof window !== "undefined" ? isAppleDevice() : false;
  }, [isAppleDevice]);

  const applyFilterWithRasterizeHTML = useCallback(
    (originalImg: HTMLImageElement) => {
      if (typeof window === "undefined") return;

      // Create a canvas with original image dimensions
      const canvas = document.createElement("canvas");
      canvas.width = originalImg.naturalWidth;
      canvas.height = originalImg.naturalHeight;

      // Create HTML with the image and CSS filter
      const htmlContent = `
      <div style="width: ${originalImg.naturalWidth}px; height: ${originalImg.naturalHeight}px;">
        <img 
          src="${originalImg.src}" 
          width="${originalImg.naturalWidth}" 
          height="${originalImg.naturalHeight}"
          style="filter: ${filter};" 
          ${crossOrigin ? `crossorigin="${crossOrigin}"` : ""}
        />
      </div>
    `;

      rasterizeHTML
        .drawHTML(htmlContent, canvas)
        .then(() => {
          setCanvas(canvas);
          setIsFilterLoading?.(false);
          setIsLoading(false);
          if (onLoad) onLoad();
        })
        .catch(() => {
          applyFilterWithCanvas(originalImg);
        });
    },
    [filter, crossOrigin, setIsFilterLoading, onLoad, applyFilterWithCanvas]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!url) {
      setCanvas(null);
      return;
    }

    setIsLoading(true);
    setIsFilterLoading?.(true);
    const imageUrl = url.includes("r2.dev") ? `/api/proxy/image?url=${encodeURIComponent(url)}` : url;

    const originalImg = new Image();
    if (crossOrigin) originalImg.crossOrigin = crossOrigin;
    originalImg.src = imageUrl;

    originalImg.onload = () => {
      if (isAppleDeviceDetected() && filter) {
        applyFilterWithRasterizeHTML(originalImg);
      } else {
        applyFilterWithCanvas(originalImg);
      }
    };

    originalImg.onerror = () => {
      console.error("Error loading image");

      const errorCanvas = document.createElement("canvas");
      const context = errorCanvas.getContext("2d");
      errorCanvas.width = 300;
      errorCanvas.height = 150;

      if (context) {
        context.fillStyle = "#FF0000";
        context.fillRect(0, 0, errorCanvas.width, errorCanvas.height);
        context.fillStyle = "#111111";
        context.font = "14px Arial";
        context.textAlign = "center";
        context.fillText("Image could not be loaded", errorCanvas.width / 2, errorCanvas.height / 2);
        context.fillText("CORS error", errorCanvas.width / 2, errorCanvas.height / 2 + 20);
      }

      setCanvas(errorCanvas);
      setIsLoading(false);
      setIsFilterLoading?.(false);
      if (onLoad) onLoad();
    };
  }, [url, crossOrigin, onLoad, filter, isAppleDeviceDetected, setIsFilterLoading, applyFilterWithRasterizeHTML, applyFilterWithCanvas]);

  useEffect(() => {
    if (isLoading) {
      const loadingCanvas = document.createElement("canvas");
      const context = loadingCanvas.getContext("2d");
      loadingCanvas.width = width;
      loadingCanvas.height = height;

      if (context) {
        context.fillStyle = "#FFFFFF";
        context.fillRect(0, 0, loadingCanvas.width, loadingCanvas.height);
        context.fillStyle = "#000000";
        context.font = "14px Arial";
        context.textAlign = "center";
        context.fillText(t("Loading..."), loadingCanvas.width / 2, loadingCanvas.height / 2);
      }

      setCanvas(loadingCanvas);
    }
  }, [isLoading, width, height, t]);

  return (
    <KonvaImage
      image={canvas || undefined}
      height={height}
      width={width}
      x={x}
      y={y}
      listening={false}
      perfectDrawEnabled={false}
    />
  );
};

export default FrameImage;
