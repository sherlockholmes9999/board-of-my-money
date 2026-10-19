import { Pencil, Power, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { renderField } from "@/components/fmd/cells";
import { collections } from "@/lib/fmd/repositories";
import { recordLabel, referencesTo } from "@/lib/fmd/logic";
import type { CollectionDef, CollectionKey, Row } from "@/lib/fmd/schema";
import { NodeLink } from "./NodeLink";

type All = Record<CollectionKey, Row[]>;

interface Props {
  def: CollectionDef;
  row: Row | null;
  all: All;
  onClose: () => void;
  onEdit: (row: Row) => void;
  onToggleStatus?: (row: Row) => void;
  onDelete: (row: Row) => void;
  extra?: ReactNode;
}

/** Reusable record drawer with properties, relationships and actions. */
export function DetailPanel({ def, row, all, onClose, onEdit, onToggleStatus, onDelete, extra }: Props) {
  const refs = row ? referencesTo(all, def.key, row.id) : [];
  const children = row && def.parentKey ? all[def.key].filter((r) => r[def.parentKey!] === row.id) : [];
  return (
    <Sheet open={!!row} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        {row ? (
          <>
            <SheetHeader className="border-b border-border px-5 py-4 text-left">
              <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{def.singular} Details</p>
              <SheetTitle className="text-lg">{recordLabel(def, row)}</SheetTitle>
              <SheetDescription className="sr-only">Properties and relationships of the selected record.</SheetDescription>
            </SheetHeader>
            <div className="scroll-slim flex-1 space-y-5 overflow-y-auto px-5 py-4">
              <dl className="grid grid-cols-[140px_1fr] gap-x-3 gap-y-2 text-sm">
                {def.fields.map((f) => (
                  <div key={f.key} className="contents">
                    <dt className="text-muted-foreground">{f.label}</dt>
                    <dd className="min-w-0 break-words">{renderField(all, f, row)}</dd>
                  </div>
                ))}
              </dl>
              {extra}
              {def.parentKey ? (
                <section>
                  <h3 className="mb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Children ({children.length})
                  </h3>
                  {children.length ? (
                    <ul className="divide-y divide-border rounded-sm border border-border text-sm">
                      {children.map((c) => (
                        <li key={c.id} className="px-3 py-1.5">
                          <NodeLink path={def.route} selected={c.id} className="text-primary hover:underline">
                            {recordLabel(def, c)}
                          </NodeLink>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No child records.</p>
                  )}
                </section>
              ) : null}
              <section>
                <h3 className="mb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Referenced By ({refs.filter((r) => r.collection !== def.key).length})
                </h3>
                {refs.filter((r) => r.collection !== def.key).length ? (
                  <ul className="divide-y divide-border rounded-sm border border-border text-sm">
                    {refs
                      .filter((r) => r.collection !== def.key)
                      .map((r) => {
                        const target = collections[r.collection];
                        return (
                          <li key={`${r.collection}-${r.row.id}-${r.field.key}`} className="flex items-center justify-between gap-2 px-3 py-1.5">
                            <NodeLink path={target.route} selected={r.row.id} className="truncate text-primary hover:underline">
                              {recordLabel(target, r.row)}
                            </NodeLink>
                            <span className="shrink-0 text-[11px] text-muted-foreground">
                              {target.singular} · {r.field.label}
                            </span>
                          </li>
                        );
                      })}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Not referenced by other master data.</p>
                )}
              </section>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-border px-5 py-3">
              <Button size="sm" onClick={() => onEdit(row)}>
                <Pencil className="size-3.5" aria-hidden /> Edit
              </Button>
              {def.statusful && onToggleStatus ? (
                <Button size="sm" variant="outline" onClick={() => onToggleStatus(row)}>
                  <Power className="size-3.5" aria-hidden /> {row.status === "Inactive" ? "Activate" : "Deactivate"}
                </Button>
              ) : null}
              <Button size="sm" variant="outline" className="text-negative" onClick={() => onDelete(row)}>
                <Trash2 className="size-3.5" aria-hidden /> Delete
              </Button>
              <Button size="sm" variant="ghost" className="ml-auto" onClick={onClose}>
                Close
              </Button>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
