"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  keyExtractor: (item: T) => string;
}

export function DataTable<T>({
  columns,
  data,
  onRowClick,
  keyExtractor,
}: DataTableProps<T>) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-auto max-h-[calc(100vh-220px)]">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary hover:bg-secondary sticky top-0 z-10">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  "text-white text-sm font-bold uppercase tracking-wide",
                  col.hideOnMobile && "hidden md:table-cell"
                )}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow
              key={keyExtractor(item)}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
              className={cn(
                "border-b border-border/20 transition-colors",
                index % 2 === 1 && "bg-card/60",
                onRowClick && "cursor-pointer hover:bg-primary/5"
              )}
            >
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  className={cn(
                    "text-sm",
                    col.hideOnMobile && "hidden md:table-cell"
                  )}
                >
                  {col.render
                    ? col.render(item)
                    : String((item as Record<string, unknown>)[col.key] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
