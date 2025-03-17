"use client";

import {ImageTable, ProcessedImageTable, QueueTable} from "@/drizzle/schema";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import Link from "next/link";
import {FaArrowLeft} from "react-icons/fa6";
import {useRef} from "react";
import FrameStage from "@/components/FrameStage";
import {Stage as StageElement} from "konva/lib/Stage";

const Queue = ({
  processedImage,
  queue,
  images,
}: {
  processedImage: typeof ProcessedImageTable.$inferSelect;
  queue: typeof QueueTable.$inferSelect;
  images?: (typeof ImageTable.$inferSelect)[];
}) => {
  const stageRef = useRef<StageElement | null>(null);
  return (
    <div className="w-full flex items-center justify-center gap-8  m-8 mt-20 flex-wrap">
      <Card className=" w-[90%] lg:w-[40%]">
        <CardHeader>
          <CardTitle>Thông tin in ảnh</CardTitle>
          <CardDescription>Chi tiết về đơn hàng in ảnh của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Trạng thái đơn hàng</h3>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  queue.status === "pending"
                    ? "bg-yellow-500"
                    : queue.status === "processing"
                    ? "bg-blue-500"
                    : queue.status === "completed"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              ></div>
              <span>
                {queue.status === "pending" && "Chờ in"}
                {queue.status === "processing" && "Đang in"}
                {queue.status === "completed" && "Đã in xong"}
                {queue.status === "failed" && "Thất bại"}
              </span>
            </div>
            <div className="flex items-center gap-2 justify-start">
              <h3 className="font-medium">Mã đơn hàng: </h3>
              <span className="font-medium">{queue.id}</span>
            </div>
          </div>

          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Chi tiết đơn hàng</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Loại ảnh:</span>
                <span className="font-medium">{processedImage.type === "double" ? "Ảnh đôi" : "Ảnh đơn"}</span>
              </div>
              <div className="flex justify-between">
                <span>Số lượng:</span>
                <span className="font-medium">{queue.quantity * (processedImage.type === "double" ? 2 : 1)} ảnh</span>
              </div>
              <div className="flex justify-between">
                <span>Giá</span>
                <span className="font-medium">{queue.price} VNĐ</span>
              </div>
              <div className="flex justify-between">
                <span>Thời gian đặt:</span>
                <span className="font-medium">{new Date(queue.createdAt).toLocaleString("vi-VN")}</span>
              </div>
            </div>
          </div>

          <div className="border rounded-md p-4 bg-yellow-50">
            <p className="text-center text-sm">Vui lòng gặp staff VTEAM để được hỗ trợ!</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 w-full">
          <Link
            href={`/${processedImage.id}/print`}
            className="w-full"
          >
            <Button
              variant="outline"
              className="w-full gap-2 cursor-pointer"
            >
              <FaArrowLeft /> Quay lại
            </Button>
          </Link>
        </CardFooter>
      </Card>
      <FrameStage
        processedImage={processedImage}
        images={images}
        stageRef={stageRef}
      />
    </div>
  );
};

export default Queue;
