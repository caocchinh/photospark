"use client";

import {ProcessedImageTable, QueueTable} from "@/drizzle/schema";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import Link from "next/link";
import {FaArrowLeft} from "react-icons/fa6";
import {useState} from "react";

const QueueDetails = ({
  processedImage,
  queues,
}: {
  processedImage: typeof ProcessedImageTable.$inferSelect;
  queues: Array<typeof QueueTable.$inferSelect>;
}) => {
  const [latestQueue] = useState(queues[queues.length - 1]);

  return (
    <div className="w-full flex flex-col items-center justify-center gap-5 p-4 max-w-lg">
      <Card className="w-full">
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
                  latestQueue.status === "pending"
                    ? "bg-yellow-500"
                    : latestQueue.status === "processing"
                    ? "bg-blue-500"
                    : latestQueue.status === "completed"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              ></div>
              <span>
                {latestQueue.status === "pending" && "Chờ in"}
                {latestQueue.status === "processing" && "Đang in"}
                {latestQueue.status === "completed" && "Đã in xong"}
                {latestQueue.status === "failed" && "Thất bại"}
              </span>
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
                <span className="font-medium">{latestQueue.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span>Thời gian đặt:</span>
                <span className="font-medium">{new Date(latestQueue.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="border rounded-md p-4 bg-yellow-50">
            <p className="text-center text-sm">Vui lòng đợi nhân viên VTEAM gọi tên hoặc số đơn hàng của bạn</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 w-full">
          <Link
            href={`/${processedImage.id}`}
            className="w-full"
          >
            <Button
              variant="outline"
              className="w-full gap-2"
            >
              <FaArrowLeft /> Quay lại
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QueueDetails;
