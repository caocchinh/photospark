import {db} from "@/drizzle/db";
import ImageFetchError from "@/components/ImageFetchError";

type Params = Promise<{id: string; queueId: string}>;

const QueuePage = async (props: {params: Params}) => {
  const params = await props.params;
  const queueId = params.queueId;

  console.log("Queue ID from params:", queueId);

  const queue = await db.query.QueueTable.findFirst({
    where: (queue, {eq}) => eq(queue.id, queueId),
  });

  if (!queue) {
    console.log("Queue not found for ID:", queueId);
    return <ImageFetchError />;
  }

  return <div className="w-full min-h-screen flex items-center justify-center bg-white">{queue.id}</div>;
};

export default QueuePage;
