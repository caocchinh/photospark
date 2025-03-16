import {getImage, getProcessedImage, getVideo} from "@/server/actions";
import Preview from "./Preview";
import ImageNotFoundError from "@/components/ImageNotFoundError";
import ImageFetchError from "@/components/ImageFetchError";
import VideoFetchError from "@/components/VideoFetchError";

type Params = Promise<{id: string}>;

const PreviewPage = async (props: {params: Params}) => {
  const params = await props.params;
  const id = params.id;

  const processedImage = await getProcessedImage(id);

  if (processedImage.error || !processedImage.data) {
    return <ImageNotFoundError />;
  }
  const images = await getImage(id);
  const availableImageCount =
    images.data?.filter((image) => image.slotPositionX != null && image.slotPositionY != null && image.height != null && image.width != null)
      .length || 0;
  const video = await getVideo(id);
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-white bg-no-repeat bg-cover">
      <Preview
        processedImage={processedImage.data}
        images={images.data}
        video={video.data!}
      />
      {availableImageCount < processedImage.data.slotCount && <ImageFetchError />}
      {(video.error || !video.data) && <VideoFetchError />}
    </div>
  );
};

export default PreviewPage;
