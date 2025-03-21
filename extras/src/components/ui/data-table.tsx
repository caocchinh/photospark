"use client";
"use no memo";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  PaginationState,
} from "@tanstack/react-table";

import {ChevronDown, ChevronLeft, ChevronRight, Check} from "lucide-react";

import {Button} from "./button";
import {DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem} from "./dropdown-menu";
import {Input} from "./input";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "./table";
import {QUEUE_TITLE_MAPING} from "@/constants/constants";
import {cn} from "@/lib/utils";
import {useCallback, useState, useEffect} from "react";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 30, 40, 50] as const;

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterColumn?: string;
  filterPlaceholder?: string;
  setProcessedImageId: (id: string) => void;
  processedImageId: string;
  setIsError: (isError: boolean) => void;
  setQueueId: (id: string) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterColumn = "id",
  filterPlaceholder = `Lọc bằng ${QUEUE_TITLE_MAPING[filterColumn as keyof typeof QUEUE_TITLE_MAPING].toLowerCase()}`,
  setProcessedImageId,
  processedImageId,
  setIsError,
  setQueueId,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
    autoResetPageIndex: false,
  });

  useEffect(() => {
    const filteredRows = table.getFilteredRowModel().rows;
    const currentPageStart = pagination.pageIndex * pagination.pageSize;

    if (filteredRows.length > 0 && currentPageStart >= filteredRows.length) {
      table.setPageIndex(0);
    }
  }, [columnFilters, table, pagination.pageIndex, pagination.pageSize]);

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      table.setPageSize(newSize);
    },
    [table]
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4 gap-2">
        {table.getColumn(filterColumn) ? (
          <Input
            placeholder={filterPlaceholder}
            value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn(filterColumn)?.setFilterValue(event.target.value.toString())}
            className="flex-1"
            aria-label={`Lọc bằng ${QUEUE_TITLE_MAPING[filterColumn as keyof typeof QUEUE_TITLE_MAPING].toLowerCase()}`}
          />
        ) : null}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="ml-auto cursor-pointer"
            >
              Cột <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide() && column.id !== "actions")
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    className="capitalize"
                  >
                    {QUEUE_TITLE_MAPING[column.id as keyof typeof QUEUE_TITLE_MAPING]}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{cursor: header.column.getCanSort() ? "pointer" : "default"}}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.id === selectedRowId && "selected"}
                  onClick={(e) => {
                    if (!(e.target as HTMLElement).closest("button, input, a")) {
                      setSelectedRowId(row.id);
                      setQueueId(row.getValue("id") as string);
                      setIsError(false);
                      if ((row.getValue("processedImageId") as string) !== processedImageId) {
                        setProcessedImageId(row.getValue("processedImageId") as string);
                      }
                    }
                  }}
                  className={cn("hover:bg-muted/50 cursor-pointer", row.id === selectedRowId && "!bg-black text-white")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Không có kết quả nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4 w-full">
        <div className="text-sm text-muted-foreground">Tổng {table.getFilteredRowModel().rows.length} đơn hàng</div>

        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Số dòng trên trang:</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-8 min-w-[50px] p-0 cursor-pointer"
              >
                {pagination.pageSize}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="cursor-pointer min-w-[50px]"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <DropdownMenuItem
                  key={size}
                  onClick={() => handlePageSizeChange(size)}
                >
                  {size}
                  {pagination.pageSize === size && <Check className="ml-2 h-4 w-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-center gap-4">
          <div className="flex w-max items-center justify-center text-sm font-medium">
            Trang {table.getState().pagination.pageIndex + 1} trên {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0 cursor-pointer"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />|
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 cursor-pointer"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 cursor-pointer"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 cursor-pointer"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              |<ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
