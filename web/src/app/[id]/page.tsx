import Canvas from "@/components/Preview";
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
    <div className="w-full min-h-screen flex items-center justify-center gap-4 bg-[url(/background.webp)]  bg-no-repeat bg-cover">
      {processedImage.error || images.error || video.error || !processedImage.data || !images.data || !video.data ? (
        <div className="p-6 bg-white/90 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-red-600">Error</h2>
          <p className="text-gray-800">Hình không tồn tại</p>
        </div>
      ) : (
        <Canvas
          processedImage={processedImage.data}
          images={images.data}
          video={video.data}
        />
      )}
    </div>
  );
};

export default PreviewPage;
