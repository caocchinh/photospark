"use client";
import {Progress} from "@/components/ui/progress";
import {AUTO_SELECT_COUNTDOWN_DURATION} from "@/constants/constants";
import {useCountdown} from "@/context/CountdownContext";

const AutoSelectCountDownSlider = () => {
  const {autoSelectCountdownTimer} = useCountdown();
  return (
    <Progress
      className={`rounded-none absolute top-0 left-0 w-full h-1 ${
        autoSelectCountdownTimer <= 30 ? "bg-gray-200 [&>div]:bg-red-500" : "bg-gray-200 [&>div]:bg-black"
      }`}
      value={(autoSelectCountdownTimer / AUTO_SELECT_COUNTDOWN_DURATION) * 100}
    />
  );
};

export default AutoSelectCountDownSlider;
