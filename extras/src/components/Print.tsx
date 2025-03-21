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
import {ProcessedImageTable, ImageTable} from "@/drizzle/schema";
import {useRef, useState} from "react";
import FrameStage from "./FrameStage";
import {Stage as StageElement} from "konva/lib/Stage";

interface PrintProps {
  processedImage: typeof ProcessedImageTable.$inferSelect;
  images: (typeof ImageTable.$inferSelect)[];
}

const Print = ({processedImage, images}: PrintProps) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const stageRef = useRef<StageElement | null>(null);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="border border-slate-300 flex-1 cursor-pointer w-full">
          In
          <GrPrint
            size={25}
            color="white"
          />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="min-w-[90vw] min-h-[90vh] flex flex-col items-center justify-between">
        <AlertDialogHeader className="text-center flex items-center justify-center">
          <AlertDialogTitle className="text-center uppercase">Hãy kiểm tra lại thông tin kỹ trước khi in!</AlertDialogTitle>
          <AlertDialogDescription className="text-center text-red-500">1 khi đã in, bạn không thể hủy bỏ được!</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="relative h-[550px] bottom-[71px]">
          <FrameStage
            processedImage={processedImage}
            images={images}
            stageRef={stageRef}
            onLoadingComplete={setImageLoaded}
          />
        </div>
        <AlertDialogFooter className="w-full">
          <AlertDialogCancel className="w-1/2">Hủy</AlertDialogCancel>
          <AlertDialogAction
            disabled={!imageLoaded}
            className="w-1/2"
          >
            In
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Print;
