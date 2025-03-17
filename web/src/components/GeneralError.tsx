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

const GeneralError = ({error, message}: {error: boolean; message: string}) => {
  return (
    <AlertDialog open={error}>
      <AlertDialogContent className="flex flex-col items-center justify-center gap-4 border border-red-500">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600 text-4xl font-bold">OOPS</AlertDialogTitle>
        </AlertDialogHeader>
        <MdWarning
          className="text-red-500"
          size={100}
        />
        <AlertDialogDescription className="text-2xl">{message}</AlertDialogDescription>
        <AlertDialogFooter>
          <Button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 cursor-pointer"
          >
            Refresh lại trang
            <IoRefresh />
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default GeneralError;
