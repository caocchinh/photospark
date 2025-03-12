"use client";
import {usePhoto} from "@/context/PhotoContext";
import SlideTransition from "@/components/SlideTransition";
import {useEffect, useState} from "react";

export default function CollabTransitionOverlay() {
  const {photo} = usePhoto();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isMounted) return null;

  return photo?.isTransition || !photo ? <SlideTransition /> : null;
}
