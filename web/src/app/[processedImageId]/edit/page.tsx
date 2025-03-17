import Edit from "./Edit";
import {getProcessedImage, getImage} from "@/server/actions";
import ImageNotFoundError from "@/components/ImageNotFoundError";
import FetchError from "@/components/FetchError";
type Params = Promise<{processedImageId: string}>;

const EditPage = async (props: {params: Params}) => {
  const params = await props.params;
  const processedImageId = params.processedImageId;

  const processedImage = await getProcessedImage(processedImageId);

  if (processedImage.error || !processedImage.data) {
    return <ImageNotFoundError />;
  }
  const images = await getImage(processedImageId);
  const availableImageCount = images.data?.filter((image) => image.slotPositionX != null && image.slotPositionY != null).length || 0;

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-white ">
      <Edit
        processedImage={processedImage.data}
        images={images.data}
      />
      {availableImageCount < processedImage.data.slotCount && <FetchError type="image" />}
    </div>
  );
};

export default EditPage;
