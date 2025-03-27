"use client";
import SlideTransition from "@/components/SlideTransition";
import {usePhotoState} from "@/context/PhotoStateContext";
import {useEffect, useState} from "react";

export default function CollabTransitionOverlay() {
  const {photo} = usePhotoState();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isMounted) return null;

  return photo?.isTransition || !photo ? <SlideTransition /> : null;
}
