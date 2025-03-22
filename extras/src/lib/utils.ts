import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";
import {QueueEntry} from "@/components/ui/columns";
import {QueueTable} from "@/drizzle/schema";
import {STATUS, STATUS_COLORS, STATUS_DOT_COLORS, STATUS_VIETNAMESE, StatusValue, VietnameseStatus} from "@/constants/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusColor(status: string) {
  return STATUS_COLORS[status as VietnameseStatus] || "";
}

export function getStatusColorDot(status: string) {
  return STATUS_DOT_COLORS[status as VietnameseStatus] || "";
}

export const getVietnameseStatus = (status: string): VietnameseStatus => {
  if (status in STATUS) {
    return STATUS_VIETNAMESE[status as StatusValue];
  }
  return status as VietnameseStatus;
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
