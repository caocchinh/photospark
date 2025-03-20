"use client";
import * as React from "react";
import {DataTable} from "@/components/ui/data-table";
import {Search, ChevronDown} from "lucide-react";
import {columns, QueueEntry, QueueActionHandlers} from "@/components/ui/columns";
import {useState} from "react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {QUEUE_TITLE_MAPING} from "@/constants/constants";
import {transformQueueData} from "@/lib/utils";

const initialData: Array<{
  id: string;
  quantity: number;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: Date;
  price: number;
  processedImageId: string;
}> = [
  {
    id: "m5gr84i9-8f3e-4e9c-a1b2-c3d4e5f6g7h8",
    quantity: 2,
    status: "completed",
    createdAt: new Date("2023-05-15T09:24:00"),
    price: 199000,
    processedImageId: "f8e7d6c5-b4a3-2918-7f6e-5d4c3b2a1098",
  },
  {
    id: "3u1reuv4-7d6e-5f4g-h3i2-j1k0l9m8n7o6",
    quantity: 1,
    status: "pending",
    createdAt: new Date("2023-05-16T14:30:00"),
    price: 99000,
    processedImageId: "a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6",
  },
  {
    id: "derv1ws0-1a2b-3c4d-5e6f-7g8h9i0j1k2l",
    quantity: 3,
    status: "processing",
    createdAt: new Date("2023-05-17T11:45:00"),
    price: 299000,
    processedImageId: "p6o5n4m3-l2k1-j0i9-h8g7-f6e5d4c3b2a1",
  },
  {
    id: "5kma53ae-9i8u-7y6t-5r4e-3w2q1p0o9i8u",
    quantity: 5,
    status: "completed",
    createdAt: new Date("2023-05-18T16:20:00"),
    price: 499000,
    processedImageId: "q1w2e3r4-t5y6-u7i8-o9p0-a1s2d3f4g5h6",
  },
  {
    id: "bhqecj4p-5r4e-3w2q-1a2s-3d4f5g6h7j8k",
    quantity: 2,
    status: "failed",
    createdAt: new Date("2023-05-19T08:15:00"),
    price: 199000,
    processedImageId: "z9x8c7v6-b5n4-m3a2-s1d2-f3g4h5j6k7l8",
  },
  {
    id: "akoi3d3i-3e4r-5t6y-7u8i-9o0p1a2s3d4f",
    quantity: 1,
    status: "pending",
    createdAt: new Date("2023-05-20T13:10:00"),
    price: 99000,
    processedImageId: "l8k7j6h5-g4f3-d2s1-a0p9-o8i7u6y5t4r3",
  },
  {
    id: "dn7scsi5-7y6t-5r4e-3w2q-1a2s3d4f5g6h",
    quantity: 4,
    status: "processing",
    createdAt: new Date("2023-05-21T10:30:00"),
    price: 399000,
    processedImageId: "e3r4t5y6-u7i8-o9p0-a1s2-d3f4g5h6j7k8",
  },
  {
    id: "fcj6r3ak-2q3w-4e5r-6t7y-8u9i0o1p2a3s",
    quantity: 2,
    status: "completed",
    createdAt: new Date("2023-05-22T15:45:00"),
    price: 199000,
    processedImageId: "m3n4b5v6-c7x8-z9a1-s2d3-f4g5h6j7k8l9",
  },
  {
    id: "9plef23r-8i9o-0p1a-2s3d-4f5g6h7j8k9l",
    quantity: 3,
    status: "failed",
    createdAt: new Date("2023-05-23T09:20:00"),
    price: 299000,
    processedImageId: "y6t5r4e3-w2q1-a0s9-d8f7-g6h5j4k3l2z1",
  },
  {
    id: "q7hw9rnh-4f5g-6h7j-8k9l-0z1x2c3v4b5n",
    quantity: 1,
    status: "pending",
    createdAt: new Date("2023-05-24T12:00:00"),
    price: 99000,
    processedImageId: "p0o9i8u7-y6t5-r4e3-w2q1-a0s9d8f7g6h5",
  },
];

export default function Home() {
  const [selectedFilterColumn, setSelectedFilterColumn] = useState<string>("id");
  const [data, setData] = useState<QueueEntry[]>(initialData.map((item) => transformQueueData(item)));

  const actionHandlers: QueueActionHandlers = {
    onDelete: (id: string) => {
      setData(data.filter((item) => item.id !== id));
    },
    onCopy: (id: string) => {
      navigator.clipboard.writeText(id);
    },
    onViewDetails: (queue: QueueEntry) => {
      const formattedPrice = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(Number(queue.price));
      window.alert(`View queue details: Quantity: ${queue.quantity}, Price: ${formattedPrice}`);
    },
    onViewProcessedImage: (processedImageId: string) => {
      window.alert(`View processed image with ID: ${processedImageId}`);
    },
  };

  return (
    <div className="w-[50vw] mx-auto py-10 ">
      <h1 className="text-2xl font-bold mb-4">Quản lý in ảnh</h1>
      <p className="text-muted-foreground mb-6">Hãy chắc chắn khách hàng đã trả tiền trước khi in ảnh!</p>

      <div className="mb-4 flex items-center">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Lọc theo:</h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="border border-slate-300"
              >
                {QUEUE_TITLE_MAPING[selectedFilterColumn as keyof typeof QUEUE_TITLE_MAPING]}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.keys(initialData[0]).map((columnName) => (
                <DropdownMenuItem
                  key={columnName}
                  onClick={() => setSelectedFilterColumn(columnName)}
                >
                  {QUEUE_TITLE_MAPING[columnName as keyof typeof QUEUE_TITLE_MAPING]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <DataTable
        columns={columns(actionHandlers)}
        data={data}
        filterColumn={selectedFilterColumn}
        filterPlaceholder={`Lọc bằng ${QUEUE_TITLE_MAPING[selectedFilterColumn as keyof typeof QUEUE_TITLE_MAPING]}...`}
      />
    </div>
  );
}
