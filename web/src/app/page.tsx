"use client";

import {useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot} from "@/components/ui/input-otp";
import {TextShimmer} from "@/components/ui/text-shimmer";
import {BorderTrail} from "@/components/ui/border-trail";
import {cn, isValidUUID} from "@/lib/utils";
import {FaArrowUp, FaArrowRight} from "react-icons/fa6";

export default function Home() {
  const [imageId, setImageId] = useState("");
  const [validUUID, setValidUUID] = useState(false);
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && imageId.trim().length === 32 && validUUID) {
      const link = document.getElementById("imageLink");
      if (link) {
        (link as HTMLAnchorElement).click();
      }
    }
  };

  const handleChange = (value: string) => {
    const cleanValue = value.match(/[a-zA-Z0-9]/g)?.join("") || "";
    if (isValidUUID(cleanValue.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5"))) {
      setValidUUID(true);
    } else {
      setValidUUID(false);
    }
    setImageId(cleanValue);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const cleanValue = pastedText.match(/[a-zA-Z0-9]/g)?.join("") || "";

    if (isValidUUID(formatUUID(cleanValue))) {
      setValidUUID(true);
    } else {
      setValidUUID(false);
    }
    setImageId(cleanValue);
  };

  const formatUUID = (uuid: string): string => {
    return uuid.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-900">
      <main className="flex flex-col items-center justify-center w-full">
        <Image
          src="/logo.png"
          alt="VTEAM Logo"
          width={150}
          height={150}
        />
        <TextShimmer
          className=" font-bold text-4xl mb-4 uppercase text-center whitespace-nowrap  [--base-color:black] [--base-gradient-color:gray]"
          duration={7}
          spread={4}
        >
          VTEAM Photobooth
        </TextShimmer>

        <div className="space-y-4 w-full">
          <div className="flex flex-col items-center gap-5">
            <InputOTP
              maxLength={32}
              value={imageId}
              onChange={handleChange}
              onKeyDown={handleKeyPress}
              onPaste={handlePaste}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
                <InputOTPSlot index={6} />
                <InputOTPSlot index={7} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={8} />
                <InputOTPSlot index={9} />
                <InputOTPSlot index={10} />
                <InputOTPSlot index={11} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={12} />
                <InputOTPSlot index={13} />
                <InputOTPSlot index={14} />
                <InputOTPSlot index={15} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={16} />
                <InputOTPSlot index={17} />
                <InputOTPSlot index={18} />
                <InputOTPSlot index={19} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={20} />
                <InputOTPSlot index={21} />
                <InputOTPSlot index={22} />
                <InputOTPSlot index={23} />
                <InputOTPSlot index={24} />
                <InputOTPSlot index={25} />
                <InputOTPSlot index={26} />
                <InputOTPSlot index={27} />
                <InputOTPSlot index={28} />
                <InputOTPSlot index={29} />
                <InputOTPSlot index={30} />
                <InputOTPSlot index={31} />
              </InputOTPGroup>
            </InputOTP>
            {!validUUID && imageId.trim().length === 32 && <p className="text-red-500 text-sm">Vui lòng nhập ID hình hợp lệ</p>}
            <div
              className={cn(
                imageId.trim().length === 32 && validUUID
                  ? "bg-black dark:bg-white text-white dark:text-black cursor-pointer"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 pointer-events-none",
                "relative w-[300px] p-2 rounded flex items-center justify-center"
              )}
            >
              <BorderTrail
                style={{
                  boxShadow: "0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)",
                }}
                size={100}
              />
              <Link
                id="imageLink"
                href={imageId.trim() ? `/${formatUUID(imageId.trim())}` : "#"}
                className="w-full transition-colors text-center flex items-center justify-center gap-1"
              >
                {imageId.trim().length === 32 ? "Tìm hình" : "Nhập ID hình"}
                {imageId.trim().length === 32 ? <FaArrowRight /> : <FaArrowUp />}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
