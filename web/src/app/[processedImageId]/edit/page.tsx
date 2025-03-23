"use client";
import {usePhoto} from "@/context/PhotoContext";

const EditPage = () => {
  const {photo} = usePhoto();

  return <div className="w-full min-h-screen flex items-center justify-center bg-white ">{photo?.images[0].href}</div>;
};

export default EditPage;
