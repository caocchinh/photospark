"use client";

import {ColumnDef, FilterFn} from "@tanstack/react-table";

import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";

import {ChevronDown} from "lucide-react";

import {getStatusColorDot, getStatusColor, getVietnameseStatus} from "@/lib/utils";
import {QUEUE_TITLE_MAPING} from "@/constants/constants";

export type QueueEntry = {
  id: string;
  quantity: number;
  status: "Chờ xử lý" | "Đang xử lý" | "Hoàn thành" | "Thất bại";
  createdAt: string;
  price: string;
  processedImageId: string;
};

const exactNumberFilter: FilterFn<QueueEntry> = (row, columnId, value) => {
  if (!value) return true;

  if (columnId === "quantity") {
    const rowValue = row.getValue(columnId) as number;
    return rowValue === parseInt(value as string);
  }

  return true;
};

export const columns = (): ColumnDef<QueueEntry>[] => [
  {
    id: "select",
    header: ({table}) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({row}) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({column}) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {QUEUE_TITLE_MAPING.id}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({row}) => <div className="font-medium truncate max-w-[150px]">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "processedImageId",
    header: ({column}) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {QUEUE_TITLE_MAPING.processedImageId}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({row}) => <div className="font-medium truncate max-w-[150px]">{row.getValue("processedImageId")}</div>,
  },
  {
    accessorKey: "quantity",
    header: ({column}) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {QUEUE_TITLE_MAPING.quantity}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({row}) => <div className="text-center">{row.getValue("quantity")}</div>,
    filterFn: exactNumberFilter,
  },
  {
    accessorKey: "createdAt",
    header: ({column}) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {QUEUE_TITLE_MAPING.createdAt}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({row}) => {
      const date = row.getValue("createdAt") as string;
      return <div>{date}</div>;
    },
  },
  {
    accessorKey: "price",
    header: ({column}) => {
      return (
        <div className="text-right flex items-center justify-end">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {QUEUE_TITLE_MAPING.price}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({row}) => {
      return <div className="text-right font-medium">{row.getValue("price")}</div>;
    },
  },
  {
    accessorKey: "status",
    header: ({column}) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {QUEUE_TITLE_MAPING.status}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({row}) => {
      const status = row.getValue("status") as string;
      return (
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColorDot(status)}`}></div>
          <div className={`${getStatusColor(status)}`}>{getVietnameseStatus(status)}</div>
        </div>
      );
    },
  },
];
