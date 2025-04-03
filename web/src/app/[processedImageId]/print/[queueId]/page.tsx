import {Suspense} from "react";
import {getQueue} from "@/server/actions";
import FetchError from "@/components/FetchError";
import DatabaseFetchError from "@/components/DatabaseFetchError";
import PageLoader from "@/components/PageLoader/PageLoader";
import Queue from "./Queue";

type Params = Promise<{processedImageId: string; queueId: string}>;

const QueueContent = async ({processedImageId, queueId}: {processedImageId: string; queueId: string}) => {
  // Fetch all data in parallel and wait for all queries to complete
  const [queueResult] = await Promise.all([getQueue(processedImageId, queueId)]);

  // Handle error cases after all data is fetched
  if (queueResult.error || !queueResult.data) {
    return <FetchError type="queue" />;
  }

  const queue = queueResult.data;

  return (
    <div className="flex items-center justify-center bg-white">
      <Queue queue={queue} />
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
