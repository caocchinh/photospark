"use client";

import {QueueTable} from "@/drizzle/schema";
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
import {useTranslation} from "react-i18next";
import {useProcessedImage} from "@/context/ProcssedImageContext";

const Queue = ({queue}: {queue: typeof QueueTable.$inferSelect}) => {
  const {processedImage, images} = useProcessedImage();
  const stageRef = useRef<StageElement | null>(null);
  const [queueStatus, setQueueStatus] = useState(queue.status);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshable, setRefreshable] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15);
  const {t} = useTranslation();

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
    <>
      {processedImage && images && (
        <div className="flex flex-wrap items-center justify-center w-full gap-8 py-8">
          <Card className=" w-[90%] lg:w-[40%]">
            <CardHeader>
              <CardTitle>{t("Image printing information")}</CardTitle>
              <CardDescription>{t("Details about the image printing order")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2 p-4 border rounded-md">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-end w-full">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={refreshQueue}
                          disabled={isRefreshing || !refreshable}
                          className={cn(
                            "p-1 h-8 w-full bg-black text-white hover:bg-black self-end hover:text-white",
                            isRefreshing || !refreshable ? "opacity-50 cursor-not-allowed" : "cursor-pointer flex items-center gap-2 justify-center"
                          )}
                        >
                          <FaSync className={cn(isRefreshing && "animate-spin")} />
                          {isRefreshing || !refreshable ? (
                            <h4 className="flex items-center justify-center gap-1 text-xs">
                              {t("Wait")}
                              <span>
                                <SlidingNumber
                                  value={timeLeft}
                                  padStart={true}
                                />
                              </span>
                              {t("seconds to refresh")}
                            </h4>
                          ) : (
                            <h4 className="text-xs">{t("Refresh status")}</h4>
                          )}
                        </Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>{!refreshable ? `${t("Wait")} ${timeLeft} ${t("seconds to refresh")}` : t("Refresh status")}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="flex flex-col items-center justify-between gap-3 mb-2 md:gap-0 md:flex-row">
                  <h3 className="font-medium">{t("Order status")}</h3>
                  <div className="flex items-center justify-center gap-2 md:justify-start">
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
                      {queueStatus === "pending" && t("Waiting for printing")}
                      {queueStatus === "processing" && t("Printing")}
                      {queueStatus === "completed" && t("Printed")}
                      {queueStatus === "failed" && t("Failed")}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-2 md:justify-start sm:flex-row">
                  <h3 className="font-medium">{t("Order ID")}: </h3>
                  <span className="font-medium text-center text-rose-500 hover:underline">{queue.id}</span>
                </div>
              </div>

              <div className="p-4 border rounded-md">
                <h3 className="mb-2 font-medium">{t("Order details")}</h3>
                <div className="flex flex-col items-center justify-center w-full gap-2 md:justify-start">
                  <div className="flex justify-between w-full">
                    <span>{t("Image type")}:</span>
                    <span className="font-medium text-right">{processedImage.type === "double" ? t("Double image") : t("Single image")}</span>
                  </div>
                  <div className="flex justify-between w-full">
                    <span>{t("Quantity")}:</span>
                    <span className="font-medium text-right">
                      {queue.quantity * (processedImage.type === "double" ? 2 : 1)} {t("images")}
                    </span>
                  </div>
                  <div className="flex justify-between w-full">
                    <span>{t("Price")}:</span>
                    <span className="font-medium text-right">
                      {queue.price.toLocaleString("vi-VN")} {t("VND")}
                    </span>
                  </div>
                  <div className="flex justify-between w-full">
                    <span>{t("Time")}:</span>
                    <span className="font-medium text-right">{new Date(queue.createdAt).toLocaleString("vi-VN")}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-md bg-yellow-50">
                <p className="text-sm text-center">{t("Please meet staff VTEAM and bring the order ID to get help!")}</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col w-full gap-2">
              <Link
                href={`/${processedImage.id}/print`}
                className="w-full"
              >
                <Button
                  variant="outline"
                  className="w-full gap-2 cursor-pointer active:opacity-80"
                >
                  <FaArrowLeft /> {t("Back")}
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
      )}
    </>
  );
};

export default Queue;
