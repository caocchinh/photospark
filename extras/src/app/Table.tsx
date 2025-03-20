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

const Table = ({avaialbleQueues}: {avaialbleQueues: (typeof QueueTable.$inferSelect)[]}) => {
  const [selectedFilterColumn, setSelectedFilterColumn] = useState<string>("id");
  const [processedImageId, setProcessedImageId] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<typeof ProcessedImageTable.$inferSelect | null>(null);
  const [images, setImages] = useState<(typeof ImageTable.$inferSelect)[] | null>(null);
  const [queues, setQueues] = useState<(typeof QueueTable.$inferSelect)[]>(avaialbleQueues);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const stageRef = useRef<StageElement | null>(null);

  const refreshQueues = async () => {
    setIsRefreshing(true);
    const newQueues = await getAllQueues();
    setQueues(newQueues);
    setIsRefreshing(false);
  };

  useEffect(() => {
    const fetchProcessedImage = async () => {
      if (processedImageId) {
        const processedImage = await getProcessedImage(processedImageId);
        setProcessedImage(processedImage || null);
        const images = await getImages(processedImageId);
        setImages(images);
      }
    };
    fetchProcessedImage();
  }, [processedImageId]);

  return (
    <div className="w-[100%] items-center justify-center flex gap-8">
      <div className="flex items-start justify-between flex-col w-[50%]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Lọc theo:</h3>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="border border-slate-300"
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
        </div>

        <DataTable
          columns={columns()}
          data={queues.map((item) => transformQueueData(item))}
          filterColumn={selectedFilterColumn}
          filterPlaceholder={`Lọc bằng ${QUEUE_TITLE_MAPING[selectedFilterColumn as keyof typeof QUEUE_TITLE_MAPING].toLowerCase()}...`}
          setProcessedImageId={setProcessedImageId}
        />
      </div>

      {processedImage && images && (
        <FrameStage
          processedImage={processedImage}
          images={images}
          stageRef={stageRef}
        />
      )}
    </div>
  );
};

export default Table;
