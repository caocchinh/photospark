import {Suspense} from "react";
import FetchError from "@/components/FetchError";
import ImageNotFoundError from "@/components/ImageNotFoundError";
import {NUM_OF_CAPTURE_IMAGE} from "@/constants/constants";
import {PhotoProvider} from "@/context/PhotoContext";
import {getImages, getProcessedImage, getVideo} from "@/server/actions";
import {ReactNode} from "react";
import DatabaseFetchError from "@/components/DatabaseFetchError";
import NavBar from "@/components/NavBar";
import PageLoader from "@/components/PageLoader/PageLoader";

type Params = Promise<{processedImageId: string; children: ReactNode}>;

const EditLayoutContent = async ({processedImageId, children}: {processedImageId: string; children: ReactNode}) => {
  // Fetch all data in parallel and wait for all queries to complete
  const [processedImageResult, imagesResult, videoResult] = await Promise.all([
    getProcessedImage(processedImageId),
    getImages(processedImageId),
    getVideo(processedImageId),
  ]);

  // Handle error cases after all data is fetched
  if (processedImageResult.error || !processedImageResult.data) {
    return <ImageNotFoundError />;
  }

  if (imagesResult.error || !imagesResult.data) {
    return <ImageNotFoundError />;
  }

  const processedImage = processedImageResult.data;
  const images = imagesResult.data;
  const video = videoResult.data;

  const bindIdToImage = Array.from({length: images?.length || 0}, (_, index) => ({
    id: index.toString(),
    href: images?.[index]?.url || "",
  }));

  return (
    <>
      <NavBar />
      <PhotoProvider
        images={bindIdToImage}
        previousProcessedImageId={processedImageId}
        videoUrl={video?.url || ""}
        previousProcessedImageCreationDate={processedImage.createdAt}
      >
        <div className="w-full min-h-screen py-20 relative z-[0] bg-white">
          {children}
          {images.length < NUM_OF_CAPTURE_IMAGE && <FetchError type="image" />}
        </div>
      </PhotoProvider>
    </>
  );
};

export default async function EditLayout(props: {params: Params; children: ReactNode}) {
  const params = await props.params;
  const processedImageId = params.processedImageId;

  try {
    return (
      <Suspense fallback={<PageLoader />}>
        <EditLayoutContent processedImageId={processedImageId}>{props.children}</EditLayoutContent>
      </Suspense>
    );
  } catch {
    return <DatabaseFetchError />;
  }
}
