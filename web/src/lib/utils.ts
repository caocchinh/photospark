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
  // List of intent schemes to try
  const androidSchemes = [
    `intent:${url}#Intent;scheme=https;package=com.android.chrome;end`, // Chrome
    `intent:${url}#Intent;scheme=https;package=com.sec.android.app.sbrowser;end`, // Samsung Browser
    `intent:${url}#Intent;scheme=https;package=com.opera.browser;end`, // Opera
    `intent:${url}#Intent;scheme=https;package=org.mozilla.firefox;end`, // Firefox
    `market://details?id=com.android.chrome`, // Play Store fallback
  ];

  // iOS schemes
  const iosSchemes = [`x-web-search://${url}`, `x-web-browser://${url}`, `googlechrome://${url}`, `firefox://${url}`, `opera-http://${url}`];

  const trySchemes = (schemes: string[]) => {
    let i = 0;
    const tryNextScheme = () => {
      if (i >= schemes.length) {
        // Last resort: direct URL
        window.open(url, "_system");
        window.location.href = url;
        return;
      }

      const scheme = schemes[i++];
      const link = document.createElement("a");
      link.href = scheme;
      link.click();

      // Try next scheme after a short delay
      setTimeout(tryNextScheme, 300);
    };

    tryNextScheme();
  };

  if (isAppleDevice()) {
    trySchemes(iosSchemes);
  } else {
    trySchemes(androidSchemes);
  }
};
