import Edit from "./Edit";
import {getProcessedImage, getImage} from "@/server/actions";
import ImageNotFoundError from "@/components/ImageNotFoundError";
import ImageFetchError from "@/components/ImageFetchError";
type Params = Promise<{id: string}>;

const EditPage = async (props: {params: Params}) => {
  const params = await props.params;
  const id = params.id;

  const processedImage = await getProcessedImage(id);

  if (processedImage.error || !processedImage.data) {
    return <ImageNotFoundError />;
  }
  const images = await getImage(id);
  const availableImageCount = images.data?.filter((image) => image.slotPositionX != null && image.slotPositionY != null).length || 0;

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-white ">
      <Edit
        processedImage={processedImage.data}
        images={images.data}
      />
      {availableImageCount < processedImage.data.slotCount && <ImageFetchError />}
    </div>
  );
};

export default EditPage;
