import {Suspense} from "react";
import {getImages, getProcessedImage, getVideo} from "@/server/actions";
import Preview from "./Preview";
import ImageNotFoundError from "@/components/ImageNotFoundError";
import FetchError from "@/components/FetchError";
import DatabaseFetchError from "@/components/DatabaseFetchError";
import PageLoader from "@/components/PageLoader/PageLoader";

type Params = Promise<{processedImageId: string}>;

const PreviewContent = async ({processedImageId}: {processedImageId: string}) => {
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
    <div className="w-full min-h-screen flex items-center justify-center bg-white bg-no-repeat bg-cover">
      <Preview
        processedImage={processedImage}
        images={images}
        video={video!}
      />
      {availableImageCount < processedImage.slotCount && <FetchError type="image" />}
      {(videoResult.error || !video) && <FetchError type="video" />}
    </div>
  );
};

const PreviewPage = async (props: {params: Params}) => {
  const params = await props.params;
  const processedImageId = params.processedImageId;

  try {
    return (
      <Suspense fallback={<PageLoader />}>
        <PreviewContent processedImageId={processedImageId} />
      </Suspense>
    );
  } catch {
    return <DatabaseFetchError />;
  }
};

export default PreviewPage;
