import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function findSwappedIndices(arr1: number[], arr2: number[]) {
  const diffIndices = [];
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      diffIndices.push(i);
    }
  }

  const [idx1, idx2] = diffIndices;

  return {
    fromIndex: idx1,
    toIndex: idx2,
  };
}

export function getCameraConstraints(frameWidth: number, frameHeight: number, deviceId?: string): MediaStreamConstraints {
  const aspectRatio = frameWidth / frameHeight;

  let idealWidth = Math.round(1280);
  let idealHeight = Math.round(idealWidth / aspectRatio);

  idealHeight = Math.ceil(idealHeight / 16) * 16;
  idealWidth = Math.round(idealHeight * aspectRatio);

  const maxWidth = window.innerWidth * 0.9;
  const maxHeight = window.innerHeight * 0.8;

  if (idealWidth > maxWidth || idealHeight > maxHeight) {
    const scaleFactor = Math.min(maxWidth / idealWidth, maxHeight / idealHeight);
    idealWidth = Math.floor(idealWidth * scaleFactor);
    idealHeight = Math.floor(idealHeight * scaleFactor);
  }

  const constraints: MediaTrackConstraints = {
    width: {ideal: idealWidth},
    height: {ideal: idealHeight},
    aspectRatio: {exact: aspectRatio},
    deviceId: deviceId ? {exact: deviceId} : undefined,
  };

  return { video: constraints };
}
