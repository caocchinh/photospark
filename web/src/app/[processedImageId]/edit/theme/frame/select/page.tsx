"use client";

import {useMediaQuery} from "@/hooks/useMediaQuery";
import {useReloadConfirm} from "@/hooks/useReloadConfirm";
import dynamic from "next/dynamic";

const DesktopContent = dynamic(() => import("./DesktopContent"), {ssr: false});
const MobileContent = dynamic(() => import("./MobileContent"), {ssr: false});

const SelectEditPage = () => {
  useReloadConfirm();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  return <div className="w-full h-full p-4">{isDesktop ? <DesktopContent /> : <MobileContent />}</div>;
};

export default SelectEditPage;
