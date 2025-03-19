"use client";

import {usePhoto} from "@/context/PhotoContext";

const CameraLabel = () => {
  const {camera} = usePhoto();
  return <p className="text-center text-gray-500 uppercase text-[10px] absolute top-0 right-0 pointer-events-none">{camera?.label}</p>;
};

export default CameraLabel;
