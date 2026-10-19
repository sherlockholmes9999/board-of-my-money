import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import type { Column } from "@/components/fmd/cells";
import type { Row } from "@/lib/fmd/schema";
import { cn } from "@/lib/utils";

interface Props {
  rows: Row[];
  parentKey: string;
  label: (row: Row) => ReactNode;
  columns: Column[];
  expanded: Set<string>;
  onToggle: (id: string) => void;
  /** Rows to show while searching (matches + ancestors); null = all. */
  visible: Set<string> | null;
  selectedId: string | null;
  onSelect: (row: Row) => void;
  actions: (row: Row) => ReactNode;
}

/** Reusable hierarchical table used by every master data hierarchy. */
export function TreeTable({ rows, parentKey, label, columns, expanded, onToggle, visible, selectedId, onSelect, actions }: Props) {
  const ids = new Set(rows.map((r) => r.id));
  const childrenOf = (id: string) => rows.filter((r) => r[parentKey] === id);
  const roots = rows.filter((r) => !r[parentKey] || !ids.has(r[parentKey]!));

  const renderRow = (row: Row, depth: number, guides: boolean[]): ReactNode[] => {
    if (visible && !visible.has(row.id)) return [];
    const kids = childrenOf(row.id);
    const open = visible ? true : expanded.has(row.id);
    const out: ReactNode[] = [
      <tr
        key={row.id}
        role="treeitem"
        aria-level={depth + 1}
        aria-expanded={kids.length ? open : undefined}
        aria-selected={selectedId === row.id}
        onClick={() => onSelect(row)}
        className={cn(
          "cursor-pointer border-b border-border last:border-b-0 hover:bg-muted/50",
          selectedId === row.id && "bg-secondary hover:bg-secondary",
          row.status === "Inactive" && "text-muted-foreground",
        )}
      >
        <td className="py-1 pr-3">
          <div className="flex items-center">
            {guides.map((g, i) => (
              <span key={i} className={cn("h-7 w-4 shrink-0", g && "border-l border-border")} style={{ marginLeft: i === 0 ? 8 : 0 }} aria-hidden />
            ))}
            {depth > 0 ? <span className="mr-0.5 h-px w-2 shrink-0 bg-border" aria-hidden /> : <span className="w-2" />}
            {kids.length ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(row.id);
                }}
                className="grid size-5 shrink-0 place-items-center rounded-sm hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                aria-label={open ? "Collapse" : "Expand"}
              >
                <ChevronRight className={cn("size-3.5 transition-transform", open && "rotate-90")} />
              </button>
            ) : (
              <span className="size-5 shrink-0" />
            )}
            <span className="ml-1 min-w-0 truncate">{label(row)}</span>
            {kids.length ? <span className="ml-2 rounded-sm bg-muted px-1 text-[10px] text-muted-foreground num">{kids.length}</span> : null}
          </div>
        </td>
        {columns.map((c) => (
          <td key={c.id} className="px-3 py-1 whitespace-nowrap">
            {c.render(row)}
          </td>
        ))}
        <td className="px-2 py-1 text-right" onClick={(e) => e.stopPropagation()}>
          {actions(row)}
        </td>
      </tr>,
    ];
    if (open) {
      kids.forEach((k, i) => out.push(...renderRow(k, depth + 1, [...guides, i < kids.length - 1 || true])));
    }
    return out;
  };

  return (
    <div className="overflow-hidden rounded-sm border border-border bg-card">
      <div className="scroll-slim overflow-x-auto">
        <table role="treegrid" className="w-full border-collapse text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className="border-b border-border px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Node</th>
              {columns.map((c) => (
                <th key={c.id} className="border-b border-border px-3 py-2 text-left text-[11px] font-semibold tracking-wide whitespace-nowrap text-muted-foreground uppercase">
                  {c.label}
                </th>
              ))}
              <th className="w-12 border-b border-border">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {roots.flatMap((r) => renderRow(r, 0, []))}
            {roots.length === 0 || (visible && visible.size === 0) ? (
              <tr>
                <td colSpan={columns.length + 2} className="px-3 py-10 text-center text-sm text-muted-foreground">
                  No nodes match the current search.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
