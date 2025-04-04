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

export function isEmbeddedBrowser() {
  const userAgent = navigator.userAgent || "";
  const embeddedBrowserPatterns = ["FBAN", "FBAV", "Instagram", "TikTok", "Snapchat", "Twitter", "Line", "WeChat", "QQBrowser"];
  const embeddedBrowserRegex = new RegExp(embeddedBrowserPatterns.join("|"), "i");
  return embeddedBrowserRegex.test(userAgent);
}

export const isAppleDevice = () => {
  if (typeof window === "undefined") return false;

  const isAppleVendor = /apple/i.test(navigator.vendor);
  const isApplePlatform = /Mac|iPad|iPhone|iPod/.test(navigator.platform);
  const isAppleUserAgent = /Mac|iPad|iPhone|iPod/.test(navigator.userAgent);

  return isAppleVendor || isApplePlatform || isAppleUserAgent || navigator.platform === "MacIntel" || navigator.userAgent.includes("Macintosh");
};

export const openInExternalBrowser = (url: string) => {
  // iOS
  if (isAppleDevice()) {
    window.location.href = `x-web-search://${url}`;
    return;
  } else {
    window.location.href = `intent:${url}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`;
    return;
  }
};
