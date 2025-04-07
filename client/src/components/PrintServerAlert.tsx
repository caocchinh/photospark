"use client";

import {useTranslation} from "react-i18next";
import {AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogTitle} from "@/components/ui/alert-dialog";
import {TextShimmer} from "@/components/ui/text-shimmer";
import {PiPrinter} from "react-icons/pi";
import {IoMdArrowDropright} from "react-icons/io";
import LoadingSpinner from "@/components/LoadingSpinner";
import {useSocket} from "@/context/SocketContext";

const PrintServerAlert = () => {
  const {t} = useTranslation();
  const {isSocketConnected} = useSocket();
  return (
    <AlertDialog open={!isSocketConnected}>
      <AlertDialogContent
        className="flex flex-col items-center justify-center z-[998]"
        aria-description="Waiting for print server"
      >
        <AlertDialogTitle className="relative">
          <TextShimmer
            className="font-semibold text-3xl uppercase text-center [--base-color:black] [--base-gradient-color:gray]"
            duration={1.5}
            spread={4}
          >
            {t("Waiting for print server")}
          </TextShimmer>
        </AlertDialogTitle>
        <div className="relative">
          <PiPrinter className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 w-9 h-9" />
          <LoadingSpinner size={75} />
        </div>
        <AlertDialogDescription className="text-lg text-center">{t("Please wait while we connect to the print server")}</AlertDialogDescription>
        <div className="flex flex-col w-full gap-2 px-4 py-2 bg-red-500 rounded-lg">
          <div className="flex items-center w-full gap-2 group">
            <IoMdArrowDropright
              color="white"
              size={20}
            />
            <h4 className="text-white group-hover:underline">cd server</h4>
          </div>
          <div className="flex items-center w-full gap-2 group">
            <IoMdArrowDropright
              color="white"
              size={20}
            />
            <h4 className="text-white group-hover:underline">npm run dev</h4>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PrintServerAlert;
