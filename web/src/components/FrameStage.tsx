import {useRef, useEffect, useState} from "react";
import {Stage as StageElement} from "konva/lib/Stage";
import {Image as KonvaImage, Rect} from "react-konva";
import {Layer, Stage} from "react-konva";
import FrameImage from "@/components/FrameImage";
import {FRAME_WIDTH, FRAME_HEIGHT} from "@/constants/constants";
import {ProcessedImageTable, ImageTable} from "@/drizzle/schema";
import useImage from "use-image";

interface FrameStageProps {
  processedImage: typeof ProcessedImageTable.$inferSelect;
  images?: Array<typeof ImageTable.$inferSelect>;
  stageRef: React.RefObject<StageElement | null>;
  onLoadingComplete?: (isComplete: boolean) => void;
}

const FrameStage = ({processedImage, images, stageRef, onLoadingComplete}: FrameStageProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [frameImg, frameImgStatus] = useImage(processedImage?.frameURL || "", "anonymous");

  const [scale, setScale] = useState(1);
  const [imagesLoaded, setImagesLoaded] = useState(0);

  const handleImageLoaded = () => {
    setImagesLoaded((prev) => prev + 1);
  };

  useEffect(() => {
    const chosenImageCount = images?.filter((image) => image.slotPositionX != null && image.slotPositionY != null).length || 0;
    if (frameImgStatus === "loaded" && imagesLoaded === chosenImageCount * (processedImage?.type == "singular" ? 1 : 2)) {
      onLoadingComplete?.(true);
    } else {
      onLoadingComplete?.(false);
    }
  }, [frameImgStatus, imagesLoaded, images, processedImage?.type, onLoadingComplete]);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateScale = () => {
      const containerWidth = containerRef.current?.parentElement?.clientWidth || window.innerWidth;
      const newScale = Math.min(1, (containerWidth - 32) / FRAME_WIDTH);
      setScale(newScale);
    };

    updateScale();

    const resizeObserver = new ResizeObserver(() => {
      updateScale();
    });

    if (containerRef.current?.parentElement) {
      resizeObserver.observe(containerRef.current.parentElement);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        transform: `scale(${scale})`,
        height: FRAME_HEIGHT * scale,
        transformOrigin: "center",
      }}
      className="w-full lg:w-max h-full flex items-center justify-center"
    >
      <Stage
        ref={stageRef}
        width={FRAME_WIDTH}
        height={FRAME_HEIGHT}
        className="pointer-events-none"
      >
        <Layer>
          <Rect
            width={processedImage.type == "singular" ? FRAME_WIDTH : FRAME_WIDTH * 2}
            height={FRAME_HEIGHT}
            fill="white"
          />
        </Layer>
        {Array.from({length: processedImage.type == "singular" ? 1 : 2}, (_, _index) => (
          <Layer key={_index}>
            {images?.map(({id, url, slotPositionX, slotPositionY, height, width}) => {
              return (
                url &&
                slotPositionX != null &&
                slotPositionY != null &&
                height != null &&
                width != null && (
                  <FrameImage
                    key={id}
                    url={url}
                    y={slotPositionY}
                    x={slotPositionX + (FRAME_WIDTH / 2) * _index}
                    height={height}
                    width={width}
                    filter={processedImage.filter!}
                    crossOrigin="anonymous"
                    onLoad={handleImageLoaded}
                  />
                )
              );
            })}
          </Layer>
        ))}

        {Array.from({length: processedImage.type == "singular" ? 1 : 2}, (_, index) => (
          <Layer key={index}>
            <KonvaImage
              image={frameImg}
              x={(FRAME_WIDTH / 2) * index}
              height={FRAME_HEIGHT}
              width={FRAME_WIDTH / (processedImage.type == "singular" ? 1 : 2)}
            />
          </Layer>
        ))}
      </Stage>
    </div>
  );
};

export default FrameStage;
