import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import type { Column } from "@/components/fmd/cells";
import type { Row } from "@/lib/fmd/schema";
import { cn } from "@/lib/utils";

interface Props {
  rows: Row[];
  columns: Column[];
  selectedId?: string | null;
  onRowClick?: (row: Row) => void;
  rowActions?: (row: Row) => ReactNode;
  pageSize?: number;
  loading?: boolean;
  empty?: ReactNode;
}

export function Pagination({ page, pages, total, onPage }: { page: number; pages: number; total: number; onPage: (p: number) => void }) {
  return (
    <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground">
      <span>{total} records</span>
      <div className="flex items-center gap-1">
        <button
          className="grid size-6 place-items-center rounded-sm border border-input disabled:opacity-40"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-3.5" />
        </button>
        <span className="px-2">
          Page {page} of {pages}
        </span>
        <button
          className="grid size-6 place-items-center rounded-sm border border-input disabled:opacity-40"
          onClick={() => onPage(page + 1)}
          disabled={page >= pages}
          aria-label="Next page"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

export function DataTable({ rows, columns, selectedId, onRowClick, rowActions, pageSize = 15, loading, empty }: Props) {
  const [sort, setSort] = useState<{ id: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.id === sort.id);
    if (!col) return rows;
    return [...rows].sort((a, b) =>
      col.value(a).localeCompare(col.value(b), undefined, { numeric: true }) * sort.dir,
    );
  }, [rows, columns, sort]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pages);
  const visible = sorted.slice((current - 1) * pageSize, current * pageSize);

  const toggleSort = (id: string) =>
    setSort((s) => (!s || s.id !== id ? { id, dir: 1 } : s.dir === 1 ? { id, dir: -1 } : null));

  return (
    <div className="overflow-hidden rounded-sm border border-border bg-card">
      <div className="scroll-slim overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-muted/60">
            <tr>
              {columns.map((c) => {
                const active = sort?.id === c.id;
                const Icon = !active ? ArrowUpDown : sort!.dir === 1 ? ArrowUp : ArrowDown;
                return (
                  <th
                    key={c.id}
                    scope="col"
                    aria-sort={active ? (sort!.dir === 1 ? "ascending" : "descending") : "none"}
                    className="border-b border-border px-3 py-2 text-left text-[11px] font-semibold tracking-wide whitespace-nowrap text-muted-foreground uppercase"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(c.id)}
                      className="inline-flex items-center gap-1 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      {c.label}
                      <Icon className={cn("size-3", !active && "opacity-40")} aria-hidden />
                    </button>
                  </th>
                );
              })}
              {rowActions ? (
                <th scope="col" className="w-12 border-b border-border px-3 py-2 text-right text-[11px] font-semibold text-muted-foreground uppercase">
                  <span className="sr-only">Actions</span>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((c) => (
                    <td key={c.id} className="border-b border-border px-3 py-2.5">
                      <span className="block h-3 w-3/4 animate-pulse rounded-sm bg-muted" />
                    </td>
                  ))}
                  {rowActions ? <td className="border-b border-border" /> : null}
                </tr>
              ))
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (rowActions ? 1 : 0)} className="px-3 py-10 text-center text-sm text-muted-foreground">
                  {empty ?? "No records match the current filters."}
                </td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr
                  key={row.id}
                  aria-selected={selectedId === row.id}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "cursor-pointer border-b border-border last:border-b-0 hover:bg-muted/50",
                    selectedId === row.id && "bg-secondary hover:bg-secondary",
                    row.status === "Inactive" && "text-muted-foreground",
                  )}
                >
                  {columns.map((c) => (
                    <td key={c.id} className={cn("px-3 py-1.5 align-middle", c.numeric && "num text-right")}>
                      {c.render(row)}
                    </td>
                  ))}
                  {rowActions ? (
                    <td className="px-2 py-1 text-right" onClick={(e) => e.stopPropagation()}>
                      {rowActions(row)}
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {sorted.length > pageSize ? <Pagination page={current} pages={pages} total={sorted.length} onPage={setPage} /> : null}
    </div>
  );
}
