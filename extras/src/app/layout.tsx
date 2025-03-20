import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import Image from "next/image";
import {TextShimmer} from "@/components/ui/text-shimmer";
import NavBar from "@/components/NavBar";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Print Management",
  description: "Photobooth print management",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="shortcut icon"
          href="/favicon.ico"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <NavBar />
        <footer className="w-full h-max fixed bottom-0 flex items-center justify-center bg-black overflow-hidden">
          <TextShimmer
            className="w-max relative  [--base-color:#f97316] [--base-gradient-color:#fdba74] text-center text-md p-2 gap-3"
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
