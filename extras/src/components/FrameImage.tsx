"use client";
import {Image as KonvaImage} from "react-konva";
import {useState, useCallback, useEffect} from "react";

const FrameImage = ({
  url,
  x,
  y,
  height,
  width,
  filter,
  crossOrigin,
  onLoad,
}: {
  url: string;
  x: number;
  y: number;
  height: number;
  width: number;
  filter: string;
  crossOrigin?: string;
  onLoad?: () => void;
}) => {
  const [image, setImage] = useState<HTMLCanvasElement | null>(null);

  const loadImage = useCallback(() => {
    if (!url) return setImage(null);

    const imageUrl = url.includes("r2.dev") ? `/api/proxy/image?url=${encodeURIComponent(url)}` : url;

    const img = document.createElement("img");
    if (crossOrigin) img.crossOrigin = crossOrigin;
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      if (context) {
        if (typeof context.filter !== "undefined" && filter) {
          context.filter = filter;
        }
        context.drawImage(img, 0, 0);
      }
      setImage(canvas);
      if (onLoad) onLoad();
    };

    img.onerror = (error) => {
      console.error("Image loading error:", error);
      // Create a fallback canvas with error indication
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = 300;
      canvas.height = 150;
      if (context) {
        context.fillStyle = "rgba(200, 200, 200, 0.5)";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#888";
        context.font = "14px Arial";
        context.textAlign = "center";
        context.fillText("Image could not be loaded", canvas.width / 2, canvas.height / 2);
        context.fillText("CORS error", canvas.width / 2, canvas.height / 2 + 20);
      }
      setImage(canvas);
      if (onLoad) onLoad();
    };
  }, [filter, url, crossOrigin, onLoad]);

  useEffect(() => {
    loadImage();
  }, [loadImage, url, filter, crossOrigin]);

  return (
    <KonvaImage
      image={image || undefined}
      height={height}
      width={width}
      x={x}
      y={y}
    />
  );
};

export default FrameImage;
