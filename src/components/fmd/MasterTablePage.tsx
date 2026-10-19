import { Play, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/fat/DataTable";
import { FilterBar } from "@/components/fat/FilterBar";
import { ModuleHeader } from "@/components/fat/ModuleHeader";
import { Button } from "@/components/ui/button";
import type { FinanceNode } from "@/lib/fat/tree";
import { displayValue, recordLabel, runQualityCheck } from "@/lib/fmd/logic";
import type { Row } from "@/lib/fmd/schema";
import type { TableView } from "@/lib/fmd/views";
import { leafDescriptions } from "@/lib/fmd/views";
import { buildColumns, filterLabel, filterOptions, rowMatchesFilter } from "./cells";
import { ChangeLifecycle } from "./ChangeLifecycle";
import { RowMenu } from "./RowMenu";
import { useHydrated } from "./useHydrated";
import { useRecordWorkspace } from "./useRecordWorkspace";

export function MasterTablePage({ node, view }: { node: FinanceNode; view: TableView }) {
  const ws = useRecordWorkspace(view.collection, {
    detailExtra: view.collection === "changeControl" ? (row) => <ChangeLifecycle row={row} /> : undefined,
  });
  const { def, all, repo } = ws;
  const hydrated = useHydrated();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const columns = useMemo(() => buildColumns(view.columns, def, all), [view.columns, def, all]);
  const filterDefs = view.filters.map((f) => ({ id: f, label: filterLabel(f, def), options: filterOptions(f, def, all) }));

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return repo.items.filter((row) => {
      for (const [k, v] of Object.entries(filters)) if (!rowMatchesFilter(k, v, def, row, all)) return false;
      if (!q) return true;
      return def.fields.some((f) => displayValue(all, f, row).toLowerCase().includes(q));
    });
  }, [repo.items, search, filters, def, all]);

  const active = repo.items.filter((r) => r.status === "Active").length;

  const runAll = () => {
    const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
    repo.replaceAll(
      repo.items.map((rule) => {
        if (rule.status !== "Active") return rule;
        const { failed, total } = runQualityCheck(all, rule);
        return { ...rule, lastRun: stamp, result: failed ? `Failed (${failed}/${total})` : `Passed (${total})` } as Row;
      }),
    );
    toast.success("Active data quality rules executed");
  };

  return (
    <div>
      <ModuleHeader
        path={node.path}
        title={node.name}
        description={leafDescriptions[node.path]}
        meta={
          <>
            <span>
              <strong className="num text-foreground">{repo.items.length}</strong> records
            </span>
            {def.statusful ? (
              <span>
                <strong className="num text-foreground">{active}</strong> active
              </span>
            ) : null}
            <span>
              Showing <strong className="num text-foreground">{rows.length}</strong>
            </span>
          </>
        }
        actions={
          <>
            {view.collection === "qualityRules" ? (
              <Button size="sm" variant="outline" onClick={runAll}>
                <Play className="size-3.5" aria-hidden /> Run Active Rules
              </Button>
            ) : null}
            <Button size="sm" onClick={() => ws.openNew()}>
              <Plus className="size-3.5" aria-hidden /> New {def.singular}
            </Button>
          </>
        }
      />
      <div className="space-y-3 p-4 lg:p-6">
        <FilterBar
          search={search}
          onSearch={setSearch}
          filters={filterDefs}
          values={filters}
          onFilter={(id, v) => setFilters((f) => ({ ...f, [id]: v }))}
          onClear={() => {
            setSearch("");
            setFilters({});
          }}
          placeholder={`Search ${node.name.toLowerCase()}`}
        />
        <DataTable
          rows={rows}
          columns={columns}
          loading={!hydrated}
          selectedId={ws.selectedId}
          onRowClick={ws.select}
          empty={
            repo.items.length === 0 ? (
              <span>
                No records yet.{" "}
                <button className="text-primary underline" onClick={() => ws.openNew()}>
                  Create the first {def.singular.toLowerCase()}
                </button>
              </span>
            ) : undefined
          }
          rowActions={(row) => (
            <RowMenu
              row={row}
              label={recordLabel(def, row)}
              statusful={def.statusful}
              onView={() => ws.select(row)}
              onEdit={() => ws.openEdit(row)}
              onToggle={() => ws.toggleStatus(row)}
              onDelete={() => ws.requestDelete(row)}
            />
          )}
        />
      </div>
      {ws.ui}
    </div>
  );
}
