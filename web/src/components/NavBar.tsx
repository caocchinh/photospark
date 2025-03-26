"use client";
import Image from "next/image";
import {cn} from "@/lib/utils";
import {BorderTrail} from "./ui/border-trail";
import {usePathname} from "next/navigation";

const NavBar = () => {
  const pathname = usePathname();
  return (
    <>
      {pathname != "/" && (
        <header className={cn("bg-transparent pt-4 px-5 fixed z-50 w-max left-0 top-0")}>
          <nav className=" flex w-max justify-between">
            <div className="w-max py-2 px-1 shadow-lg rounded-md  bg-card text-card-foreground relative flex items-center justify-center flex-row gap-1">
              <BorderTrail
                style={{
                  boxShadow: "0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)",
                }}
                size={70}
              />

              <Image
                src="/logo.png"
                height={50}
                width={50}
                alt="VTEAM Logo"
              />
            </div>
          </nav>
        </header>
      )}
    </>
  );
};

export default NavBar;
