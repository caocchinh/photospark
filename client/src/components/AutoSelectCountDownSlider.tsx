"use client";
import {Progress} from "@/components/ui/progress";
import {usePhoto} from "@/context/PhotoContext";
import {AUTO_SELECT_COUNTDOWN_DURATION} from "@/constants/constants";
const AutoSelectCountDownSlider = () => {
  const {autoSelectCountdown} = usePhoto();
  return (
    <Progress
      className={`rounded-none absolute top-0 left-0 w-full h-1 ${
        autoSelectCountdown <= 30 ? "bg-gray-200 [&>div]:bg-red-500" : "bg-gray-200 [&>div]:bg-black"
      }`}
      value={(autoSelectCountdown / AUTO_SELECT_COUNTDOWN_DURATION) * 100}
    />
  );
};

export default AutoSelectCountDownSlider;
