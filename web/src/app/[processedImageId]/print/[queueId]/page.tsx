import {Suspense} from "react";
import {getImages, getProcessedImage, getQueue} from "@/server/actions";
import FetchError from "@/components/FetchError";
import ImageNotFoundError from "@/components/ImageNotFoundError";
import DatabaseFetchError from "@/components/DatabaseFetchError";
import PageLoader from "@/components/PageLoader/PageLoader";
import Queue from "./Queue";

type Params = Promise<{processedImageId: string; queueId: string}>;

const QueueContent = async ({processedImageId, queueId}: {processedImageId: string; queueId: string}) => {
  // Fetch all data in parallel and wait for all queries to complete
  const [processedImageResult, imagesResult, queueResult] = await Promise.all([
    getProcessedImage(processedImageId),
    getImages(processedImageId),
    getQueue(processedImageId, queueId),
  ]);

  // Handle error cases after all data is fetched
  if (processedImageResult.error || !processedImageResult.data) {
    return <ImageNotFoundError />;
  }

  if (imagesResult.error || !imagesResult.data) {
    return <ImageNotFoundError />;
  }

  if (queueResult.error || !queueResult.data) {
    return <FetchError type="queue" />;
  }

  const processedImage = processedImageResult.data;
  const images = imagesResult.data;
  const queue = queueResult.data;

  const availableImageCount = images?.filter((image) => image.slotPositionX != null && image.slotPositionY != null).length || 0;

  return (
    <div className="min-w-screen min-h-screen flex items-center justify-center bg-white">
      <Queue
        processedImage={processedImage}
        queue={queue}
        images={images}
      />
      {availableImageCount < processedImage.slotCount && <FetchError type="image" />}
    </div>
  );
};

const QueuePage = async (props: {params: Params}) => {
  const params = await props.params;
  const queueId = params.queueId;
  const processedImageId = params.processedImageId;

  try {
    return (
      <Suspense fallback={<PageLoader />}>
        <QueueContent
          processedImageId={processedImageId}
          queueId={queueId}
        />
      </Suspense>
    );
  } catch {
    return <DatabaseFetchError />;
  }
};

export default QueuePage;
