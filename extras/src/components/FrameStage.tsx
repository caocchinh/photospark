import {useEffect, useState, useCallback, useRef} from "react";
import {Stage as StageElement} from "konva/lib/Stage";
import {Image as KonvaImage, Rect} from "react-konva";
import {Layer, Stage} from "react-konva";
import FrameImage from "@/components/FrameImage";
import {FRAME_WIDTH, FRAME_HEIGHT, IMAGE_WIDTH, OFFSET_Y, OFFSET_X, IMAGE_HEIGHT} from "@/constants/constants";
import {ProcessedImageTable, ImageTable} from "@/drizzle/schema";
import useImage from "use-image";
import QRCode from "react-qr-code";
import ReactDOM from "react-dom/client";

interface FrameStageProps {
  processedImage: typeof ProcessedImageTable.$inferSelect;
  images?: Array<typeof ImageTable.$inferSelect>;
  stageRef: React.RefObject<StageElement | null>;
  onLoadingComplete?: (isComplete: boolean) => void;
}

const FrameStage = ({processedImage, images, stageRef, onLoadingComplete}: FrameStageProps) => {
  const [frameImg, frameImgStatus] = useImage(processedImage?.frameURL || "", "anonymous");
  const [qrCodeURL, setQrCodeURL] = useState<string>("");
  const [qrCodeImage] = useImage(qrCodeURL);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const isInitialRender = useRef("skibidi");

  const handleImageLoaded = useCallback(() => {
    if (isInitialRender.current == "skibidi") {
      setImagesLoaded((prev) => prev + 1);
    } else {
      setImagesLoaded(1);
      isInitialRender.current = "skibidi";
    }
  }, []);

  useEffect(() => {
    if (!processedImage?.id) return;

    const canvas = document.createElement("canvas");
    const qrSize = 256;
    canvas.width = qrSize;
    canvas.height = qrSize;

    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = "-9999px";
    container.style.left = "-9999px";

    document.body.appendChild(container);

    const waitForSVG = new Promise<SVGElement>((resolve) => {
      const observer = new MutationObserver((_, obs) => {
        const svg = container.querySelector("svg");
        if (svg) {
          obs.disconnect();
          resolve(svg as SVGElement);
        }
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
      });
    });

    const root = ReactDOM.createRoot(container);
    if (!process.env.NEXT_PUBLIC_QR_DOMAIN) {
      throw new Error("NEXT_PUBLIC_QR_DOMAIN is not set");
    }
    root.render(
      <QRCode
        size={qrSize}
        value={process.env.NEXT_PUBLIC_QR_DOMAIN + "/" + processedImage.id}
        viewBox={`0 0 ${qrSize} ${qrSize}`}
      />
    );

    waitForSVG.then((svg) => {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, qrSize, qrSize);
        ctx.drawImage(img, 0, 0);

        const dataUrl = canvas.toDataURL("image/png");
        setQrCodeURL(dataUrl);

        URL.revokeObjectURL(url);
        root.unmount();
        document.body.removeChild(container);
      };
      img.src = url;
    });

    return () => {
      if (qrCodeURL) {
        URL.revokeObjectURL(qrCodeURL);
      }
    };
  }, [processedImage, qrCodeURL]);

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
              image={qrCodeImage}
              x={processedImage.type == "singular" ? FRAME_WIDTH - OFFSET_X - 19 : (FRAME_WIDTH / 2) * index + OFFSET_X + FRAME_WIDTH / 2.6}
              y={FRAME_HEIGHT - OFFSET_Y - 7}
              height={40}
              width={40}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default FrameStage;
