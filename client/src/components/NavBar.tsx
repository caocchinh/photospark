"use client";
import Image from "next/image";
import Link from "next/link";
import React, {useEffect} from "react";
import {usePathname} from "next/navigation";
import {cn} from "@/lib/utils";
import {BorderTrail} from "./ui/border-trail";
import {ROUTES} from "@/constants/routes";
import {LuClockAlert} from "react-icons/lu";
import {AUTO_SELECT_COUNTDOWN_DURATION} from "@/constants/constants";
import {TbClockRecord} from "react-icons/tb";
import {toast} from "sonner";
import {useTranslation} from "react-i18next";
import {SlidingNumber} from "./ui/sliding-number";
import {useCountdown} from "@/context/CountdownContext";

const NavBar = () => {
  const pathname = usePathname();
  const isActive = pathname == ROUTES.HOME || pathname == ROUTES.FRAME || pathname == ROUTES.THEME;
  const hideNavBar = pathname === ROUTES.CAPTURE;
  const {autoSelectCountdownTimer} = useCountdown();
  const {t} = useTranslation();

  useEffect(() => {
    if (autoSelectCountdownTimer == 30) {
      toast.error(t("Please select a frame before the countdown ends"), {
        description: t("You have 30 seconds left to select a frame, or the frame will be selected automatically!"),
        duration: 6900,
        style: {
          backgroundColor: "#ef4444",
          color: "white",
        },
        descriptionClassName: "!text-white font-medium",
        className: "flex items-center justify-center flex-col gap-5 w-[300px]",
        actionButtonStyle: {
          backgroundColor: "white",
          color: "black",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        },
        action: {
          label: t("Close"),
          onClick: () => toast.dismiss(),
        },
      });
    }
  }, [autoSelectCountdownTimer, t]);

  return (
    <header className={cn("bg-transparent pt-4 px-5 fixed z-50 w-max left-0 top-0", hideNavBar ? "hidden" : null)}>
      <nav className="flex justify-between w-max">
        <div
          className={cn(
            "w-max  shadow-lg rounded-md  bg-card text-card-foreground relative flex items-center justify-center flex-row gap-1",
            isActive ? "px-2" : null
          )}
        >
          <BorderTrail
            style={{
              boxShadow: "0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)",
            }}
            size={70}
          />
          <Link
            className={cn("flex items-center justify-center p-2 px-1", !isActive ? "pointer-events-none" : "cursor-pointer")}
            href={ROUTES.HOME}
          >
            <Image
              src="/vteam-logo.webp"
              height={50}
              width={50}
              alt="VTEAM Logo"
            />
          </Link>
          {isActive && (
            <div className="flex items-center justify-center gap-1">
              {autoSelectCountdownTimer == AUTO_SELECT_COUNTDOWN_DURATION ? (
                <TbClockRecord
                  className="text-green-700"
                  size={24}
                />
              ) : (
                <LuClockAlert
                  className={cn(autoSelectCountdownTimer <= 30 ? "text-red-500" : "text-gray-500")}
                  size={24}
                />
              )}
              <div
                className={cn(
                  autoSelectCountdownTimer == AUTO_SELECT_COUNTDOWN_DURATION
                    ? "text-green-700"
                    : autoSelectCountdownTimer <= 30
                    ? "text-red-500"
                    : "text-gray-500",
                  "text-2xl"
                )}
              >
                <SlidingNumber
                  value={autoSelectCountdownTimer}
                  padStart={false}
                />
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
