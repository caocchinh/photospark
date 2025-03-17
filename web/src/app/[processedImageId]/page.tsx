import {getImage, getProcessedImage, getVideo} from "@/server/actions";
import Preview from "./Preview";
import ImageNotFoundError from "@/components/ImageNotFoundError";
import FetchError from "@/components/FetchError";

type Params = Promise<{processedImageId: string}>;

const PreviewPage = async (props: {params: Params}) => {
  const params = await props.params;
  const processedImageId = params.processedImageId;

  const processedImage = await getProcessedImage(processedImageId);

  if (processedImage.error || !processedImage.data) {
    return <ImageNotFoundError />;
  }
  const images = await getImage(processedImageId);
  const availableImageCount = images.data?.filter((image) => image.slotPositionX != null && image.slotPositionY != null).length || 0;
  const video = await getVideo(processedImageId);
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-white bg-no-repeat bg-cover">
      <Preview
        processedImage={processedImage.data}
        images={images.data}
        video={video.data!}
      />
      {availableImageCount < processedImage.data.slotCount && <FetchError type="image" />}
      {(video.error || !video.data) && <FetchError type="video" />}
    </div>
  );
};

export default PreviewPage;
