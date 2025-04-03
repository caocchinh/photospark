import {Suspense} from "react";
import FetchError from "@/components/FetchError";
import ImageNotFoundError from "@/components/ImageNotFoundError";
import {getImages, getProcessedImage, getVideo} from "@/server/actions";
import {ReactNode} from "react";
import DatabaseFetchError from "@/components/DatabaseFetchError";
import PageLoader from "@/components/PageLoader/PageLoader";
import {ProcessedImageProvider} from "@/context/ProcssedImageContext";
type Params = Promise<{processedImageId: string; children: ReactNode}>;

const MainContent = async ({processedImageId, children}: {processedImageId: string; children: ReactNode}) => {
  // Fetch all data in parallel and wait for all queries to complete
  const [processedImageResult, imagesResult, videoResult] = await Promise.all([
    getProcessedImage(processedImageId),
    getImages(processedImageId),
    getVideo(processedImageId),
  ]);

  // Handle error cases after all data is fetched
  if (processedImageResult.error || !processedImageResult.data) {
    return <ImageNotFoundError />;
  }

  if (imagesResult.error || !imagesResult.data) {
    return <ImageNotFoundError />;
  }

  const processedImage = processedImageResult.data;
  const images = imagesResult.data;
  const video = videoResult.data;

  const availableImageCount = images?.filter((image) => image.slotPositionX != null && image.slotPositionY != null).length || 0;

  return (
    <ProcessedImageProvider
      processedImage={processedImage}
      images={images}
      video={video}
    >
      <div className="w-full min-h-screen relative z-[0] bg-white">
        {children}
        {availableImageCount < processedImage.slotCount && <FetchError type="image" />}
        {(videoResult.error || !video) && <FetchError type="video" />}
      </div>
    </ProcessedImageProvider>
  );
};

export default async function EditLayout(props: {params: Params; children: ReactNode}) {
  const params = await props.params;
  const processedImageId = params.processedImageId;

  try {
    return (
      <Suspense fallback={<PageLoader />}>
        <MainContent processedImageId={processedImageId}>{props.children}</MainContent>
      </Suspense>
    );
  } catch {
    return <DatabaseFetchError />;
  }
}
