"use client";

import Image from "next/image";
import {BorderTrail} from "../ui/border-trail";

const DoubleLayout = () => {
  return (
    <div className="shadow-lg outline-none border flex items-center justify-center gap-4 relative w-max rounded-sm">
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
          src="/double.jpg"
          width={200}
          height={200}
          alt="single"
        />
      ))}
    </div>
  );
};

export default DoubleLayout;
