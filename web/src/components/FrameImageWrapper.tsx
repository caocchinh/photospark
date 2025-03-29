"use client";

import dynamic from "next/dynamic";

const FrameImageWrapper = dynamic(() => import("./FrameImage"), {ssr: false});

export default FrameImageWrapper;
