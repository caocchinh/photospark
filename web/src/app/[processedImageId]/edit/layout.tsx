import FetchError from "@/components/FetchError";
import ImageNotFoundError from "@/components/ImageNotFoundError";
import {NUM_OF_CAPTURE_IMAGE} from "@/constants/constants";
import {PhotoProvider} from "@/context/PhotoContext";
import {getImage, getProcessedImage, getVideo} from "@/server/actions";
import {ReactNode} from "react";
type Params = Promise<{processedImageId: string; children: ReactNode}>;

export default async function EditLayout(props: {params: Params; children: ReactNode}) {
  const params = await props.params;
  const processedImageId = params.processedImageId;

  const processedImage = await getProcessedImage(processedImageId);

  if (processedImage.error || !processedImage.data) {
    return <ImageNotFoundError />;
  }

  const images = await getImage(processedImageId);

  if (images.error || !images.data) {
    return <ImageNotFoundError />;
  }

  const video = await getVideo(processedImageId);

  const bindIdToImage = Array.from({length: images.data?.length || 0}, (_, index) => ({
    id: index.toString(),
    href: images.data?.[index]?.url || "",
  }));

  return (
    <PhotoProvider
      images={bindIdToImage}
      previousProcessedImageId={processedImageId}
      videoUrl={video.data?.url || ""}
    >
      <div className="w-full min-h-screen py-20">
        {props.children}
        {images.data.length < NUM_OF_CAPTURE_IMAGE && <FetchError type="image" />}
      </div>
    </PhotoProvider>
  );
}
