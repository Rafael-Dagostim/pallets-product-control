"use client";

import { Inbox } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
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
  /** Hide this column in the desktop table below `md`. */
  hideOnMobile?: boolean;
  /** Hide this column from the auto-generated mobile card list. */
  hideOnCard?: boolean;
  /** Column is action-like (skip from card body auto-layout). */
  isActions?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  emptyAction?: ReactNode;
  /** Custom renderer for each item on mobile. If omitted, a sensible default is used. */
  mobileCard?: (item: T) => ReactNode;
  /** When true, the table fills its parent height and scrolls internally. Parent must provide a bounded height. */
  fillHeight?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  onRowClick,
  keyExtractor,
  isLoading,
  emptyMessage = "Nenhum registro encontrado.",
  emptyAction,
  mobileCard,
  fillHeight,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <>
        {/* Desktop skeleton */}
        <div className="hidden md:block bg-card border border-border rounded-lg overflow-hidden">
          <div className="bg-secondary h-11" />
          <div className="divide-y divide-border/40">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 px-4 py-3">
                {columns.map((col) => (
                  <Skeleton
                    key={col.key}
                    className={cn(
                      "h-4 flex-1",
                      col.hideOnMobile && "hidden md:block",
                    )}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* Mobile skeleton */}
        <div className="md:hidden space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border/60 rounded-lg p-4 space-y-2"
            >
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-card border border-dashed border-border/60 rounded-lg py-12 px-6 flex flex-col items-center gap-3 text-center">
        <div className="size-12 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground">
          <Inbox className="size-6" />
        </div>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        {emptyAction}
      </div>
    );
  }

  const renderCard =
    mobileCard ??
    ((item: T) => {
      const bodyCols = columns.filter((c) => !c.isActions && !c.hideOnCard);
      const [titleCol, ...restCols] = bodyCols;
      const actionCol = columns.find((c) => c.isActions);
      return (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            {titleCol && (
              <div className="text-base font-semibold truncate">
                {titleCol.render
                  ? titleCol.render(item)
                  : String((item as Record<string, unknown>)[titleCol.key] ?? "")}
              </div>
            )}
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              {restCols.map((col) => (
                <div key={col.key} className="flex flex-col">
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    {col.label}
                  </dt>
                  <dd className="text-foreground">
                    {col.render
                      ? col.render(item)
                      : String(
                          (item as Record<string, unknown>)[col.key] ?? "—",
                        )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          {actionCol?.render && (
            <div className="shrink-0">{actionCol.render(item)}</div>
          )}
        </div>
      );
    });

  return (
    <>
      {/* Desktop table */}
      <div
        className={cn(
          "hidden md:flex bg-card border border-border rounded-lg overflow-hidden min-w-0 w-full flex-col",
          fillHeight && "flex-1 min-h-0",
        )}
      >
        <div
          className={cn(
            fillHeight
              ? "flex-1 min-h-0 overflow-y-auto themed-scroll"
              : "contents",
          )}
        >
        <Table>
          <TableHeader className={cn(fillHeight && "sticky top-0 z-10 bg-secondary")}>
            <TableRow className="bg-secondary hover:bg-secondary">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "text-white text-sm font-semibold uppercase tracking-wide",
                    col.hideOnMobile && "hidden md:table-cell",
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
                  onRowClick && "cursor-pointer hover:bg-primary/5",
                )}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn(
                      "text-sm",
                      col.hideOnMobile && "hidden md:table-cell",
                    )}
                  >
                    {col.render
                      ? col.render(item)
                      : String(
                          (item as Record<string, unknown>)[col.key] ?? "",
                        )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Mobile cards */}
      <div
        className={cn(
          "md:hidden space-y-3",
          fillHeight && "flex-1 min-h-0 overflow-y-auto themed-scroll pr-1",
        )}
      >
        {data.map((item) => (
          <div
            key={keyExtractor(item)}
            role={onRowClick ? "button" : undefined}
            tabIndex={onRowClick ? 0 : undefined}
            onClick={onRowClick ? () => onRowClick(item) : undefined}
            onKeyDown={
              onRowClick
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onRowClick(item);
                    }
                  }
                : undefined
            }
            className={cn(
              "bg-card border border-border/60 rounded-lg p-4 transition-colors",
              onRowClick &&
                "cursor-pointer hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            {renderCard(item)}
          </div>
        ))}
      </div>
    </>
  );
}
