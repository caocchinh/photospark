"use client";
import {GrPrint} from "react-icons/gr";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import {Button} from "./ui/button";
import {ProcessedImageTable, ImageTable, QueueTable} from "@/drizzle/schema";
import {useCallback, useEffect, useRef, useState} from "react";
import FrameStage from "./FrameStage";
import {Stage as StageElement} from "konva/lib/Stage";
import {Card, CardContent, CardHeader, CardTitle} from "./ui/card";
import {PiCubeLight} from "react-icons/pi";
import {TextShimmer} from "./ui/text-shimmer";
import {cn, formatVietnameseDateUTC7} from "@/lib/utils";
import {useSocket} from "@/context/SocketContext";
import {updateQueueStatus} from "@/server/actions";
import LoadingSpinner from "./LoadingSpinner";
import {RxCross2} from "react-icons/rx";
import {toast} from "sonner";

interface PrintProps {
  processedImage: typeof ProcessedImageTable.$inferSelect;
  images: (typeof ImageTable.$inferSelect)[];
  queue: typeof QueueTable.$inferSelect;
  refreshQueues: () => Promise<void>;
}

const Print = ({processedImage, images, queue, refreshQueues}: PrintProps) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPrinted, setIsPrinted] = useState(false);
  const [isAlreadyPrintedDialogOpen, setIsAlreadyPrintedDialogOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const stageRef = useRef<StageElement | null>(null);
  const {socket, isSocketConnected} = useSocket();

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  useEffect(() => {
    if (queue?.status === "completed" && !isPrinted && isDialogOpen) {
      console.log("fuck off");
      setIsAlreadyPrintedDialogOpen(true);
    }
  }, [queue, isPrinted, isDialogOpen]);

  const printImage = useCallback(async () => {
    if (stageRef.current && imageLoaded && processedImage && socket && processedImage.id) {
      if (!isSocketConnected) {
        console.error("Socket not connected. Cannot print.");
        return;
      }
      if (isPrinting) return;
      setIsPrinting(true);

      const dataURL = stageRef.current.toDataURL({pixelRatio: 5});

      socket.emit(
        "print",
        {
          quantity: queue.quantity,
          dataURL: dataURL,
          theme: processedImage.theme,
        },
        async (response: {success: boolean; message?: string}) => {
          console.log("Print event emitted:", response);
          if (response.success) {
            setIsPrinting(false);
            setIsPrinted(true);
            toast.success("Đã đặt in thành công!", {
              description: `Đơn hàng ${queue.id} đã được đặt in thành công!`,
              duration: 5000,
              style: {
                backgroundColor: "#5cb85c",
                color: "white",
              },
              descriptionClassName: "!text-white font-medium",
              className: "flex items-center justify-start flex-col gap-5 w-[300px]",
              actionButtonStyle: {
                backgroundColor: "white",
                color: "black",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              },
              action: {
                label: "Đóng",
                onClick: () => toast.dismiss(),
              },
            });
            try {
              const updateStatus = await updateQueueStatus(queue.id, "completed");
              if (updateStatus.error) {
                throw new Error("Failed to print");
              } else {
                console.log("Printed sucessfully to database!");
                setIsDialogOpen(false);
                await refreshQueues();
              }
            } catch (error) {
              console.error("Error printing:", error);
            }
          } else {
            toast.error("Đã in thất bại!", {
              description: `Đơn hàng ${queue.id} đã in thất bại!`,
              duration: 5000,
              style: {
                backgroundColor: "#ef4444",
                color: "white",
              },
              descriptionClassName: "!text-white font-medium",
              className: "flex items-center justify-start flex-col gap-5 w-[300px]",
              actionButtonStyle: {
                backgroundColor: "white",
                color: "black",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              },
              action: {
                label: "Đóng",
                onClick: () => toast.dismiss(),
              },
            });
            try {
              const updateStatus = await updateQueueStatus(queue.id, "failed");
              if (updateStatus.error) {
                throw new Error("Failed to update status");
              } else {
                console.log("Status updated sucessfully to database!");
              }
            } catch (error) {
              console.error("Error updating status:", error);
            }
          }
        }
      );
    }
  }, [imageLoaded, isPrinting, isSocketConnected, processedImage, queue, socket, refreshQueues]);

  const handleDialogChange = (open: boolean) => {
    setIsPrinted(false);
    setIsDialogOpen(open);
    setCountdown(4);
  };

  return (
    <AlertDialog
      open={isDialogOpen}
      onOpenChange={handleDialogChange}
    >
      <AlertDialogTrigger asChild>
        <Button
          className="border border-slate-300 flex-1 cursor-pointer w-full"
          onClick={() => setIsDialogOpen(true)}
        >
          In
          <GrPrint
            size={25}
            color="white"
          />
        </Button>
      </AlertDialogTrigger>
      {processedImage && images && queue && (
        <AlertDialogContent className="min-w-[90vw] min-h-[90vh] flex flex-col items-center justify-between">
          <RxCross2
            className={cn("absolute top-[20px] right-[20px] cursor-pointer", isPrinting && "pointer-events-none")}
            size={25}
            onClick={() => setIsDialogOpen(false)}
          />
          <AlertDialogHeader className="text-center flex items-center justify-center">
            <AlertDialogTitle className="">
              <TextShimmer
                className=" text-center uppercase text-2xl  [--base-color:black] [--base-gradient-color:gray]"
                duration={5}
                spread={4}
              >
                Hãy kiểm tra lại kỹ thông tin trước khi in
              </TextShimmer>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-red-500 text-xl">Khi đã in, không thể hủy được!</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-row items-center justify-center">
            <div className="relative h-[550px] bottom-[75px]">
              <FrameStage
                processedImage={processedImage}
                images={images}
                stageRef={stageRef}
                onLoadingComplete={setImageLoaded}
              />
            </div>
            <Card className="w-[500px] h-[545px] rounded-sm">
              <CardHeader className="flex flex-row items-center justify-center gap-1">
                <CardTitle className="text-center uppercase text-xl">Thông tin đơn hàng</CardTitle>
                <PiCubeLight size={25} />
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-between h-full w-full gap-5">
                <div className="flex flex-col items-center justify-center w-full gap-5">
                  <div className="flex justify-between w-full">
                    <p className="font-bold text-xl">Mã hàng:</p>
                    <p className="text-lg">{queue.id}</p>
                  </div>
                  <div className="flex justify-between w-full">
                    <p className="font-bold text-xl">Mã hình:</p>
                    <p className="text-lg">{processedImage.id}</p>
                  </div>
                  <div className="flex justify-between w-full">
                    <p className="font-bold text-xl">Số lượng:</p>
                    <p className="text-lg">{queue.quantity}</p>
                  </div>
                  <div className="flex justify-between w-full">
                    <p className="font-bold text-xl">Ngày đặt:</p>
                    <p className="text-lg">{formatVietnameseDateUTC7(queue.createdAt)}</p>
                  </div>
                  <div className="flex justify-between w-full">
                    <p className="font-bold text-xl">Giá:</p>
                    <p className="text-lg">{queue.price.toLocaleString("vi-VN")} VNĐ</p>
                  </div>
                </div>
                <div className="border rounded-md p-4 bg-yellow-50 flex-1 w-full flex items-center justify-center">
                  <p className="text-center text-lg">Sau khi in, vui lòng kiểm tra lại số lượng.</p>
                </div>
                <AlertDialog open={isAlreadyPrintedDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      onClick={printImage}
                      disabled={!imageLoaded || isPrinting || countdown > 0}
                      className="w-full cursor-pointer"
                    >
                      {isPrinting ? "Đang in..." : countdown > 0 ? `In (${countdown}s)` : "In"}
                      {isPrinting && <LoadingSpinner size={20} />}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Đơn này đã được in thành công!</AlertDialogTitle>
                      <AlertDialogDescription>Bạn có chắc chắn muốn in lại?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        onClick={() => {
                          setIsDialogOpen(false);
                          setIsAlreadyPrintedDialogOpen(false);
                        }}
                        className="cursor-pointer bg-red-500 hover:bg-red-600 hover:text-white text-white"
                      >
                        Hủy
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="cursor-pointer"
                        onClick={() => setIsAlreadyPrintedDialogOpen(false)}
                      >
                        Chắc chắn
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
          <AlertDialogFooter className="w-full">
            <AlertDialogCancel
              className="w-full cursor-pointer bg-red-500 hover:bg-red-600 hover:text-white text-white"
              disabled={isPrinting}
            >
              Hủy
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
};

export default Print;
