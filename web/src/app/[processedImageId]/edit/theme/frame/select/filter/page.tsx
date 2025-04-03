"use client";

import {useMediaQuery} from "@/hooks/useMediaQuery";
import {useReloadConfirm} from "@/hooks/useReloadConfirm";
import dynamic from "next/dynamic";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator} from "@/components/ui/breadcrumb";
import {usePhoto} from "@/context/PhotoContext";
import {useTranslation} from "react-i18next";
import Link from "next/link";
import {ROUTES} from "@/constants/routes";
import {useEffect} from "react";

const LoadingIndicator = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="loader2"></div>
  </div>
);

const DesktopContentModule = import("./DesktopContent");
const MobileContentModule = import("./MobileContent");

const DesktopContent = dynamic(() => DesktopContentModule, {
  ssr: false,
  loading: () => <LoadingIndicator />,
});

const MobileContent = dynamic(() => MobileContentModule, {
  ssr: false,
  loading: () => <LoadingIndicator />,
});

const FilterEditPage = () => {
  useReloadConfirm();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const {photo} = usePhoto();
  const {t} = useTranslation();

  useEffect(() => {
    if (!photo?.frameType || !photo?.theme || photo.selectedImages.length == 0) {
      window.location.href = `/${photo?.previousProcessedImageId}${ROUTES.HOME}`;
      return;
    }
  }, [photo]);

  return (
    <div className="w-full h-full p-4">
      <Breadcrumb className="-mt-[60px] mb-[40px]  flex items-center justify-end sm:w-[95%] w-[90%]">
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link href={`/${photo?.previousProcessedImageId}/`}>{t("Home")}</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 cursor-pointer">
                <BreadcrumbEllipsis className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem className="cursor-pointer active:bg-slate-200 hover:bg-slate-200">
                  <Link
                    href={`/${photo?.previousProcessedImageId}/edit/`}
                    className="w-full"
                  >
                    {t("Layout")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer active:bg-slate-200 hover:bg-slate-200">
                  <Link
                    href={`/${photo?.previousProcessedImageId}/edit/theme/`}
                    className="w-full"
                  >
                    {t("Theme")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer active:bg-slate-200 hover:bg-slate-200">
                  <Link
                    href={`/${photo?.previousProcessedImageId}/edit/theme/frame/`}
                    className="w-full"
                  >
                    {t("Frame")}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link href={`/${photo?.previousProcessedImageId}/edit/theme/frame/select`}>{t("Select")}</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <p className="text-black cursor-pointer">{t("Filter")}</p>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {isDesktop ? <DesktopContent /> : <MobileContent />}
    </div>
  );
};

export default FilterEditPage;
