"use client";
import FrameStage from "@/components/FrameStage";
import {ProcessedImageTable, ImageTable} from "@/drizzle/schema";
import {useRef, useState} from "react";
import {Stage as StageElement} from "konva/lib/Stage";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {FaArrowLeft, FaArrowRight} from "react-icons/fa6";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import Link from "next/link";
import {MAX_PRINT_QUANTITY, PRINT_PRICING} from "@/constants/constants";
import Image from "next/image";
import {Slider} from "@/components/ui/slider";
import {SlidingNumber} from "@/components/ui/sliding-number";
import {createQueue} from "@/server/actions";
import GeneralError from "@/components/GeneralError";

const Print = ({
  processedImage,
  images,
}: {
  processedImage?: typeof ProcessedImageTable.$inferSelect;
  images?: Array<typeof ImageTable.$inferSelect>;
}) => {
  const stageRef = useRef<StageElement | null>(null);
  const [activeTab, setActiveTab] = useState<"price" | "order">("price");
  const [printQuantity, setPrintQuantity] = useState(processedImage?.type === "double" ? 2 : 1);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dummyLinkRef = useRef<HTMLAnchorElement>(null);
  const [uuid, setUuid] = useState<string | null>(null);

  const calculatePrice = (quantity: number) => {
    const priceTier = PRINT_PRICING.find((item) => {
      if (typeof item.quantity === "number") {
        return quantity <= item.quantity;
      } else if (typeof item.quantity === "string" && item.quantity.endsWith("+")) {
        const minQuantity = parseInt(item.quantity);
        return quantity >= minQuantity;
      }
      return false;
    });
    if (!priceTier) {
      throw new Error("Price tier not found");
    }

    const price = priceTier.price;

    if (typeof priceTier.quantity === "string" && priceTier.quantity.endsWith("+")) {
      return price * quantity;
    }

    return price;
  };

  const handleTabChange = (tab: "price" | "order") => {
    setActiveTab(tab);
  };

  const handleCreateQueue = async () => {
    if (!processedImage) return;

    setIsLoading(true);

    try {
      const normalizedQuantity = processedImage.type === "double" ? printQuantity / 2 : printQuantity;
      const queuId = crypto.randomUUID();
      setUuid(queuId);
      const result = await createQueue(processedImage.id, queuId, normalizedQuantity, calculatePrice(normalizedQuantity));

      if (!result.error) {
        if (dummyLinkRef.current) {
          dummyLinkRef.current.click();
        }
      } else {
        setError(true);
        setIsLoading(false);
      }
    } catch {
      setError(true);
      setIsLoading(false);
    }
  };

  if (!processedImage) {
    return null;
  }

  return (
    <>
      <Link
        ref={dummyLinkRef}
        style={{display: "none"}}
        href={`/${processedImage.id}/print/${uuid}`}
      />

      <div className="w-full h-full flex items-center justify-center gap-10 flex-wrap m-8 mt-20">
        <div className="flex flex-col items-center justify-center gap-5 w-[90%] md:w-[50%] lg:w-[40%] h-full">
          <Tabs
            defaultValue="price"
            className="w-full"
            value={activeTab}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="price"
                className="cursor-pointer"
                onClick={() => handleTabChange("price")}
              >
                Bảng giá
              </TabsTrigger>
              <TabsTrigger
                value="order"
                className="cursor-pointer"
                onClick={() => handleTabChange("order")}
              >
                Đặt in
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="price"
              className="h-full"
            >
              <Card className="h-full w-full flex flex-col items-stretch justify-center">
                <CardHeader className="w-full">
                  <CardTitle>Giá</CardTitle>
                  <CardDescription>Nếu bạn có nhu cầu in thêm ảnh, hãy xem bảng giá dưới đây.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 w-full">
                  <Table>
                    <TableCaption>Hãy gặp staff VTEAM để in thêm ảnh nha!</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Số lượng</TableHead>
                        <TableHead className="flex items-center gap-2">
                          Giá
                          <Image
                            src="/vn.svg"
                            alt="vn"
                            width={20}
                            height={20}
                          />
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {PRINT_PRICING.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {typeof item.quantity === "number"
                              ? item.quantity * (processedImage.type === "double" ? 2 : 1)
                              : typeof item.quantity === "string" && item.quantity.endsWith("+") && processedImage.type === "double"
                              ? `${parseInt(item.quantity) * 2}+`
                              : item.quantity}
                          </TableCell>
                          <TableCell>
                            {typeof item.quantity === "string" && item.quantity.endsWith("+")
                              ? `${item.price} VNĐ${processedImage.type === "double" ? "/2 ảnh" : "/ảnh"}`
                              : `${item.price} VNĐ`}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="w-full">
                  <Button
                    className="w-full flex items-center justify-center gap-2 cursor-pointer"
                    onClick={() => handleTabChange("order")}
                  >
                    Đặt in <FaArrowRight />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent
              value="order"
              className="h-full"
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Đặt in</CardTitle>
                  <CardDescription>Số lượng in tối đa là {MAX_PRINT_QUANTITY * (processedImage.type === "double" ? 2 : 1)} ảnh</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 w-full flex flex-col items-center justify-center gap-4">
                  <Label
                    htmlFor="print-quantity"
                    className="text-2xl"
                  >
                    Số lượng in: <SlidingNumber value={printQuantity} /> ảnh
                  </Label>
                  <Slider
                    name="print-quantity"
                    defaultValue={[processedImage.type === "double" ? 2 : 1]}
                    min={processedImage.type === "double" ? 2 : 1}
                    max={MAX_PRINT_QUANTITY * (processedImage.type === "double" ? 2 : 1)}
                    step={processedImage.type === "double" ? 2 : 1}
                    value={[printQuantity]}
                    onValueChange={(values) => setPrintQuantity(values[0])}
                  />
                  <div className="w-full h-[50px] text-[#f97316] font-semibold text-3xl flex items-center justify-center">
                    GIÁ: <SlidingNumber value={calculatePrice(printQuantity / (processedImage.type === "double" ? 2 : 1))} /> VNĐ
                  </div>
                </CardContent>
                <CardFooter className="w-full">
                  <Button
                    className="w-full flex items-center justify-center gap-2 cursor-pointer"
                    onClick={handleCreateQueue}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                        Đang xử lý...
                      </div>
                    ) : (
                      <>
                        Đặt in <FaArrowRight />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
          <Link
            href={`/${processedImage.id}`}
            className="w-full cursor-pointer"
          >
            <Button className="w-full cursor-pointer">
              <FaArrowLeft />
              Quay lại
            </Button>
          </Link>
        </div>
        <FrameStage
          processedImage={processedImage}
          images={images}
          stageRef={stageRef}
        />
      </div>
      <GeneralError
        error={error}
        message="Có lỗi trong khi đặt in!"
      />
    </>
  );
};

export default Print;
