import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { ConfirmationDialog } from "@/components/fat/ConfirmationDialog";
import { DetailPanel } from "@/components/fat/DetailPanel";
import { FormDialog } from "@/components/fat/FormDialog";
import { collections } from "@/lib/fmd/repositories";
import { recordLabel, referencesTo } from "@/lib/fmd/logic";
import type { CollectionKey, Row } from "@/lib/fmd/schema";
import { newId, useAllCollections, useRepo } from "@/lib/fmd/store";

/**
 * Shared CRUD workflow for every master data page: create/edit form,
 * detail drawer (synced with ?selected=), activate/deactivate, and
 * delete with referential-integrity confirmation.
 */
export function useRecordWorkspace(key: CollectionKey, opts?: { detailExtra?: (row: Row) => ReactNode }) {
  const def = collections[key];
  const all = useAllCollections();
  const repo = useRepo(key);
  const search = useSearch({ strict: false }) as { selected?: string };
  const navigate = useNavigate();

  const [form, setForm] = useState<{ mode: "create" | "edit"; row: Row | null } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(search.selected ?? null);
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);

  useEffect(() => {
    if (search.selected) setSelectedId(search.selected);
  }, [search.selected]);

  const selected = selectedId ? (repo.items.find((r) => r.id === selectedId) ?? null) : null;

  const closeDetail = () => {
    setSelectedId(null);
    if (search.selected) void navigate({ to: ".", search: {} as never, replace: true });
  };

  const openNew = (defaults: Record<string, string> = {}) => {
    const base: Record<string, string> = { id: "" };
    for (const f of def.fields) base[f.key] = f.type === "bool" ? "No" : "";
    if (def.statusful) base.status = "Active";
    if (key === "changeControl") base.status = "Draft";
    setForm({ mode: "create", row: { ...base, ...defaults } as Row });
  };
  const openEdit = (row: Row) => setForm({ mode: "edit", row });

  const save = (row: Row) => {
    if (form?.mode === "create") {
      const created = { ...row, id: newId(key) } as Row;
      repo.add(created);
      toast.success(`${def.singular} ${recordLabel(def, created)} created`);
    } else {
      repo.update(row.id, row);
      toast.success(`${def.singular} ${recordLabel(def, row)} updated`);
    }
    setForm(null);
  };

  const toggleStatus = (row: Row) => {
    const next = row.status === "Inactive" ? "Active" : "Inactive";
    repo.update(row.id, { status: next });
    toast.success(`${recordLabel(def, row)} set to ${next}`);
  };

  const refs = pendingDelete ? referencesTo(all, key, pendingDelete.id) : [];
  const blocked = refs.length > 0;

  const ui = (
    <>
      <FormDialog
        open={!!form}
        mode={form?.mode ?? "create"}
        def={def}
        initial={form?.row ?? null}
        all={all}
        onOpenChange={(o) => !o && setForm(null)}
        onSave={save}
      />
      <DetailPanel
        def={def}
        row={selected}
        all={all}
        onClose={closeDetail}
        onEdit={openEdit}
        onToggleStatus={def.statusful ? toggleStatus : undefined}
        onDelete={setPendingDelete}
        extra={selected && opts?.detailExtra ? opts.detailExtra(selected) : null}
      />
      <ConfirmationDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        blocked={blocked}
        destructive
        title={blocked ? "Record is in use" : `Delete ${def.singular}?`}
        description={
          blocked
            ? `${pendingDelete ? recordLabel(def, pendingDelete) : ""} is referenced by ${refs.length} record(s). ${def.statusful ? "Deactivate it instead to keep the history intact." : "Remove those references first."}`
            : `${pendingDelete ? recordLabel(def, pendingDelete) : ""} will be permanently removed. This cannot be undone.`
        }
        confirmLabel="Delete"
        onConfirm={() => {
          if (!pendingDelete) return;
          repo.remove(pendingDelete.id);
          toast.success(`${recordLabel(def, pendingDelete)} deleted`);
          if (selectedId === pendingDelete.id) closeDetail();
          setPendingDelete(null);
        }}
      />
    </>
  );

  return {
    def,
    all,
    repo,
    selectedId,
    select: (row: Row) => setSelectedId(row.id),
    openNew,
    openEdit,
    toggleStatus,
    requestDelete: setPendingDelete,
    ui,
  };
}
