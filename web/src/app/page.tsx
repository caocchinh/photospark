"use client";
import {ImageComparisonImage, ImageComparisonSlider} from "@/components/ui/image-comparison";
import {ImageComparison} from "@/components/ui/image-comparison";
import {Spotlight} from "@/components/ui/spotlight";

export default function HomePage() {
  return (
    <div className="min-h-screen items-center justify-center flex flex-col overflow-x-hidden p-5">
      <div className="group relative rounded-lg w-[90%] sm:w-[75%] flex items-center justify-center">
        <Spotlight
          className="z-10 from-white/50 via-white/20 to-white/10 blur-2xl"
          size={248}
          springOptions={{
            stiffness: 26.7,
            damping: 4.1,
            mass: 0.2,
          }}
        />

        <ImageComparison
          className="aspect-16/10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800"
          enableHover
        >
          <ImageComparisonImage
            src="/vteam2.jpg"
            alt="Motion Primitives Dark"
            position="left"
          />
          <ImageComparisonImage
            src="/vteam.jpg"
            alt="Motion Primitives Light"
            position="right"
          />
          <ImageComparisonSlider className="bg-white" />
        </ImageComparison>
      </div>
      <div className="flex flex-col space-y-0.5 pb-0 pt-3 items-center justify-center">
        <h3 className="font-mono font-medium text-zinc-500 dark:text-zinc-400 text-3xl text-center">VTEAM - Vinschool Central Park</h3>
        <p className="text-black dark:text-white text-xl text-center">2024-2025</p>
      </div>
    </div>
  );
}
