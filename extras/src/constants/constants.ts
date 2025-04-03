export const VALID_THEMES = ["prom", "usagyuun"] as const;

export const VALID_FRAME_TYPES = ["singular", "double"] as const;

export const MULTIPLIER = 1.3;

export const FRAME_WIDTH = 355 * MULTIPLIER;
export const FRAME_HEIGHT = 524 * MULTIPLIER;

export const IMAGE_WIDTH = 378 * MULTIPLIER;
export const IMAGE_HEIGHT = 560 * MULTIPLIER;

export const OFFSET_X = (IMAGE_WIDTH - FRAME_WIDTH) / 2;
export const OFFSET_Y = (47 / 3) * MULTIPLIER;

export const QUEUE_TITLE_MAPING = {
  id: "Mã đơn hàng",
  processedImageId: "Mã ảnh",
  quantity: "Số lượng (giấy in)",
  status: "Trạng thái",
  createdAt: "Thời gian đặt",
  price: "Giá",
};

export const STATUS = {
  completed: "completed",
  processing: "processing",
  failed: "failed",
  pending: "pending",
} as const;

export type StatusKey = keyof typeof STATUS;
export type StatusValue = (typeof STATUS)[StatusKey];

export const STATUS_VIETNAMESE = {
  [STATUS.completed]: "Hoàn thành",
  [STATUS.processing]: "Đang xử lý",
  [STATUS.failed]: "Thất bại",
  [STATUS.pending]: "Chờ xử lý",
} as const;

export type VietnameseStatus = (typeof STATUS_VIETNAMESE)[StatusValue];

export const STATUS_COLORS = {
  [STATUS_VIETNAMESE[STATUS.completed]]: "text-green-600",
  [STATUS_VIETNAMESE[STATUS.processing]]: "text-blue-600",
  [STATUS_VIETNAMESE[STATUS.failed]]: "text-red-600",
  [STATUS_VIETNAMESE[STATUS.pending]]: "text-yellow-600",
};

export const STATUS_DOT_COLORS = {
  [STATUS_VIETNAMESE[STATUS.completed]]: "bg-green-600",
  [STATUS_VIETNAMESE[STATUS.processing]]: "bg-blue-600",
  [STATUS_VIETNAMESE[STATUS.failed]]: "bg-red-600",
  [STATUS_VIETNAMESE[STATUS.pending]]: "bg-yellow-600",
};
