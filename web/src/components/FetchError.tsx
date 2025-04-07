"use client";
import {Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle} from "@/components/ui/dialog";
import {IoRefresh} from "react-icons/io5";
import {MdOutlineHideImage} from "react-icons/md";
import {PiPrinter, PiVideoCameraSlash} from "react-icons/pi";
import {Button} from "./ui/button";
import {useTranslation} from "react-i18next";

const FetchError = ({type}: {type: "image" | "video" | "queue"}) => {
  const {t} = useTranslation();

  const getErrorTypeText = () => {
    if (type === "image") return t("image");
    if (type === "video") return t("video");
    return t("print order");
  };

  return (
    <Dialog defaultOpen={true}>
      <DialogContent className="flex flex-col items-center justify-center gap-4 border border-red-500 min-h-[330px]">
        <div className="flex flex-col items-center justify-center gap-4">
          <DialogTitle className="text-3xl font-semibold text-center text-red-500 uppercase">
            {t("Error loading")} {getErrorTypeText()}
          </DialogTitle>
          {type === "image" && <MdOutlineHideImage size={100} />}
          {type === "video" && <PiVideoCameraSlash size={100} />}
          {type === "queue" && <PiPrinter size={100} />}
          <DialogDescription className="text-xl text-center w-[90%]">{t("Please try again later, or contact VTEAM for support!")}</DialogDescription>
        </div>
        <div className="flex items-center justify-center w-full gap-4">
          <Button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center w-1/2 gap-2 text-white bg-red-500 cursor-pointer"
          >
            {t("Refresh the application")}
            <IoRefresh />
          </Button>
          <DialogClose asChild>
            <Button className="flex items-center justify-center w-1/2 gap-2 cursor-pointer">{t("Close")}</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FetchError;
