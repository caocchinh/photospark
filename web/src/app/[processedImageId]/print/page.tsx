import ImageNotFoundError from "@/components/ImageNotFoundError";
import Print from "./Print";
import {getProcessedImage, getImages} from "@/server/actions";
import FetchError from "@/components/FetchError";
type Params = Promise<{processedImageId: string}>;

const PrintPage = async (props: {params: Params}) => {
  const params = await props.params;
  const processedImageId = params.processedImageId;

  const processedImage = await getProcessedImage(processedImageId);

  if (processedImage.error || !processedImage.data) {
    return <ImageNotFoundError />;
  }
  const images = await getImages(processedImageId);

  const availableImageCount =
    images.data?.filter((image) => image.slotPositionX != null && image.slotPositionY != null && image.height != null && image.width != null)
      .length || 0;

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-white ">
      <Print
        processedImage={processedImage.data}
        images={images.data}
      />
      {availableImageCount < processedImage.data.slotCount && <FetchError type="image" />}
    </div>
  );
};

export default PrintPage;
