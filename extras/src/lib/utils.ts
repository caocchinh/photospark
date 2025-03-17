import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusColor(status: string) {
  switch (status) {
    case "success":
      return "text-green-600";
    case "processing":
      return "text-blue-600";
    case "failed":
      return "text-red-600";
    case "pending":
      return "text-yellow-600";
    default:
      return "";
  }
}

export function getStatusColorDot(status: string) {
  switch (status) {
    case "success":
      return "bg-green-600";
    case "processing":
      return "bg-blue-600";
    case "failed":
      return "bg-red-600";
    case "pending":
      return "bg-yellow-600";
    default:
      return "";
  }
}
