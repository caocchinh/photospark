"use client";
import {Spotlight} from "@/components/ui/spotlight";
import {Tilt} from "@/components/ui/tilt";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen items-center justify-center flex flex-col overflow-x-hidden p-5">
      <Tilt
        rotationFactor={6}
        isRevese
        style={{
          transformOrigin: "center center",
        }}
        springOptions={{
          stiffness: 26.7,
          damping: 4.1,
          mass: 0.2,
        }}
        className="group relative rounded-lg w-[90%] sm:w-[75%] flex items-center justify-center"
      >
        <Spotlight
          className="z-10 from-white/50 via-white/20 to-white/10 blur-2xl"
          size={248}
          springOptions={{
            stiffness: 26.7,
            damping: 4.1,
            mass: 0.2,
          }}
        />
        <Image
          src="/vteam.jpg"
          height={400}
          width={800}
          alt="VTEAM"
          className="w-full rounded-lg object-cover grayscale-25 duration-700 group-hover:grayscale-0"
        />
      </Tilt>
      <div className="flex flex-col space-y-0.5 pb-0 pt-3 items-center justify-center">
        <h3 className="font-mono font-medium text-zinc-500 dark:text-zinc-400 text-3xl text-center">VTEAM - Vinschool Central Park</h3>
        <p className="text-black dark:text-white text-xl text-center">2024-2025</p>
      </div>
    </div>
  );
}
