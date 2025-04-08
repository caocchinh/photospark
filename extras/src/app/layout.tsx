import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import Image from "next/image";
import {TextShimmer} from "@/components/ui/text-shimmer";
import NavBar from "@/components/NavBar";
import {SocketProvider} from "@/context/SocketContext";
import {Sparkles} from "@/components/Sparkle";
import {Toaster} from "@/components/ui/sonner";

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
    <SocketProvider>
      <html lang="en">
        <head>
          <link
            rel="shortcut icon"
            href="/favicon.ico"
          />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <Toaster />
          {children}
          <NavBar />
          <footer className="fixed bottom-0 flex items-center justify-center w-full overflow-hidden bg-black h-max">
            <div className="absolute top-1/2 z-[-1] -translate-y-1/2 h-full w-screen overflow-hidden ">
              <Sparkles
                density={30}
                speed={1.2}
                color="#f97316"
                direction="top"
                mousemove={false}
                className="absolute inset-x-0 bottom-0 w-full h-full "
              />
            </div>
            <TextShimmer
              className="w-max relative  [--base-color:#f97316] [--base-gradient-color:#fdba74] text-center text-md p-2 gap-3"
              duration={6}
            >
              Ứng dụng được phát triển và tài trợ bởi VECTR
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
    </SocketProvider>
  );
}
