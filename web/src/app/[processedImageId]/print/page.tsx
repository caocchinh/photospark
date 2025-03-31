import {Suspense} from "react";
import ImageNotFoundError from "@/components/ImageNotFoundError";
import Print from "./Print";
import {getProcessedImage, getImages} from "@/server/actions";
import FetchError from "@/components/FetchError";
import DatabaseFetchError from "@/components/DatabaseFetchError";
import PageLoader from "@/components/PageLoader/PageLoader";

type Params = Promise<{processedImageId: string}>;

const PrintContent = async ({processedImageId}: {processedImageId: string}) => {
  // Fetch all data in parallel and wait for all queries to complete
  const [processedImageResult, imagesResult] = await Promise.all([getProcessedImage(processedImageId), getImages(processedImageId)]);

  // Handle error cases after all data is fetched
  if (processedImageResult.error || !processedImageResult.data) {
    return <ImageNotFoundError />;
  }

  if (imagesResult.error || !imagesResult.data) {
    return <ImageNotFoundError />;
  }

  const processedImage = processedImageResult.data;
  const images = imagesResult.data;

  const availableImageCount =
    images?.filter((image) => image.slotPositionX != null && image.slotPositionY != null && image.height != null && image.width != null).length || 0;

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-white ">
      <Print
        processedImage={processedImage}
        images={images}
      />
      {availableImageCount < processedImage.slotCount && <FetchError type="image" />}
    </div>
  );
};

const PrintPage = async (props: {params: Params}) => {
  const params = await props.params;
  const processedImageId = params.processedImageId;

  try {
    return (
      <Suspense fallback={<PageLoader />}>
        <PrintContent processedImageId={processedImageId} />
      </Suspense>
    );
  } catch {
    return <DatabaseFetchError />;
  }
};

export default PrintPage;
