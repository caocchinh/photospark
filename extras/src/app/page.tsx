"use client";
import * as React from "react";
import {DataTable} from "@/components/ui/data-table";
import {Search} from "lucide-react";
import {columns, initialData, Payment, PaymentActionHandlers} from "@/components/ui/columns";
import {useState} from "react";

export default function Home() {
  const [selectedFilterColumn, setSelectedFilterColumn] = useState<string>("name");
  const [data, setData] = useState<Payment[]>(initialData);

  const handleFilterColumnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFilterColumn(e.target.value);
  };

  // Define action handlers here
  const actionHandlers: PaymentActionHandlers = {
    onDelete: (id) => {
      setData(data.filter((item) => item.id !== id));
    },
    onCopy: (id) => {
      navigator.clipboard.writeText(id);
    },
    onViewCustomer: (payment) => {
      window.alert(`View customer: ${payment.name}`);
    },
    onViewDetails: (payment) => {
      window.alert(`View payment details for $${payment.amount}`);
    },
  };

  return (
    <div className="w-[50vw] mx-auto py-10 ">
      <h1 className="text-2xl font-bold mb-4">Order in thêm</h1>
      <p className="text-muted-foreground mb-6">Hãy chắc chắn khách hàng đã trả tiền trước khi in ảnh!</p>

      <div className="mb-4 flex items-center">
        <div className="flex items-center space-x-2 mr-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter by:</span>
          <select
            value={selectedFilterColumn}
            onChange={handleFilterColumnChange}
            className="h-8 rounded-md border border-input px-2"
          >
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns(actionHandlers)}
        data={data}
        filterColumn={selectedFilterColumn}
        filterPlaceholder={`Filter by ${selectedFilterColumn}...`}
      />
    </div>
  );
}
