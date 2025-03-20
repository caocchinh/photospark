import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";
import {QueueEntry} from "@/components/ui/columns";
import {QueueTable} from "@/drizzle/schema";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusColor(status: string) {
  switch (status) {
    case "Hoàn thành":
      return "text-green-600";
    case "Đang xử lý":
      return "text-blue-600";
    case "Thất bại":
      return "text-red-600";
    case "Chờ xử lý":
      return "text-yellow-600";
    default:
      return "";
  }
}

export function getStatusColorDot(status: string) {
  switch (status) {
    case "Hoàn thành":
      return "bg-green-600";
    case "Đang xử lý":
      return "bg-blue-600";
    case "Thất bại":
      return "bg-red-600";
    case "Chờ xử lý":
      return "bg-yellow-600";
    default:
      return "";
  }
}

export const getVietnameseStatus = (status: string): "Hoàn thành" | "Đang xử lý" | "Thất bại" | "Chờ xử lý" => {
  switch (status) {
    case "completed":
      return "Hoàn thành";
    case "processing":
      return "Đang xử lý";
    case "failed":
      return "Thất bại";
    case "pending":
      return "Chờ xử lý";
    default:
      return status as "Hoàn thành" | "Đang xử lý" | "Thất bại" | "Chờ xử lý";
  }
};

export const formatVietnameseDateUTC7 = (date: Date): string => {
  if (!date || !(date instanceof Date)) {
    return "";
  }

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Bangkok",
  };

  return date.toLocaleString("vi-VN", options);
};

export const transformQueueData = (queue: typeof QueueTable.$inferSelect): QueueEntry => {
  return {
    ...queue,
    status: getVietnameseStatus(queue.status),
    createdAt: formatVietnameseDateUTC7(queue.createdAt),
    price: new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(queue.price),
  };
};
