"use client";

import {ImageTable, ProcessedImageTable, QueueTable} from "@/drizzle/schema";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import Link from "next/link";
import {FaArrowLeft} from "react-icons/fa6";
import {useCallback, useEffect, useRef, useState} from "react";
import FrameStage from "@/components/FrameStage";
import {Stage as StageElement} from "konva/lib/Stage";
import {getQueueStatus} from "@/server/actions";
import {FaSync} from "react-icons/fa";
import {cn} from "@/lib/utils";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {SlidingNumber} from "@/components/ui/sliding-number";

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
  const [queueStatus, setQueueStatus] = useState(queue.status);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshable, setRefreshable] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15);

  const refreshQueue = useCallback(async () => {
    if (!refreshable) {
      return;
    }
    try {
      setIsRefreshing(true);
      setRefreshable(false);
      setTimeLeft(15);
      const response = await getQueueStatus(queue.id);
      if (response.error) {
        console.error("Failed to refresh queue:", response.error);
      } else {
        setQueueStatus(response.data!);
      }
    } catch (error) {
      console.error("Failed to refresh queue:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [queue.id, refreshable]);

  useEffect(() => {
    if (timeLeft > 0 && !refreshable) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setRefreshable(true);
    }
  }, [refreshable, timeLeft]);

  return (
    <div className="w-full flex items-center justify-center gap-8  m-8 mt-20 flex-wrap">
      <Card className=" w-[90%] lg:w-[40%]">
        <CardHeader>
          <CardTitle>Thông tin in ảnh</CardTitle>
          <CardDescription>Chi tiết về đơn hàng in ảnh của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Trạng thái đơn hàng</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={refreshQueue}
                        disabled={isRefreshing || !refreshable}
                        className={cn(
                          "p-1 h-8 w-max bg-black text-white hover:bg-black hover:text-white",
                          isRefreshing || !refreshable ? "opacity-50 cursor-not-allowed" : "cursor-pointer flex items-center gap-2 justify-center"
                        )}
                      >
                        <FaSync className={cn(isRefreshing && "animate-spin")} />
                        {isRefreshing || !refreshable ? (
                          <h4 className="text-xs flex items-center gap-1 justify-center">
                            Đợi
                            <span>
                              <SlidingNumber
                                value={timeLeft}
                                padStart={true}
                              />
                            </span>
                            giây để làm mới
                          </h4>
                        ) : (
                          <h4 className="text-xs">Làm mới trạng thái</h4>
                        )}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{!refreshable ? `Đợi ${timeLeft} giây để làm mới` : "Làm mới trạng thái"}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  queueStatus === "pending"
                    ? "bg-yellow-500"
                    : queueStatus === "processing"
                    ? "bg-blue-500"
                    : queueStatus === "completed"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              ></div>
              <span>
                {queueStatus === "pending" && "Chờ in"}
                {queueStatus === "processing" && "Đang in"}
                {queueStatus === "completed" && "Đã in xong"}
                {queueStatus === "failed" && "Thất bại"}
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
            <p className="text-center text-sm">Hãy gặp staff VTEAM và đưa mã đơn hàng để được hỗ trợ!</p>
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
