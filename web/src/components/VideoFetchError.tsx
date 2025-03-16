"use client";
import {Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle} from "@/components/ui/dialog";
import {IoRefresh} from "react-icons/io5";
import {PiVideoCameraSlash} from "react-icons/pi";
import {Button} from "./ui/button";

const VideoFetchError = () => {
  return (
    <Dialog defaultOpen={true}>
      <DialogContent className="flex flex-col items-center justify-center gap-4 border border-red-500 min-h-[330px]">
        <div className="flex flex-col items-center justify-center gap-4">
          <DialogTitle className="text-red-500 text-3xl font-semibold text-center uppercase">Lỗi khi load video</DialogTitle>
          <PiVideoCameraSlash size={90} />
          <DialogDescription className="text-xl text-center w-[90%]">Vui lòng thử lại sau, hoặc liên hệ VTEAM để được hỗ trợ!</DialogDescription>
        </div>
        <div className="flex items-center justify-center gap-4 w-full">
          <Button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 cursor-pointer w-1/2 bg-red-500 text-white"
          >
            Refresh lại trang
            <IoRefresh />
          </Button>
          <DialogClose asChild>
            <Button className="flex items-center justify-center gap-2 cursor-pointer w-1/2">Bỏ qua</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoFetchError;
