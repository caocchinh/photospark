import {useEffect, useRef} from "react";

interface UseViewportScaleOptions {
  baseHeight?: number;
  minScale?: number;
  maxScale?: number;
  baseScale?: number;
  cssVariable?: string;
}

/**
 * Custom hook for dynamically scaling elements based on viewport height
 * @param options Configuration options for scaling behavior
 * @returns Reference to attach to the element that needs to be scaled
 */
export const useViewportScale = ({
  baseHeight = 650,
  minScale = 0.5,
  maxScale = 1.2,
  baseScale = 0.75,
  cssVariable = "--scale-factor",
}: UseViewportScaleOptions = {}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      const viewportHeight = window.innerHeight;
      let scaleFactor = baseScale * (viewportHeight / baseHeight);
      scaleFactor = Math.max(minScale, Math.min(maxScale, scaleFactor));

      document.documentElement.style.setProperty(cssVariable, scaleFactor.toString());
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [baseHeight, minScale, maxScale, baseScale, cssVariable]);

  return elementRef;
};
