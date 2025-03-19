"use client";

import {AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle} from "@/components/ui/alert-dialog";
import {useTranslation} from "react-i18next";
import {MdWifiOff} from "react-icons/md";
import {IoRefresh} from "react-icons/io5";
import {Button} from "@/components/ui/button";
import {usePhoto} from "@/context/PhotoContext";

const NetworkStatus = () => {
  const {t} = useTranslation();
  const {isOnline} = usePhoto();

  return (
    <AlertDialog open={!isOnline}>
      <AlertDialogContent className="flex flex-col items-center justify-center gap-4 border border-red-500">
        <AlertDialogTitle className="text-red-600 text-4xl font-bold flex gap-2 items-center justify-center flex-col uppercase text-center">
          {t("No Internet Connection")}
          <MdWifiOff size={100} />
        </AlertDialogTitle>
        <AlertDialogDescription className="text-2xl text-center">{t("Please check your internet connection and try again")}!</AlertDialogDescription>
        <AlertDialogFooter className="w-full">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 cursor-pointer w-full"
          >
            {t("Refresh the application")}
            <IoRefresh />
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NetworkStatus;
