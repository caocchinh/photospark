"use client";

import Image from "next/image";
import {BorderTrail} from "../ui/border-trail";
import useSound from "use-sound";
import {CLICK_SOUND_URL, CLICK_SOUND_VOUME} from "@/constants/constants";

const DoubleLayout = () => {
  const [playClick] = useSound(CLICK_SOUND_URL, {volume: CLICK_SOUND_VOUME});

  return (
    <div
      className="shadow-lg outline-none border flex items-center justify-center gap-4 relative w-max rounded-sm !bg-white"
      onMouseDown={() => playClick()}
    >
      <BorderTrail
        style={{
          boxShadow: "0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)",
        }}
        size={100}
      />
      {Array.from({length: 2}).map((_, index) => (
        <Image
          className="outline-none"
          key={index}
          src="/double.webp"
          width={200}
          height={200}
          alt="single"
        />
      ))}
    </div>
  );
};

export default DoubleLayout;
