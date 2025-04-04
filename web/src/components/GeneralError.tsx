"use client";
import {Button} from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {MdWarning} from "react-icons/md";
import {IoRefresh} from "react-icons/io5";
import {useTranslation} from "react-i18next";

const GeneralError = ({error, message, showRefreshButton = true}: {error: boolean; message: string; showRefreshButton?: boolean}) => {
  const {t} = useTranslation();

  return (
    <AlertDialog open={error}>
      <AlertDialogContent className="flex flex-col items-center justify-center gap-4 border border-red-500">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600 text-4xl font-bold">{t("An error occurred")}</AlertDialogTitle>
        </AlertDialogHeader>
        <MdWarning
          className="text-red-500"
          size={100}
        />
        <AlertDialogDescription className="text-2xl text-center">{message}</AlertDialogDescription>
        {showRefreshButton && (
          <AlertDialogFooter>
            <Button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 cursor-pointer"
            >
              {t("Refresh the application")}
              <IoRefresh />
            </Button>
          </AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default GeneralError;
