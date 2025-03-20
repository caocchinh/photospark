"use client";
import * as React from "react";
import {DataTable} from "@/components/ui/data-table";
import {Search, ChevronDown} from "lucide-react";
import {columns} from "@/components/ui/columns";
import {useState} from "react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {QUEUE_TITLE_MAPING} from "@/constants/constants";
import {transformQueueData} from "@/lib/utils";
import {QueueTable} from "@/drizzle/schema";

const Table = ({avaialbleQueues}: {avaialbleQueues: (typeof QueueTable.$inferSelect)[]}) => {
  const [selectedFilterColumn, setSelectedFilterColumn] = useState<string>("id");

  return (
    <div className="w-[50%]">
      <div className="flex items-center">
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
              {Object.keys(avaialbleQueues[0]).map((columnName) => (
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
        columns={columns()}
        data={avaialbleQueues.map((item) => transformQueueData(item))}
        filterColumn={selectedFilterColumn}
        filterPlaceholder={`Lọc bằng ${QUEUE_TITLE_MAPING[selectedFilterColumn as keyof typeof QUEUE_TITLE_MAPING].toLowerCase()}...`}
      />
    </div>
  );
};

export default Table;
