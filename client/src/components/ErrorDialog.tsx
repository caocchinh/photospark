import {t} from "i18next";
import {Dialog, DialogDescription, DialogTitle, DialogContent, DialogHeader} from "./ui/dialog";
import {MdWarning} from "react-icons/md";

const ErrorDialog = () => {
  return (
    <Dialog defaultOpen>
      <DialogContent className="flex flex-col items-center justify-center gap-4 border border-red-500">
        <DialogHeader>
          <DialogTitle className="text-red-600 text-4xl font-bold uppercase">{t("An error occurred")}</DialogTitle>
        </DialogHeader>
        <MdWarning
          className="text-red-500"
          size={100}
        />
        <DialogDescription className="text-2xl">{t("Please try again")}</DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default ErrorDialog;
