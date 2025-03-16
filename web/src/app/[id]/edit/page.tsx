import Edit from "./Edit";
import {getProcessedImage, getVideo} from "@/server/actions";
import {getImage} from "@/server/actions";
import ImageNotFoundError from "@/components/ImageNotFoundError";
type Params = Promise<{id: string}>;

const EditPage = async (props: {params: Params}) => {
  const params = await props.params;
  const id = params.id;

  const processedImage = await getProcessedImage(id);
  const images = await getImage(id);
  const video = await getVideo(id);

  if (processedImage.error || !processedImage.data) {
    return <ImageNotFoundError />;
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-white ">
      <Edit
        processedImage={processedImage.data}
        images={images.data}
        video={video.data}
      />
    </div>
  );
};

export default EditPage;
