import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateTimestampFilename(prefix: string, extension: string): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/:/g, "-").replace(/\..+/, "").replace("T", "_");

  return `${prefix}_${timestamp}.${extension}`;
}

export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

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
