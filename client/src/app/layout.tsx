"use client";

import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {PhotoProvider} from "@/context/StyleContext";
import Image from "next/image";
import {SocketProvider} from "@/context/SocketContext";
import {I18nextProvider, useTranslation} from "react-i18next";
import i18n from "@/lib/i18n";
import PageTransitionEffect from "@/components/PageTransitionEffect";
import {Card} from "@/components/ui/card";
import {usePathname} from "next/navigation";
import {cn} from "@/lib/utils";
import CollabTransitionOverlay from "@/components/CollabTransitionOverlay";
import {TextShimmer} from "@/components/ui/text-shimmer";
import localFont from "next/font/local";

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
  const pathname = usePathname();

  return (
    <SocketProvider>
      <PhotoProvider>
        <I18nextProvider i18n={i18n}>
          <html lang="en">
            <body
              className={`${geistSans.variable} ${geistMono.variable} ${Buffalo.variable} font-sans antialiased bg-[url(/background.webp)] bg-no-repeat bg-cover min-h-screen flex items-center justify-center flex-col w-full`}
            >
              <title>VTEAM Photobooth</title>

              <CollabTransitionOverlay />
              <Card
                className={cn(
                  "bg-background w-[85%] h-[90vh] mb-8 flex items-center p-8 flex-col gap-9",
                  pathname === "/" ? "justify-start" : "justify-center",
                  pathname === "/layout/capture" ? "w-[95%] h-[92vh] " : "w-[85%] h-[90vh] "
                )}
              >
                <PageTransitionEffect>{children}</PageTransitionEffect>
              </Card>
              <footer className="w-full fixed bottom-0 flex items-center justify-center bg-black">
                <TextShimmer
                  className="w-max [--base-color:#f97316] [--base-gradient-color:#fdba74] text-center text-md p-2 gap-3"
                  duration={6}
                >
                  {t("This application is developed and sponsored by VECTR")}
                </TextShimmer>
                <Image
                  width={25}
                  height={25}
                  src="/vectr.png"
                  alt="Vectr logo"
                />
              </footer>
            </body>
          </html>
        </I18nextProvider>
      </PhotoProvider>
    </SocketProvider>
  );
}
