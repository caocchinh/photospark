import {getPhotoResources} from "@/server/actions";
import ImageNotFoundError from "@/components/ImageNotFoundError";
import Print from "./Print";
type Params = Promise<{id: string}>;

const PrintPage = async (props: {params: Params}) => {
  const params = await props.params;
  const id = params.id;

  const resources = await getPhotoResources(id);

  if (resources.error || !resources.data) {
    return <ImageNotFoundError />;
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-white ">
      <Print
        processedImage={resources.data.processedImage}
        images={resources.data.images}
        video={resources.data.video}
      />
    </div>
  );
};

export default PrintPage;
