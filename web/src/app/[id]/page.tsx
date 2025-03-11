import Canvas from "@/components/Canvas";
import {getImage, getProcessedImage, getVideo} from "@/server/actions";

interface PageProps {
  params: {
    id: string;
  };
}

const PreviewPage = async ({params}: PageProps) => {
  const resolvedParams = await params;
  const {id} = resolvedParams;

  const processedImage = await getProcessedImage(id);
  const images = await getImage(id);
  const video = await getVideo(id);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Canvas
        processedImage={processedImage}
        images={images}
        video={video}
      />
    </div>
  );
};

export default PreviewPage;
