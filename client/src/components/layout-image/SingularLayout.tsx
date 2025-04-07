"use client";

import useSound from "use-sound";
import {BorderTrail} from "../ui/border-trail";
import Image from "next/image";
import {CLICK_SOUND_URL, CLICK_SOUND_VOUME} from "@/constants/constants";

const SingularLayout = () => {
  const [playClick] = useSound(CLICK_SOUND_URL, {volume: CLICK_SOUND_VOUME});
  return (
    <div
      className="shadow-lg border w-max relative rounded-sm"
      onMouseDown={() => playClick()}
    >
      <BorderTrail
        style={{
          boxShadow: "0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)",
        }}
        size={100}
      />
      <Image
        src="/single.webp"
        width={400}
        height={700}
        alt="single"
      />
    </div>
  );
};

export default SingularLayout;
