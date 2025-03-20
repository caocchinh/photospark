"use client";

import {ColumnDef} from "@tanstack/react-table";

import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {ChevronDown, MoreHorizontal} from "lucide-react";

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

export type QueueActionHandlers = {
  onDelete?: (id: string) => void;
  onCopy?: (id: string) => void;
  onViewDetails?: (queue: QueueEntry) => void;
  onViewProcessedImage?: (processedImageId: string) => void;
};

/**
 * Example of how to use transformQueueData function to prepare data for display:
 *
 * // In your component or data fetching logic:
 * const transformedData = initialData.map(queue => transformQueueData(queue));
 *
 * // Then use transformedData with DataTable component
 * <DataTable columns={columns(actionHandlers)} data={transformedData} />
 *
 * // For direct access to formatted values in the columns:
 * // cell: ({row}) => <div>{row.original.dateDisplay}</div>
 */
export const columns = (actionHandlers?: QueueActionHandlers): ColumnDef<QueueEntry>[] => [
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
  {
    id: "actions",
    cell: ({row}) => {
      const queue = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => actionHandlers?.onCopy?.(queue.id)}>Copy queue ID</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => actionHandlers?.onViewDetails?.(queue)}>View queue details</DropdownMenuItem>
            <DropdownMenuItem onClick={() => actionHandlers?.onViewProcessedImage?.(queue.processedImageId)}>View processed image</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => actionHandlers?.onDelete?.(queue.id)}
              className="text-red-600 focus:text-red-600"
            >
              Delete queue
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
