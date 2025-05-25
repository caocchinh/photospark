"use client";
import {
  ImageComparisonImage,
  ImageComparisonSlider,
} from "@/components/ui/image-comparison";
import { ImageComparison } from "@/components/ui/image-comparison";
import { SpinningText } from "@/components/ui/spinning-text";
import { Spotlight } from "@/components/ui/spotlight";
import Image from "next/image";
import { FaFacebookF } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogTitle,
  MorphingDialogImage,
  MorphingDialogSubtitle,
  MorphingDialogClose,
  MorphingDialogDescription,
  MorphingDialogContainer,
} from "@/components/ui/morphing-dialog";
import { SiMinutemailer } from "react-icons/si";
import { SiGithub } from "react-icons/si";
import { TfiEmail } from "react-icons/tfi";
import LanguageBar from "@/components/LanguageBar";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import NavBar from "@/components/NavBar";
import { TextShimmer } from "@/components/ui/text-shimmer";
import Link from "next/link";
import { GlowEffect } from "@/components/ui/glow-effect";

export default function HomePage() {
  const { t } = useTranslation();
  const [isHover, setIsHover] = useState(false);

  return (
    <>
      <NavBar />
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-5 overflow-x-hidden">
        <div className="w-[95%] flex items-center justify-end">
          <LanguageBar />
        </div>
        <div className="flex flex-col items-center justify-center w-full h-full">
          <TextShimmer
            className=" font-semibold text-5xl uppercase text-center [--base-color:black] [--base-gradient-color:gray]"
            duration={7}
            spread={10}
          >
            VTEAM PHOTOBOOTH
          </TextShimmer>

          <div className="flex flex-col items-center justify-center w-full gap-4 p-5 overflow-x-hidden lg:flex-row">
            <div className="group relative rounded-lg w-[90%] md:w-[80%]  flex items-center justify-center">
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
                className="w-full border rounded-lg aspect-16/10 border-zinc-200 dark:border-zinc-800"
                enableHover
              >
                <ImageComparisonImage
                  src="/vteam2.webp"
                  alt="Motion Primitives Dark"
                  position="left"
                />
                <ImageComparisonImage
                  src="/vteam.webp"
                  alt="Motion Primitives Light"
                  position="right"
                />
                <ImageComparisonSlider className="bg-white" />
              </ImageComparison>
            </div>
            <div className="flex flex-col space-y-0.5 pb-0 pt-3 items-center justify-center">
              <div className="relative flex items-center justify-center my-12 ">
                <SpinningText
                  radius={7}
                  fontSize={1.2}
                  className="absolute font-light leading-none -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
                >
                  {`one team • one dream • `}
                </SpinningText>
                <Image
                  src="/vteam-logo.webp"
                  alt="VTEAM Logo"
                  width={100}
                  height={100}
                />
              </div>
              <h3 className="font-mono text-3xl font-medium text-center text-zinc-500 dark:text-zinc-400">
                VTEAM - Vinschool Central Park
              </h3>
              <p className="text-xl text-center text-black dark:text-white">
                2024-2025
              </p>
              <div className="flex flex-col gap-3 w-[90%] sm:w-[300px] mt-4">
                <a
                  href="https://www.facebook.com/vteam.vcp"
                  target="_blank"
                  title="VTEAM Facebook"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center bg-[#0866ff] rounded-sm px-4 py-2 gap-2 w-full mx-auto"
                >
                  <FaFacebookF size={20} color="white" />
                  <p className="text-white">Facebook</p>
                </a>

                <a
                  href="https://www.instagram.com/vteam.vcp"
                  target="_blank"
                  title="VTEAM Instagram"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center bg-[#dd2a7b] rounded-sm px-4 py-2 gap-2 w-full mx-auto"
                >
                  <FaInstagram size={20} color="white" />
                  <p className="text-white">Instagram</p>
                </a>
                <div className="relative">
                  <GlowEffect
                    colors={["#0894FF", "#C959DD", "#FF2E54", "#FF9004"]}
                    mode="static"
                    blur="medium"
                    className="z-[0]"
                  />
                  <Link
                    href="/fb1e1c95-364a-4254-b477-0f8bd6bf4394"
                    title="Photobooth demo"
                    className="relative z-10 flex items-center justify-center w-full gap-2 px-4 py-2 mx-auto text-white bg-black rounded-sm"
                  >
                    {t("Demo")}
                    <FaArrowRight size={15} color="white" />
                  </Link>
                </div>

                <MorphingDialog
                  transition={{
                    type: "spring",
                    bounce: 0.05,
                    duration: 0.25,
                  }}
                >
                  <MorphingDialogTrigger
                    style={{
                      borderRadius: "12px",
                    }}
                    className="flex flex-col max-w-full overflow-hidden bg-white border border-zinc-950/10 dark:border-zinc-50/10 dark:bg-zinc-900"
                  >
                    <div
                      className="relative overflow-hidden h-max"
                      onMouseEnter={() => setIsHover(true)}
                      onMouseLeave={() => setIsHover(false)}
                    >
                      <MorphingDialogImage
                        src="/cute.webp"
                        alt="Cao Cự Chính is the developer of this website. All rights reserved."
                        className="object-cover w-full h-48"
                      />
                      <ProgressiveBlur
                        className="pointer-events-none absolute bottom-0 left-0 h-[50%] w-full"
                        blurIntensity={0.5}
                        animate={isHover ? "visible" : "hidden"}
                        variants={{
                          hidden: { opacity: 0 },
                          visible: { opacity: 1 },
                        }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      />
                    </div>

                    <div className="flex flex-col items-center justify-center px-3 py-2 grow">
                      <MorphingDialogTitle className="flex flex-wrap items-center justify-center gap-1 text-center text-zinc-950 dark:text-zinc-50">
                        {t("Developer Information")}{" "}
                        <SiMinutemailer size={17} />
                      </MorphingDialogTitle>
                      <MorphingDialogSubtitle className="text-zinc-700 dark:text-zinc-400">
                        Mr. Cao Cự Chính
                      </MorphingDialogSubtitle>
                    </div>
                  </MorphingDialogTrigger>
                  <MorphingDialogContainer>
                    <MorphingDialogContent
                      style={{
                        borderRadius: "24px",
                      }}
                      className="pointer-events-auto relative flex h-auto w-[90%] flex-col overflow-hidden border border-zinc-950/10 bg-white dark:border-zinc-50/10 dark:bg-zinc-900 sm:w-[500px]"
                    >
                      <MorphingDialogImage
                        src="/cute.webp"
                        alt="Cao Cự Chính is the developer of this website. All rights reserved."
                        className="w-full h-full"
                      />
                      <div className="p-6">
                        <div className="flex flex-col items-center justify-center px-3 py-2 grow">
                          <MorphingDialogTitle className="flex flex-wrap items-center justify-center gap-1 text-2xl text-center text-zinc-950 dark:text-zinc-50">
                            {t("Developer Information")}{" "}
                            <SiMinutemailer size={20} />
                          </MorphingDialogTitle>
                          <MorphingDialogSubtitle className="text-lg text-zinc-700 dark:text-zinc-400">
                            Mr. Cao Cự Chính
                          </MorphingDialogSubtitle>
                        </div>
                        <MorphingDialogDescription
                          className="flex flex-col items-center justify-center gap-3 "
                          disableLayoutAnimation
                          variants={{
                            initial: { opacity: 0, scale: 0.8, y: 100 },
                            animate: { opacity: 1, scale: 1, y: 0 },
                            exit: { opacity: 0, scale: 0.8, y: 100 },
                          }}
                        >
                          <a
                            href="https://github.com/caocchinh"
                            target="_blank"
                            title="Chinh Cao Github"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-full gap-2 px-4 py-2 mx-auto text-white bg-black rounded-sm"
                          >
                            <SiGithub size={20} color="white" />
                            <p className="text-white">Github</p>
                          </a>
                          <a
                            href="https://www.facebook.com/cao.cchinh"
                            target="_blank"
                            title="Chinh Cao Facebook"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center bg-[#0866ff] rounded-sm px-4 py-2 gap-2 w-full mx-auto"
                          >
                            <FaFacebookF size={20} color="white" />
                            <p className="text-white">Facebook</p>
                          </a>

                          <a
                            href="https://www.instagram.com/cao.cchinh/"
                            target="_blank"
                            title="Chinh Cao Instagram"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center bg-[#dd2a7b] rounded-sm px-4 py-2 gap-2 w-full mx-auto"
                          >
                            <FaInstagram size={20} color="white" />
                            <p className="text-white">Instagram</p>
                          </a>

                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                "chinhcaocu@gmail.com"
                              );
                              const btn =
                                document.getElementById("copyEmailBtn");
                              if (btn) {
                                const originalText = btn.textContent;
                                btn.textContent = t("Copied!");
                                setTimeout(() => {
                                  btn.textContent = originalText;
                                }, 2000);
                              }
                            }}
                            className="flex items-center justify-center w-full gap-2 px-4 py-2 mx-auto bg-orange-400 rounded-sm cursor-pointer"
                          >
                            <TfiEmail size={20} color="white" />
                            <p className="text-white" id="copyEmailBtn">
                              {t("Copy Email Address")}
                            </p>
                          </button>
                        </MorphingDialogDescription>
                      </div>
                      <MorphingDialogClose className="text-zinc-50" />
                    </MorphingDialogContent>
                  </MorphingDialogContainer>
                </MorphingDialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
