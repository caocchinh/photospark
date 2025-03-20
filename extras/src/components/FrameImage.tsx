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
    const img = document.createElement("img");
    if (crossOrigin) img.crossOrigin = crossOrigin;
    img.src = url;

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
    };
  }, [filter, url, crossOrigin]);

  useEffect(() => {
    loadImage();
  }, [loadImage, url, filter, crossOrigin]);

  useEffect(() => {
    if (onLoad) onLoad();
  }, [onLoad]);

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
