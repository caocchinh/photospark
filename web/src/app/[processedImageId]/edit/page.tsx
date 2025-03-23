"use client";
import DoubleLayout from "@/components/layout-image/DoubleLayout";
import SingularLayout from "@/components/layout-image/SingularLayout";
import {ValidFrameType} from "@/constants/types";
import {usePhoto} from "@/context/PhotoContext";
import Link from "next/link";

const LayoutEditPage = () => {
  const {photo, setPhoto} = usePhoto();

  const handleTypeChange = (type: ValidFrameType) => {
    if (!setPhoto) return;
    setPhoto((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        frameType: type,
      };
    });
  };

  return (
    <div className="w-full min-h-screen flex items-center flex-col justify-center bg-white gap-12">
      <h1 className="text-5xl font-semibold">Chọn layout</h1>
      <div className="flex items-center justify-center gap-8 flex-wrap w-full">
        <Link
          href={`/${photo?.previousProcessedImageId}/edit/theme`}
          className=" cursor-pointer hover:scale-[1.02] active:scale-[0.99] flex items-center justify-center"
          onClick={() => handleTypeChange("singular")}
          tabIndex={-1}
        >
          <SingularLayout />
        </Link>
        <Link
          href={`/${photo?.previousProcessedImageId}/edit/theme`}
          className=" cursor-pointer hover:scale-[1.02] active:scale-[0.99] flex items-center justify-center"
          onClick={() => handleTypeChange("double")}
          tabIndex={-1}
        >
          <DoubleLayout />
        </Link>
      </div>
    </div>
  );
};

export default LayoutEditPage;
