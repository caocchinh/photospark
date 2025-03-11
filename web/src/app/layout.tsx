import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import {TextShimmer} from "@/components/text-shimmer";
import Image from "next/image";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VTEAM PhotoBooth",
  description: "VTEAM PhotoBooth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <head>
          <link
            rel="shortcut icon"
            href="/favicon.ico"
          />
        </head>
        <NextTopLoader
          color="black"
          zIndex={100000}
          showSpinner={true}
        />
        {children}
        <footer className="w-full bottom-0 flex items-center justify-center bg-black flex-col sm:flex-row pb-4 sm:pb-1">
          <TextShimmer
            className="w-max [--base-color:#f97316] [--base-gradient-color:#fdba74] text-center text-md p-2 gap-3"
            duration={6}
          >
            Ứng dụng được phát triển và tài trợ bởi VECTR
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
  );
}
