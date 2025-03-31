import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import Footer from "@/components/Footer";
import I18nClientProvider from "@/context/I18nClientProvider";
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
  title: "VTEAM PhotoBooth",
  description: "VTEAM PhotoBooth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <I18nClientProvider>
      <html lang="en">
        <head>
          <link
            rel="shortcut icon"
            href="/favicon.ico"
          />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <NextTopLoader
            color="black"
            zIndex={100000}
            showSpinner={true}
          />
          {children}
          <Toaster />
          <Footer />
        </body>
      </html>
    </I18nClientProvider>
  );
}
