"use client";

import {AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle} from "@/components/ui/alert-dialog";
import {MdWifiOff} from "react-icons/md";
import {IoRefresh} from "react-icons/io5";
import {Button} from "@/components/ui/button";
import {useSocket} from "@/context/SocketContext";
const NetworkStatus = () => {
  const {isOnline} = useSocket();

  return (
    <AlertDialog open={!isOnline}>
      <AlertDialogContent className="flex flex-col items-center justify-center gap-4 border border-red-500 z-[999]">
        <AlertDialogTitle className="text-red-600 text-4xl font-bold flex gap-2 items-center justify-center flex-col uppercase text-center">
          Không có kết nối internet
          <MdWifiOff size={100} />
        </AlertDialogTitle>
        <AlertDialogDescription className="text-2xl text-center">Vui lòng kiểm tra kết nối internet và thử lại!</AlertDialogDescription>
        <AlertDialogFooter className="w-full">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 cursor-pointer w-full"
          >
            Tải lại ứng dụng
            <IoRefresh />
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NetworkStatus;
