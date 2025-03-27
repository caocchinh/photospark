"use client";

import {useCamera} from "@/context/CameraContext";

const CameraLabel = () => {
  const {camera} = useCamera();
  return <p className="text-center text-gray-500 uppercase text-[10px] absolute top-[10px] right-0 pointer-events-none">{camera?.label}</p>;
};

export default CameraLabel;
