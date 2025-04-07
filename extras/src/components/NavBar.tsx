"use client";
import Image from "next/image";
import Link from "next/link";
import {cn} from "@/lib/utils";
import {BorderTrail} from "./ui/border-trail";

const NavBar = () => {
  return (
    <header className={cn("bg-transparent pt-4 px-5 fixed z-50 w-max left-0 top-0")}>
      <nav className=" flex w-max justify-between">
        <div className="w-max  shadow-lg rounded-md  bg-card text-card-foreground relative flex items-center justify-center flex-row gap-1">
          <BorderTrail
            style={{
              boxShadow: "0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)",
            }}
            size={70}
          />
          <Link
            className="flex items-center justify-center p-2 px-1"
            href="/"
          >
            <Image
              src="/vteam-logo.webp"
              height={50}
              width={50}
              alt="VTEAM Logo"
            />
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
