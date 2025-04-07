"use client";

import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import Image from "next/image";
import {SocketProvider} from "@/context/SocketContext";
import {I18nextProvider, useTranslation} from "react-i18next";
import i18n from "@/lib/i18n";
import PageTransitionEffect from "@/components/PageTransitionEffect";
import CollabTransitionOverlay from "@/components/CollabTransitionOverlay";
import {TextShimmer} from "@/components/ui/text-shimmer";
import localFont from "next/font/local";
import {Sparkles} from "@/components/Sparkle";
import {usePathname} from "next/navigation";
import {ROUTES} from "@/constants/routes";
import {Toaster} from "sonner";
import CameraLabel from "@/components/CameraLabel";
import AutoSelectCountDownSlider from "@/components/AutoSelectCountDownSlider";
import {CountdownProvider} from "@/context/CountdownContext";
import {PhotoStateProvider} from "@/context/PhotoStateContext";
import {CameraProvider} from "@/context/CameraContext";

const Buffalo = localFont({
  src: "./fonts/BuffaloDemoVersionRegular-axZ1R.ttf",
  variable: "--font-buffalo",
  weight: "100 900",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {t} = useTranslation();
  const pathName = usePathname();

  return (
    <SocketProvider>
      <PhotoStateProvider>
        <CountdownProvider>
          <CameraProvider>
            <I18nextProvider i18n={i18n}>
              <html lang="en">
                <head>
                  <link
                    rel="shortcut icon"
                    href="/favicon.ico"
                  />
                </head>
                <body
                  className={`${geistSans.variable} ${geistMono.variable} ${Buffalo.variable} font-sans antialiased 

                bg-white 
                bg-no-repeat bg-cover min-h-screen flex items-center justify-center flex-col w-full`}
                >
                  {pathName == ROUTES.HOME && <CameraLabel />}
                  {(pathName === ROUTES.HOME || pathName === ROUTES.THEME || pathName === ROUTES.FRAME) && <AutoSelectCountDownSlider />}

                  <CollabTransitionOverlay />
                  <PageTransitionEffect>
                    <title>VTEAM Photobooth</title>

                    {children}
                  </PageTransitionEffect>
                  <Toaster />

                  <footer className="w-full h-max fixed bottom-0 flex items-center justify-center bg-black overflow-hidden">
                    {pathName != ROUTES.CAPTURE && (
                      <div className="absolute top-1/2 z-[-1] -translate-y-1/2 h-[400px] w-screen overflow-hidden [mask-image:radial-gradient(100%_50%,white,transparent)] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_bottom_center,#3273ff,transparent_70%)] before:opacity-20 after:absolute">
                        <Sparkles
                          density={300}
                          speed={1.2}
                          color="#48b6ff"
                          direction="top"
                          mousemove={false}
                          className="absolute inset-x-0 bottom-0 h-full w-full "
                        />
                      </div>
                    )}

                    <TextShimmer
                      className="w-max relative  [--base-color:#f97316] [--base-gradient-color:#fdba74] text-center text-md p-2 gap-3"
                      duration={6}
                    >
                      {t("This application is developed and sponsored by VECTR")}
                    </TextShimmer>
                    <Image
                      width={25}
                      height={25}
                      src="/vectr.webp"
                      alt="Vectr logo"
                    />
                  </footer>
                </body>
              </html>
            </I18nextProvider>
          </CameraProvider>
        </CountdownProvider>
      </PhotoStateProvider>
    </SocketProvider>
  );
}
