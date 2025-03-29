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
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {t} = useTranslation();

  const isAppleDevice = useCallback(() => {
    if (typeof window === "undefined") return false;

    const isAppleVendor = /apple/i.test(navigator.vendor);
    const isApplePlatform = /Mac|iPad|iPhone|iPod/.test(navigator.platform);
    const isAppleUserAgent = /Mac|iPad|iPhone|iPod/.test(navigator.userAgent);

    return isAppleVendor || isApplePlatform || isAppleUserAgent;
  }, []);

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
          const filteredImg = new Image();
          if (crossOrigin) filteredImg.crossOrigin = crossOrigin;
          filteredImg.src = canvas.toDataURL("image/jpg");
          filteredImg.onload = () => {
            setImage(filteredImg);
            setIsFilterLoading?.(false);
            setIsLoading(false);
            if (onLoad) onLoad();
          };

          filteredImg.onerror = () => {
            console.error("Failed to load filtered image");
            setImage(originalImg);
            setIsFilterLoading?.(false);
            setIsLoading(false);
            if (onLoad) onLoad();
          };
        })
        .catch(() => {
          console.error("Error rasterizing HTML");
          setImage(originalImg); // Fallback to original
          setIsFilterLoading?.(false);
          setIsLoading(false);
          if (onLoad) onLoad();
        });
    },
    [filter, crossOrigin, setImage, setIsFilterLoading, setIsLoading, onLoad]
  );

  // Method for non-apple devices using canvas filter
  const applyFilterWithCanvas = useCallback(
    (originalImg: HTMLImageElement) => {
      if (typeof window === "undefined") return;
      // Create a canvas with original image dimensions
      const canvas = document.createElement("canvas");
      canvas.width = originalImg.naturalWidth;
      canvas.height = originalImg.naturalHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        setImage(originalImg); // Fallback to original
        setIsFilterLoading?.(false);
        setIsLoading(false);
        if (onLoad) onLoad();
        return;
      }

      // Apply filter directly using canvas context filter property
      if (filter) {
        ctx.filter = filter;
      }
      ctx.drawImage(originalImg, 0, 0);

      // Create a new image from the canvas
      const filteredImg = new Image();
      if (crossOrigin) filteredImg.crossOrigin = crossOrigin;
      filteredImg.src = canvas.toDataURL("image/jpg");

      filteredImg.onload = () => {
        setImage(filteredImg);
        setIsFilterLoading?.(false);
        setIsLoading(false);
        if (onLoad) onLoad();
      };

      filteredImg.onerror = () => {
        console.error("Failed to load filtered image");
        setImage(originalImg);
        setIsFilterLoading?.(false);
        setIsLoading(false);
        if (onLoad) onLoad();
      };
    },
    [filter, crossOrigin, setImage, setIsFilterLoading, setIsLoading, onLoad]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!url) {
      setImage(null);
      return;
    }

    setIsLoading(true);
    setIsFilterLoading?.(true);
    const imageUrl = url.includes("r2.dev") ? `/api/proxy/image?url=${encodeURIComponent(url)}` : url;

    const originalImg = new Image();
    if (crossOrigin) originalImg.crossOrigin = crossOrigin;

    originalImg.onload = () => {
      // If no filter, just use the original image
      if (!filter || filter == "") {
        applyFilterWithCanvas(originalImg);
      }

      try {
        if (isAppleDeviceDetected()) {
          // Apple device method: use rasterizeHTML
          applyFilterWithRasterizeHTML(originalImg);
        } else {
          // Non-Apple device method: use canvas filter
          applyFilterWithCanvas(originalImg);
        }
      } catch {
        console.error("Error applying filter");
        setImage(originalImg); // Fallback to original
        setIsFilterLoading?.(false);
        setIsLoading(false);
        if (onLoad) onLoad();
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

      const errorImg = new Image();
      errorImg.onload = () => {
        setImage(errorImg);
        setIsLoading(false);
        if (onLoad) onLoad();
      };
      errorImg.src = errorCanvas.toDataURL();
    };

    originalImg.src = imageUrl;
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

      const loadingImg = new Image();
      loadingImg.onload = () => {
        setImage(loadingImg);
      };
      loadingImg.src = loadingCanvas.toDataURL();
    }
  }, [isLoading, width, height, t]);

  return (
    <KonvaImage
      image={image || undefined}
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
