import FetchError from "@/components/FetchError";
import ImageNotFoundError from "@/components/ImageNotFoundError";
import {NUM_OF_CAPTURE_IMAGE} from "@/constants/constants";
import {PhotoProvider} from "@/context/PhotoContext";
import {getImages, getProcessedImage, getVideo} from "@/server/actions";
import {ReactNode} from "react";
import DatabaseFetchError from "@/components/DatabaseFetchError";

type Params = Promise<{processedImageId: string; children: ReactNode}>;

export default async function EditLayout(props: {params: Params; children: ReactNode}) {
  const params = await props.params;
  const processedImageId = params.processedImageId;

  let bindIdToImage: {id: string; href: string}[] = [];
  let images: {error: boolean; data?: {url: string; id: string}[]} = {error: true};
  let video: {error: boolean; data?: {url: string}} = {error: true};

  try {
    const processedImage = await getProcessedImage(processedImageId);

    if (processedImage.error || !processedImage.data) {
      return <ImageNotFoundError />;
    }

    images = await getImages(processedImageId);

    if (images.error || !images.data) {
      return <ImageNotFoundError />;
    }

    video = await getVideo(processedImageId);

    bindIdToImage = Array.from({length: images.data?.length || 0}, (_, index) => ({
      id: index.toString(),
      href: images.data?.[index]?.url || "",
    }));
  } catch {
    return <DatabaseFetchError />;
  }

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
