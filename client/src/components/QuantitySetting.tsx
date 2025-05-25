import { CLICK_SOUND_VOUME, CLICK_SOUND_URL } from "@/constants/constants";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { BsBox } from "react-icons/bs";
import useSound from "use-sound";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useCountdown } from "@/context/CountdownContext";
import { usePhotoState } from "@/context/PhotoStateContext";
import { IoMdCheckmark } from "react-icons/io";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

const QuantitySetting = () => {
  const [playClick] = useSound(CLICK_SOUND_URL, { volume: CLICK_SOUND_VOUME });
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { autoSelectCountdownTimer, setShouldRunCountdown } = useCountdown();
  const { quantityType, setQuantityType } = usePhotoState();
  const { photo } = usePhotoState();

  useEffect(() => {
    if (setShouldRunCountdown) {
      if (isOpen) {
        console.log("Count down stopped");
        setShouldRunCountdown(false);
      } else {
        if (photo) {
          setShouldRunCountdown(true);
        }
      }
    }
  }, [isOpen, setShouldRunCountdown, photo]);

  return (
    <AlertDialog
      open={isOpen && autoSelectCountdownTimer > 1}
      onOpenChange={setIsOpen}
    >
      <AlertDialogTrigger asChild>
        <Button
          onMouseDown={() => playClick()}
          className="flex items-center justify-center gap-1 w-full"
          disabled={autoSelectCountdownTimer <= 1}
        >
          <p> {t("Quantity settings")}</p>
          <BsBox />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-semibold text-center">
            {t("Quantity settings")}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="flex items-center justify-center gap-2">
          <Switch
            checked={quantityType === "auto"}
            id="quantity-auto"
            onCheckedChange={() => {
              setQuantityType(quantityType === "auto" ? "manual" : "auto");
              localStorage.setItem(
                "quantityType",
                quantityType === "manual" ? "auto" : "manual"
              );
            }}
          />
          <Label htmlFor="quantity-auto" className="text-xl">
            {t("Auto")}
          </Label>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Switch
            checked={quantityType === "manual"}
            id="quantity-manual"
            onCheckedChange={() => {
              setQuantityType(quantityType === "manual" ? "auto" : "manual");
              localStorage.setItem(
                "quantityType",
                quantityType === "manual" ? "auto" : "manual"
              );
            }}
          />
          <Label htmlFor="quantity-manual" className="text-xl">
            {t("Manual")}
          </Label>
        </div>

        <AlertDialogFooter className="w-full">
          <AlertDialogAction
            onMouseDown={() => playClick()}
            className="bg-green-700 hover:bg-green-800 w-full"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            {t("Save")} <IoMdCheckmark color="white" />
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default QuantitySetting;
