import {getQueue} from "@/server/actions";
import FetchError from "@/components/FetchError";

type Params = Promise<{processedImageId: string; queueId: string}>;

const QueuePage = async (props: {params: Params}) => {
  const params = await props.params;
  const queueId = params.queueId;
  const processedImageId = params.processedImageId;

  const queue = await getQueue(processedImageId, queueId);

  if (queue.error || !queue.data) {
    return <FetchError type="queue" />;
  }

  return <div className="w-full min-h-screen flex items-center justify-center bg-white">{queue.data?.price}</div>;
};

export default QueuePage;
