import {getPhotoResources} from "@/server/actions";
import Preview from "./Preview";
import ImageNotFoundError from "@/components/ImageNotFoundError";

type Params = Promise<{id: string}>;

const PreviewPage = async (props: {params: Params}) => {
  const params = await props.params;
  const id = params.id;

  const resources = await getPhotoResources(id);

  if (resources.error || !resources.data) {
    return <ImageNotFoundError />;
  }

  return (
    <>
      {resources.error || !resources.data ? (
        <ImageNotFoundError />
      ) : (
        <div className="w-full min-h-screen flex items-center justify-center bg-white bg-no-repeat bg-cover">
          <Preview
            processedImage={resources.data.processedImage}
            images={resources.data.images}
            video={resources.data.video}
          />
        </div>
      )}
    </>
  );
};

export default PreviewPage;
