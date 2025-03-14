"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import {usePathname} from "next/navigation";
import {cn} from "@/lib/utils";
import {BorderTrail} from "./ui/border-trail";
import {ROUTES} from "@/constants/routes";
import {LuClockAlert} from "react-icons/lu";
import {usePhoto} from "@/context/PhotoContext";

const NavBar = () => {
  const path = usePathname();
  const isActive = path == ROUTES.HOME || path == ROUTES.LAYOUT || path == ROUTES.THEME;
  const hideNavBar = path === ROUTES.CAPTURE;
  const {timeLeft} = usePhoto();
  return (
    <header className={cn("bg-transparent pt-4 px-5 fixed z-50 w-max left-0 top-0", hideNavBar ? "hidden" : null)}>
      <nav className=" flex w-max justify-between">
        <div className="w-max cursor-pointer shadow-lg rounded-md  bg-card text-card-foreground relative">
          <BorderTrail
            style={{
              boxShadow: "0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)",
            }}
            size={70}
          />
          <Link
            className={cn("flex items-center justify-center p-2 px-1", !isActive ? "pointer-events-none" : null)}
            href={ROUTES.HOME}
          >
            <Image
              src="/logo.png"
              height={50}
              width={50}
              alt="VTEAM Logo"
            />
          </Link>
        </div>
        {timeLeft !== 60 && (
          <div className="flex items-center justify-center">
            <LuClockAlert className="text-red-500" />
            <p className="text-red-500">{timeLeft}</p>
          </div>
        )}
      </nav>
    </header>
  );
};

export default NavBar;
