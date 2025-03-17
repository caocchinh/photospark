"use client";
import * as React from "react";
import {DataTable} from "@/components/ui/data-table";
import {Search} from "lucide-react";
import {columns, initialData, Payment} from "@/components/ui/columns";
import {useState} from "react";

export default function Home() {
  const [selectedFilterColumn, setSelectedFilterColumn] = useState<string>("name");
  const [data, setData] = useState<Payment[]>(initialData);

  const handleFilterColumnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFilterColumn(e.target.value);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">TanStack Table Demo</h1>
      <p className="text-muted-foreground mb-6">A fully-featured table component with sorting, filtering, pagination, and row selection</p>

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
        columns={columns(data, setData)}
        data={data}
        filterColumn={selectedFilterColumn}
        filterPlaceholder={`Filter by ${selectedFilterColumn}...`}
      />
    </div>
  );
}
