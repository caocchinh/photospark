"use client";
import {usePhoto} from "@/context/StyleContext";
import {Button} from "./ui/button";
import {Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose, DrawerTrigger} from "./ui/drawer";
import {useTranslation} from "react-i18next";
import Image from "next/image";
import {Card} from "./ui/card";
import {useState} from "react";

const SelectInstruction = ({open}: {open: boolean}) => {
  const {photo} = usePhoto();
  const {t} = useTranslation();
  const [isOpened, setIsOpened] = useState(false);
  return (
    <>
      {photo && (
        <Drawer
          open={open ? false : isOpened}
          onOpenChange={setIsOpened}
        >
          <DrawerTrigger asChild>
            <Button className="w-full min-w-[200px] z-10 absolute bottom-[-14px] left-0">{t("Instruction")}</Button>
          </DrawerTrigger>
          <DrawerContent className="min-w-screen">
            <div className="mx-auto w-full min-h-[50vh]">
              <DrawerHeader>
                <DrawerTitle className="text-center text-4xl font-bold">{t("Instruction")}</DrawerTitle>
              </DrawerHeader>
              <div className="p-4 pb-0 flex flex-row items-center justify-center gap-16 min-w-screen">
                <Card className="flex flex-col items-center justify-center space-y-2 px-8 py-6">
                  <div className="flex items-center flex-col justify-center space-y-2">
                    <Image
                      className="min-w-[300px]"
                      src="/chosen.jpg"
                      alt="instruction"
                      width={300}
                      height={221}
                    />
                    <Image
                      className="min-w-[300px]"
                      src="/unselected.jpg"
                      alt="instruction"
                      width={300}
                      height={221}
                    />
                  </div>
                  <h3 className="text-lg text-center font-bold">{t("Click on image to unselect")}</h3>
                </Card>
                <Card className="flex items-center flex-col justify-center space-x-2 gap-2 px-8 py-6">
                  <Image
                    className="min-w-[300px]"
                    src="/switch.jpg"
                    alt="instruction"
                    width={300}
                    height={442}
                  />
                  <h3 className="text-lg text-center font-bold">{t("Drag to switch images position")}</h3>
                </Card>
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button
                    variant="destructive"
                    className="mt-4"
                  >
                    {t("Close")}
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
};

export default SelectInstruction;
