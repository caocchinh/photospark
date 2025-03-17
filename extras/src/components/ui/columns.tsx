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

import {getStatusColorDot, getStatusColor} from "@/lib/utils";

export const initialData: Payment[] = [
  {
    id: "m5gr84i9",
    amount: 316,
    status: "success",
    email: "ken99@yahoo.com",
    name: "Ken Smith",
  },
  {
    id: "3u1reuv4",
    amount: 242,
    status: "success",
    email: "zoey22@gmail.com",
    name: "Zoey Taylor",
  },
  {
    id: "derv1ws0",
    amount: 837,
    status: "processing",
    email: "marion5@yahoo.com",
    name: "Marion Rodriguez",
  },
  {
    id: "5kma53ae",
    amount: 874,
    status: "success",
    email: "emma.johnson@example.com",
    name: "Emma Johnson",
  },
  {
    id: "bhqecj4p",
    amount: 721,
    status: "failed",
    email: "thomas.davis@example.com",
    name: "Thomas Davis",
  },
  {
    id: "akoi3d3i",
    amount: 603,
    status: "pending",
    email: "olivia.wilson@example.com",
    name: "Olivia Wilson",
  },
  {
    id: "dn7scsi5",
    amount: 928,
    status: "processing",
    email: "william.martinez@example.com",
    name: "William Martinez",
  },
  {
    id: "fcj6r3ak",
    amount: 512,
    status: "success",
    email: "sophia.brown@example.com",
    name: "Sophia Brown",
  },
  {
    id: "9plef23r",
    amount: 429,
    status: "failed",
    email: "james.garcia@example.com",
    name: "James Garcia",
  },
  {
    id: "q7hw9rnh",
    amount: 756,
    status: "pending",
    email: "ava.miller@example.com",
    name: "Ava Miller",
  },
];

export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
  name: string;
};

export const columns = (data: Payment[], setData: React.Dispatch<React.SetStateAction<Payment[]>>): ColumnDef<Payment>[] => [
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
    accessorKey: "name",
    header: ({column}) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({row}) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "email",
    header: ({column}) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({row}) => <div className="lowercase">{row.getValue("email")}</div>,
    filterFn: "includesString",
  },
  {
    accessorKey: "amount",
    header: ({column}) => {
      return (
        <div className="text-right flex items-center justify-end">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Amount
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({row}) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
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
          Status
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({row}) => {
      const status = row.getValue("status") as string;
      return (
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColorDot(status)}`}></div>
          <div className={`capitalize ${getStatusColor(status)}`}>{status}</div>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({row}) => {
      const payment = row.original;

      const handleDelete = () => {
        setData(data.filter((item) => item.id !== payment.id));
      };

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.id)}>Copy payment ID</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.alert(`View customer: ${payment.name}`)}>View customer</DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.alert(`View payment details for $${payment.amount}`)}>View payment details</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-red-600 focus:text-red-600"
            >
              Delete payment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
