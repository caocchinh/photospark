import {getImage, getProcessedImage, getQueue} from "@/server/actions";
import FetchError from "@/components/FetchError";
import ImageNotFoundError from "@/components/ImageNotFoundError";
import Queue from "./Queue";

type Params = Promise<{processedImageId: string; queueId: string}>;

const QueuePage = async (props: {params: Params}) => {
  const params = await props.params;
  const queueId = params.queueId;
  const processedImageId = params.processedImageId;

  const processedImage = await getProcessedImage(processedImageId);
  if (processedImage.error || !processedImage.data) {
    return <ImageNotFoundError />;
  }

  const images = await getImage(processedImageId);

  const availableImageCount = images.data?.filter((image) => image.slotPositionX != null && image.slotPositionY != null).length || 0;

  const queue = await getQueue(processedImageId, queueId);
  if (queue.error || !queue.data) {
    return <FetchError type="queue" />;
  }

  return (
    <div className="min-w-screen min-h-screen flex items-center justify-center bg-white">
      <Queue
        processedImage={processedImage.data}
        queue={queue.data}
        images={images.data}
      />
      {availableImageCount < processedImage.data.slotCount && <FetchError type="image" />}
    </div>
  );
};

export default QueuePage;
