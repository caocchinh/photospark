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
import {GrPrint} from "react-icons/gr";
import PrintServerAlert from "@/components/PrintServerAlert";
import NetworkStatus from "@/components/NetworkStatus";
import {useSocket} from "@/context/SocketContext";
import ErrorDialog from "@/components/ErrorDialog";

const Table = ({avaialbleQueues}: {avaialbleQueues: (typeof QueueTable.$inferSelect)[]}) => {
  const [selectedFilterColumn, setSelectedFilterColumn] = useState<string>("id");
  const [processedImageId, setProcessedImageId] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<typeof ProcessedImageTable.$inferSelect | null>(null);
  const [images, setImages] = useState<(typeof ImageTable.$inferSelect)[] | null>(null);
  const [queues, setQueues] = useState<(typeof QueueTable.$inferSelect)[]>(avaialbleQueues);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const stageRef = useRef<StageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const {isSocketConnected} = useSocket();
  const [isError, setIsError] = useState(false);

  const refreshQueues = async () => {
    setIsRefreshing(true);
    const newQueues = await getAllQueues();
    setQueues(newQueues);
    setIsRefreshing(false);
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
            setProcessedImage(processedImage.response || null);
            setImages(images.response || null);
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
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Lọc theo:</h3>
              </div>
              <DropdownMenu>
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
                  {Object.keys(avaialbleQueues[0]).map((columnName) => (
                    <DropdownMenuItem
                      key={columnName}
                      onClick={() => setSelectedFilterColumn(columnName)}
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
              disabled={isRefreshing}
            >
              Refresh
              <LuRefreshCcw className={cn(isRefreshing && "animate-spin")} />
            </Button>
            <Button
              className="border border-slate-300 flex-1 cursor-pointer"
              disabled={!processedImage || !images || !imageLoaded || !isSocketConnected}
            >
              In
              <GrPrint
                size={25}
                color="white"
              />
            </Button>
          </div>

          <DataTable
            columns={columns()}
            processedImageId={processedImageId || ""}
            data={queues.map((item) => transformQueueData(item))}
            filterColumn={selectedFilterColumn}
            filterPlaceholder={`Lọc bằng ${QUEUE_TITLE_MAPING[selectedFilterColumn as keyof typeof QUEUE_TITLE_MAPING].toLowerCase()}...`}
            setProcessedImageId={setProcessedImageId}
            setIsError={setIsError}
          />
        </div>

        {processedImage && images ? (
          <>
            <div className={cn(!imageLoaded ? "opacity-0 !absolute" : "opacity-100", "flex flex-col items-start relative max-h-[500px]")}>
              <FrameStage
                processedImage={processedImage}
                images={images}
                stageRef={stageRef}
                onLoadingComplete={setImageLoaded}
              />
            </div>

            {!imageLoaded && (
              <div className="flex flex-col items-center justify-center relative min-w-[500px] min-h-[500px]">
                <h1 className="text-2xl font-semibold uppercase">Đang tải hình...</h1>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center relative min-w-[500px] min-h-[500px]">
            <h1 className="text-2xl font-semibold uppercase">Hãy chọn đơn hàng để bắt đầu</h1>
            <Image
              src="/ass.gif"
              alt="twerk"
              width={100}
              height={100}
            />
          </div>
        )}
      </div>
      {isError && <ErrorDialog />}
    </>
  );
};

export default Table;
