"use client";

import FetchError from "@/components/FetchError";
import {ReactNode} from "react";
import DatabaseFetchError from "@/components/DatabaseFetchError";
import NavBar from "@/components/NavBar";
import {PhotoProvider} from "@/context/PhotoContext";
import {useProcessedImage} from "@/context/ProcssedImageContext";
import {NUM_OF_CAPTURE_IMAGE} from "@/constants/constants";

export default function EditLayout({children}: {children: ReactNode}) {
  const {processedImage, images, video} = useProcessedImage();

  if (!processedImage || !images || !video) {
    return <DatabaseFetchError />;
  }
  const bindIdToImage = Array.from({length: images?.length || 0}, (_, index) => ({
    id: index.toString(),
    href: images?.[index]?.url || "",
  }));

  try {
    return (
      <>
        <NavBar />
        <PhotoProvider
          images={bindIdToImage}
          previousProcessedImageId={processedImage?.id}
          videoUrl={video?.url || ""}
          previousProcessedImageCreationDate={processedImage?.createdAt}
        >
          <div className="w-full min-h-screen py-20 relative z-[0] bg-white">
            {children}
            {images?.length < NUM_OF_CAPTURE_IMAGE && <FetchError type="image" />}
          </div>
        </PhotoProvider>
      </>
    );
  } catch {
    return <DatabaseFetchError />;
  }
}
