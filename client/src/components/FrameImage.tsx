import React, {useCallback, useEffect, useState} from "react";
import {Image as KonvaImage} from "react-konva";

const FrameImage = ({
  url,
  y,
  x,
  height,
  width,
  filter,
}: {
  url: string | undefined | null;
  y: number;
  x: number;
  height: number;
  width: number;
  filter?: string | null;
}) => {
  const [image, setImage] = useState<HTMLCanvasElement | null>(null);

  const loadImage = useCallback(() => {
    if (!url) return setImage(null);
    const img = document.createElement("img");
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
  }, [filter, url]);

  useEffect(() => {
    loadImage();
  }, [loadImage, url, filter]);

  return (
    image && (
      <KonvaImage
        image={image}
        height={height}
        width={width}
        x={x}
        y={y}
      />
    )
  );
};

export default FrameImage;
