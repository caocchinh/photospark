"use client";

import {useSocket} from "@/context/SocketContext";
import {motion} from "motion/react";
import React from "react";
import {AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogTitle} from "@/components/ui/alert-dialog";
import {useTranslation} from "react-i18next";
import LoadingSpinner from "@/components/LoadingSpinner";
import {PiPrinter} from "react-icons/pi";
import {TextShimmer} from "@/components/ui/text-shimmer";
import {IoMdArrowDropright} from "react-icons/io";

export default function Template({children}: {children: React.ReactNode}) {
  const {isConnected} = useSocket();
  const {t} = useTranslation();
  return (
    <>
      <AlertDialog open={!isConnected}>
        <AlertDialogContent className="flex flex-col items-center justify-center">
          <AlertDialogTitle className="relative">
            <TextShimmer
              className=" font-semibold text-3xl uppercase text-center whitespace-nowrap  [--base-color:black] [--base-gradient-color:gray]"
              duration={1.5}
              spread={4}
            >
              {t("Waiting for print server")}
            </TextShimmer>
          </AlertDialogTitle>
          <div className="relative">
            <PiPrinter className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9" />
            <LoadingSpinner size={75} />
          </div>
          <AlertDialogDescription className="text-lg">{t("Please wait while we connect to the print server")}</AlertDialogDescription>
          <div className="bg-red-500 flex flex-col gap-2 rounded-lg px-4 py-2 w-full">
            <div className="flex items-center gap-2 w-full group">
              <IoMdArrowDropright
                color="white"
                size={20}
              />
              <h4 className="text-white group-hover:underline">cd server</h4>
            </div>
            <div className="flex items-center gap-2 w-full group">
              <IoMdArrowDropright
                color="white"
                size={20}
              />
              <h4 className="text-white group-hover:underline">npm run dev</h4>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <motion.div
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        exit={{opacity: 0}}
        transition={{ease: "easeInOut", duration: 0.75}}
        className="w-full h-full flex items-center justify-center"
      >
        {children}
      </motion.div>
    </>
  );
}
