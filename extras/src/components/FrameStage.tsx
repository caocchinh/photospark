import {useEffect, useState, useCallback, useRef} from "react";
import {Stage as StageElement} from "konva/lib/Stage";
import {Image as KonvaImage, Rect} from "react-konva";
import {Layer, Stage} from "react-konva";
import FrameImage from "@/components/FrameImage";
import {FRAME_WIDTH, FRAME_HEIGHT, IMAGE_WIDTH, OFFSET_Y, OFFSET_X, IMAGE_HEIGHT} from "@/constants/constants";
import {ProcessedImageTable, ImageTable} from "@/drizzle/schema";
import useImage from "use-image";
import {QRCodeCanvas} from "qrcode.react";

interface FrameStageProps {
  processedImage: typeof ProcessedImageTable.$inferSelect;
  images?: Array<typeof ImageTable.$inferSelect>;
  stageRef: React.RefObject<StageElement | null>;
  onLoadingComplete?: (isComplete: boolean) => void;
}

const FrameStage = ({processedImage, images, stageRef, onLoadingComplete}: FrameStageProps) => {
  const [frameImg, frameImgStatus] = useImage(processedImage?.frameURL || "", "anonymous");
  const qrRef = useRef<HTMLCanvasElement | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const isInitialRender = useRef("skibidi");
  const [isQrLogoLoaded, setIsQrLogoLoaded] = useState(false);

  useEffect(() => {
    async function loadImage() {
      const logoImg = new Image();
      logoImg.src = "/vteam-logo.webp";
      await logoImg.decode();
      setIsQrLogoLoaded(true);
    }
    loadImage();
  }, []);

  const handleImageLoaded = useCallback(() => {
    if (isInitialRender.current == "skibidi") {
      setImagesLoaded((prev) => prev + 1);
    } else {
      setImagesLoaded(1);
      isInitialRender.current = "skibidi";
    }
  }, []);

  useEffect(() => {
    const chosenImageCount = images?.filter((image) => image.slotPositionX != null && image.slotPositionY != null).length || 0;
    if (frameImgStatus === "loaded" && imagesLoaded == chosenImageCount * (processedImage?.type == "singular" ? 1 : 2)) {
      isInitialRender.current = "sigma";
      onLoadingComplete?.(true);
    } else {
      onLoadingComplete?.(false);
    }
  }, [frameImgStatus, imagesLoaded, images, processedImage?.type, onLoadingComplete]);

  return (
    <>
      <div className="w-max lg:w-max h-full flex items-start relative justify-center transform scale-[0.8]">
        <Stage
          ref={stageRef}
          width={IMAGE_WIDTH}
          height={IMAGE_HEIGHT}
        >
          <Layer>
            <Rect
              width={IMAGE_WIDTH}
              height={IMAGE_HEIGHT}
              fill="white"
            />
          </Layer>
          {Array.from({length: processedImage.type == "singular" ? 1 : 2}, (_, _index) => (
            <Layer
              key={_index}
              x={OFFSET_X}
              y={OFFSET_Y}
            >
              {images?.map(({id, url, slotPositionX, slotPositionY, height, width}) => {
                return (
                  url &&
                  slotPositionX != null &&
                  slotPositionY != null &&
                  height != null &&
                  width != null && (
                    <FrameImage
                      key={id}
                      url={
                        ["r2.dev", process.env.NEXT_PUBLIC_R2_PUBLIC_BUCKET_PRODUCTION_URL].some((bucketUrl) => bucketUrl && url.includes(bucketUrl))
                          ? `/api/proxy?url=${encodeURIComponent(url)}`
                          : url
                      }
                      y={slotPositionY}
                      x={slotPositionX + (FRAME_WIDTH / 2) * _index}
                      height={height}
                      width={width}
                      filter={processedImage.filter!}
                      onLoad={handleImageLoaded}
                    />
                  )
                );
              })}
            </Layer>
          ))}

          {Array.from({length: processedImage.type == "singular" ? 1 : 2}, (_, index) => (
            <Layer
              key={index}
              x={OFFSET_X}
              y={OFFSET_Y}
            >
              <KonvaImage
                image={frameImg}
                x={(FRAME_WIDTH / 2) * index}
                height={FRAME_HEIGHT}
                width={FRAME_WIDTH / (processedImage.type == "singular" ? 1 : 2)}
              />
            </Layer>
          ))}

          <Layer>
            {Array.from({length: processedImage.type == "singular" ? 1 : 2}, (_, index) => (
              <KonvaImage
                key={index}
                image={qrRef.current ? qrRef.current : undefined}
                x={processedImage.type == "singular" ? FRAME_WIDTH - OFFSET_X - 19 : (FRAME_WIDTH / 2) * index + OFFSET_X + FRAME_WIDTH / 2.6}
                y={FRAME_HEIGHT - OFFSET_Y - 8}
                height={45}
                width={45}
              />
            ))}
          </Layer>
        </Stage>
      </div>
      <QRCodeCanvas
        key={isQrLogoLoaded ? processedImage.id : Math.random().toString()}
        style={{display: "none"}}
        value={process.env.NEXT_PUBLIC_QR_DOMAIN + "/" + processedImage.id}
        title={"VTEAM Photobooth"}
        ref={qrRef}
        size={300}
        bgColor={"#ffffff"}
        fgColor={"#000000"}
        level={"H"}
        imageSettings={{
          src: "/vteam-logo.webp",
          x: undefined,
          y: undefined,
          height: 79,
          width: 86,
          opacity: 1,
          excavate: true,
        }}
      />
    </>
  );
};

export default FrameStage;
