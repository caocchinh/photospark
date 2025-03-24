"use client";
import * as React from "react";
import {DataTable} from "@/components/ui/data-table";
import {Search, ChevronDown} from "lucide-react";
import {columns} from "@/components/ui/columns";
import {useState, useEffect, useRef} from "react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {QUEUE_TITLE_MAPING} from "@/constants/constants";
import {cn, transformQueueData} from "@/lib/utils";
import {QueueTable, ProcessedImageTable, ImageTable} from "@/drizzle/schema";
import {LuRefreshCcw} from "react-icons/lu";
import {getAllQueues, getProcessedImage, getImages} from "@/server/actions";
import FrameStage from "@/components/FrameStage";
import {Stage as StageElement} from "konva/lib/Stage";
import Image from "next/image";
import PrintServerAlert from "@/components/PrintServerAlert";
import NetworkStatus from "@/components/NetworkStatus";
import {useSocket} from "@/context/SocketContext";
import ErrorDialog from "@/components/ErrorDialog";
import Print from "@/components/Print";
import {Label} from "@/components/ui/label";
import {toast} from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";
import {GlowEffect} from "@/components/ui/glow-effect";
const Table = ({availableQueues}: {availableQueues: (typeof QueueTable.$inferSelect)[]}) => {
  const placeholderImages = [
    {src: "/ass.gif", alt: "twerk", width: 100, height: 100},
    {src: "/cute.gif", alt: "awww", width: 150, height: 150},
  ];

  const [selectedFilterColumn, setSelectedFilterColumn] = useState<string>("id");
  const [processedImageId, setProcessedImageId] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<typeof ProcessedImageTable.$inferSelect | null>(null);
  const [images, setImages] = useState<(typeof ImageTable.$inferSelect)[] | null>(null);
  const [queueId, setQueueId] = useState<string | null>(null);
  const [queues, setQueues] = useState<(typeof QueueTable.$inferSelect)[]>(availableQueues);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRefreshButtonDisabled, setIsRefreshButtonDisabled] = useState(false);
  const [randomImageIndex] = useState(() => {
    return Math.floor(Math.random() * placeholderImages.length);
  });
  const stageRef = useRef<StageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const {isSocketConnected} = useSocket();
  const [isError, setIsError] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const refreshQueues = async () => {
    setIsRefreshing(true);
    setIsRefreshButtonDisabled(true);
    try {
      const newQueues = await getAllQueues();
      if (newQueues.error) {
        throw new Error("Error fetching queues");
      } else {
        setQueues(newQueues.response!);
        toast.success("Đã làm mới danh sách đơn hàng!", {
          duration: 3000,
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
      }
    } catch {
      setIsError(true);
      toast.error("Đã làm mới danh sách đơn hàng thất bại!", {
        duration: 3000,
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
    } finally {
      setIsRefreshing(false);
      setTimeout(() => {
        setIsRefreshButtonDisabled(false);
      }, 3200);
    }
  };

  useEffect(() => {
    const fetchProcessedImage = async () => {
      if (processedImageId) {
        try {
          const processedImage = await getProcessedImage(processedImageId);
          const images = await getImages(processedImageId);
          if (processedImage.error || images.error) {
            throw new Error("Processed image or images not found");
          } else {
            setProcessedImage(processedImage.response!);
            setImages(images.response!);
          }
          setIsError(false);
        } catch {
          setIsError(true);
        }
      }
    };

    fetchProcessedImage();
  }, [processedImageId]);

  return (
    <>
      <PrintServerAlert />
      <NetworkStatus />
      <div className="w-[100%] items-start justify-center flex gap-8">
        <div className="flex items-start justify-between flex-col w-[50%]">
          <div className="flex items-center gap-2 w-full">
            <div className="flex items-center gap-2 ">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Search className="h-4 w-4 text-muted-foreground cursor-pointer" />
                <Label className="text-sm font-medium cursor-pointer">Lọc theo:</Label>
              </div>
              <DropdownMenu
                open={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="border border-slate-300 cursor-pointer"
                  >
                    {QUEUE_TITLE_MAPING[selectedFilterColumn as keyof typeof QUEUE_TITLE_MAPING]}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {Object.keys(availableQueues[0]).map((columnName) => (
                    <DropdownMenuItem
                      key={columnName}
                      onClick={() => {
                        setSelectedFilterColumn(columnName);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {QUEUE_TITLE_MAPING[columnName as keyof typeof QUEUE_TITLE_MAPING]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button
              className="cursor-pointer flex items-center gap-2"
              variant="outline"
              onClick={refreshQueues}
              disabled={isRefreshing || !isSocketConnected || isRefreshButtonDisabled}
            >
              Refresh
              <LuRefreshCcw className={cn(isRefreshing && "animate-spin")} />
            </Button>
            <div
              className={cn(
                "flex-1 relative",
                !processedImage || !images || !imageLoaded || !isSocketConnected || isRefreshing || !queueId ? "pointer-events-none opacity-70" : null
              )}
            >
              {!(!processedImage || !images || !imageLoaded || !isSocketConnected || isRefreshing || !queueId) && (
                <GlowEffect
                  colors={["#FF5733", "#33FF57", "#3357FF", "#F1C40F"]}
                  mode="colorShift"
                  blur="soft"
                  duration={3}
                  scale={1}
                  className="z-[0]"
                />
              )}
              <Print
                processedImage={processedImage!}
                images={images!}
                queue={queues.find((queue) => queue.id === queueId)!}
                refreshQueues={refreshQueues}
              />
            </div>
          </div>

          <DataTable
            columns={columns()}
            processedImageId={processedImageId || ""}
            data={queues.map((item) => transformQueueData(item))}
            filterColumn={selectedFilterColumn}
            filterPlaceholder={`Lọc bằng ${QUEUE_TITLE_MAPING[selectedFilterColumn as keyof typeof QUEUE_TITLE_MAPING].toLowerCase()}...`}
            setProcessedImageId={setProcessedImageId}
            setIsError={setIsError}
            setQueueId={setQueueId}
          />
        </div>

        {processedImage && images ? (
          <>
            <div
              className={cn(!imageLoaded ? "opacity-0 !absolute" : "opacity-100", "flex flex-col items-start relative max-h-[500px] bottom-[95px]")}
            >
              <FrameStage
                processedImage={processedImage}
                images={images}
                stageRef={stageRef}
                onLoadingComplete={setImageLoaded}
              />
            </div>

            {!imageLoaded && (
              <div className="flex flex-col items-center justify-center relative min-w-[500px] min-h-[500px] gap-2">
                <LoadingSpinner size={100} />
                <Button
                  variant="outline"
                  className="mt-4 cursor-pointer flex items-center gap-2"
                  onClick={async () => {
                    try {
                      setImageLoaded(false);
                      setProcessedImage(null);
                      setImages(null);

                      if (processedImageId) {
                        const processedImageResult = await getProcessedImage(processedImageId);
                        const imagesResult = await getImages(processedImageId);

                        if (processedImageResult.error || imagesResult.error) {
                          throw new Error("Failed to reload images");
                        }

                        setProcessedImage(processedImageResult.response!);
                        setImages(imagesResult.response!);
                        setIsError(false);
                      }
                    } catch {
                      setIsError(true);
                      toast.error("Tải lại hình ảnh thất bại!", {
                        duration: 3000,
                        style: {backgroundColor: "#ef4444", color: "white"},
                      });
                    }
                  }}
                >
                  Tải lại hình
                  <LuRefreshCcw className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center relative min-w-[500px] min-h-[500px]">
            <h1 className="text-2xl font-semibold uppercase">Hãy chọn đơn hàng để bắt đầu</h1>
            <Image
              src={placeholderImages[randomImageIndex].src}
              alt={placeholderImages[randomImageIndex].alt}
              unoptimized
              width={placeholderImages[randomImageIndex].width}
              height={placeholderImages[randomImageIndex].height}
            />
          </div>
        )}
      </div>
      {isError && <ErrorDialog />}
    </>
  );
};

export default Table;
