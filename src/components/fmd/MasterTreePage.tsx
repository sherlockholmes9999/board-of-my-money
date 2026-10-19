import { ChevronsDownUp, ChevronsUpDown, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { FilterBar } from "@/components/fat/FilterBar";
import { ModuleHeader } from "@/components/fat/ModuleHeader";
import { TreeTable } from "@/components/fat/TreeTable";
import { Button } from "@/components/ui/button";
import type { FinanceNode } from "@/lib/fat/tree";
import { recordLabel } from "@/lib/fmd/logic";
import { collections } from "@/lib/fmd/repositories";
import type { Row } from "@/lib/fmd/schema";
import type { TreeView } from "@/lib/fmd/views";
import { leafDescriptions } from "@/lib/fmd/views";
import { cn } from "@/lib/utils";
import { buildColumns } from "./cells";
import { RowMenu } from "./RowMenu";
import { useRecordWorkspace } from "./useRecordWorkspace";

export function MasterTreePage({ node, view }: { node: FinanceNode; view: TreeView }) {
  const ws = useRecordWorkspace(view.collection);
  const { def, all, repo } = ws;
  const parentKey = def.parentKey ?? "parentId";
  const groupField = view.groupBy ? def.fields.find((f) => f.key === view.groupBy) : undefined;
  const groups = groupField?.ref ? all[groupField.ref] : [];
  const [group, setGroup] = useState<string>("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Default group: first dimension that has values (or follow the selected record).
  useEffect(() => {
    if (!view.groupBy) return;
    const sel = ws.selectedId ? repo.items.find((r) => r.id === ws.selectedId) : null;
    if (sel) setGroup(sel[view.groupBy]!);
    else if (!group) setGroup(repo.items[0]?.[view.groupBy] ?? groups[0]?.id ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.groupBy, ws.selectedId]);

  const rows = useMemo(
    () => (view.groupBy && group ? repo.items.filter((r) => r[view.groupBy!] === group) : repo.items),
    [repo.items, view.groupBy, group],
  );

  // Expand everything on first render / group change.
  useEffect(() => setExpanded(new Set(rows.map((r) => r.id))), [group, rows.length]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q && !status) return null;
    const out = new Set<string>();
    for (const r of rows) {
      const text = `${r[def.codeField] ?? ""} ${def.nameField ? r[def.nameField] : ""}`.toLowerCase();
      if ((!q || text.includes(q)) && (!status || r.status === status)) {
        let cur: Row | undefined = r;
        while (cur && !out.has(cur.id)) {
          out.add(cur.id);
          cur = rows.find((p) => p.id === cur![parentKey]);
        }
      }
    }
    return out;
  }, [rows, search, status, def, parentKey]);

  const columns = useMemo(() => buildColumns(view.columns, def, all), [view.columns, def, all]);
  const active = rows.filter((r) => r.status === "Active").length;
  const toggle = (id: string) =>
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const defaults = (parentId = "") => ({ [parentKey]: parentId, ...(view.groupBy ? { [view.groupBy]: group } : {}) });

  return (
    <div>
      <ModuleHeader
        path={node.path}
        title={node.name}
        description={leafDescriptions[node.path]}
        meta={
          <>
            <span>
              <strong className="num text-foreground">{rows.length}</strong> nodes
            </span>
            <span>
              <strong className="num text-foreground">{active}</strong> active
            </span>
            <span>
              <strong className="num text-foreground">{rows.filter((r) => !r[parentKey]).length}</strong> root nodes
            </span>
          </>
        }
        actions={
          <Button size="sm" onClick={() => ws.openNew(defaults())}>
            <Plus className="size-3.5" aria-hidden /> New {def.singular}
          </Button>
        }
      />
      <div className="space-y-3 p-4 lg:p-6">
        {groupField?.ref ? (
          <div role="tablist" aria-label={`Select ${groupField.label}`} className="flex flex-wrap gap-1 border-b border-border">
            {groups.map((g) => {
              const count = repo.items.filter((r) => r[view.groupBy!] === g.id).length;
              return (
                <button
                  key={g.id}
                  role="tab"
                  aria-selected={group === g.id}
                  onClick={() => setGroup(g.id)}
                  className={cn(
                    "-mb-px border-b-2 px-3 py-1.5 text-sm",
                    group === g.id ? "border-primary font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {g.name} <span className="num text-[11px] text-muted-foreground">({count})</span>
                </button>
              );
            })}
          </div>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <FilterBar
            search={search}
            onSearch={setSearch}
            filters={[{ id: "status", label: "Status", options: ["Active", "Inactive"].map((v) => ({ value: v, label: v })) }]}
            values={{ status }}
            onFilter={(_, v) => setStatus(v)}
            onClear={() => {
              setSearch("");
              setStatus("");
            }}
            placeholder="Search code or name"
          />
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={() => setExpanded(new Set(rows.map((r) => r.id)))}>
              <ChevronsUpDown className="size-3.5" aria-hidden /> Expand All
            </Button>
            <Button size="sm" variant="outline" onClick={() => setExpanded(new Set())}>
              <ChevronsDownUp className="size-3.5" aria-hidden /> Collapse All
            </Button>
          </div>
        </div>
        <TreeTable
          rows={rows}
          parentKey={parentKey}
          columns={columns}
          expanded={expanded}
          onToggle={toggle}
          visible={visible}
          selectedId={ws.selectedId}
          onSelect={ws.select}
          label={(r) => (
            <>
              <span className="mr-2 font-mono text-xs text-muted-foreground">{r[def.codeField]}</span>
              <span className="font-medium">{def.nameField ? r[def.nameField] : ""}</span>
            </>
          )}
          actions={(row) => (
            <RowMenu
              row={row}
              label={recordLabel(def, row)}
              statusful={def.statusful}
              onView={() => ws.select(row)}
              onEdit={() => ws.openEdit(row)}
              onAddChild={() => ws.openNew(defaults(row.id))}
              onToggle={() => ws.toggleStatus(row)}
              onDelete={() => ws.requestDelete(row)}
            />
          )}
        />
        <p className="text-xs text-muted-foreground">
          To move a node, edit it and choose a new parent. Moves into the node's own descendants are rejected.
          {collections[view.collection].route !== node.path ? null : null}
        </p>
      </div>
      {ws.ui}
    </div>
  );
}
