import {getImage, getProcessedImage, getVideo} from "@/server/actions";

import Preview from "./Preview";
import ImageNotFoundError from "@/components/ImageNotFoundError";

type Params = Promise<{id: string}>;

const PreviewPage = async (props: {params: Params}) => {
  const params = await props.params;
  const id = params.id;

  const processedImage = await getProcessedImage(id);
  const images = await getImage(id);
  const video = await getVideo(id);

  return (
    <>
      {processedImage.error || !processedImage.data ? (
        <ImageNotFoundError />
      ) : (
        <div className="w-full min-h-screen flex items-center justify-center bg-white bg-no-repeat bg-cover">
          <Preview
            processedImage={processedImage.data}
            images={images.data}
            video={video.data}
          />
        </div>
      )}
    </>
  );
};

export default PreviewPage;
