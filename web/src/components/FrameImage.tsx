"use client";

import {Image as KonvaImage} from "react-konva";
import {useState, useEffect, useCallback} from "react";
import {useTranslation} from "react-i18next";
import {toCanvas} from "html-to-image";

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

    return isAppleVendor || isApplePlatform || isAppleUserAgent || navigator.platform === "MacIntel" || navigator.userAgent.includes("Macintosh");
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!url) {
      setCanvas(null);
      return;
    }

    setIsLoading(true);
    setIsFilterLoading?.(true);
    const originalImg = new Image();
    if (crossOrigin) originalImg.crossOrigin = crossOrigin;
    const imageUrl = url.includes(
      process.env.NODE_ENV == "development" ? process.env.R2_PUBLIC_BUCKET_DEVELOPMENT_URL : process.env.R2_PUBLIC_BUCKET_PRODUCTION_URL
    )
      ? `/api/proxy/image?url=${encodeURIComponent(url)}`
      : url;
    originalImg.src = imageUrl;

    originalImg.onload = () => {
      try {
        if (filter && isAppleDeviceDetected()) {
          const container = document.createElement("div");
          container.style.position = "fixed";
          container.style.top = "0";
          container.style.left = "0";
          container.style.width = `${originalImg.naturalWidth}px`;
          container.style.height = `${originalImg.naturalHeight}px`;
          container.style.pointerEvents = "none";
          container.style.zIndex = "-1";
          container.style.overflow = "hidden";
          container.style.visibility = "visible";
          container.style.opacity = "1";

          const img = document.createElement("img");
          img.src = originalImg.src;
          img.width = originalImg.naturalWidth;
          img.height = originalImg.naturalHeight;
          img.style.width = "100%";
          img.style.height = "100%";
          img.style.objectFit = "contain";
          img.style.filter = filter;
          if (crossOrigin) img.crossOrigin = crossOrigin;

          container.appendChild(img);
          document.body.appendChild(container);

          const processImage = async () => {
            try {
              // Wait for container to be properly mounted in the DOM
              await new Promise<void>((resolve) => {
                if (document.body.contains(container)) {
                  resolve();
                  return;
                }

                const observer = new MutationObserver(() => {
                  if (document.body.contains(container)) {
                    observer.disconnect();
                    resolve();
                  }
                });

                observer.observe(document.body, {
                  childList: true,
                  subtree: true,
                });
              });

              const canvas = await toCanvas(container, {
                quality: 1.0,
                pixelRatio: 1,
                cacheBust: true,
                skipAutoScale: true,
                includeQueryParams: true,
                canvasWidth: originalImg.naturalWidth,
                canvasHeight: originalImg.naturalHeight,
                fetchRequestInit: {
                  cache: "no-store",
                  headers: {
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                    Expires: "0",
                  },
                },
              });

              setCanvas(canvas);
              setIsFilterLoading?.(false);
              setIsLoading(false);
              if (onLoad) onLoad();
            } catch (error) {
              console.error("Error in html-to-image processing:", error);
              applyFilterWithCanvas(originalImg);
              if (document.body.contains(container)) {
                document.body.removeChild(container);
              }
            } finally {
              if (document.body.contains(container)) {
                document.body.removeChild(container);
              }
            }
          };

          img.onload = () => {
            processImage();
          };
        } else {
          applyFilterWithCanvas(originalImg);
        }
      } catch (error) {
        console.error("Error in image processing:", error);
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
  }, [url, crossOrigin, onLoad, filter, isAppleDeviceDetected, setIsFilterLoading, applyFilterWithCanvas]);

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
