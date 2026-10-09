import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { collections } from "@/lib/fmd/repositories";
import { isDescendant, recordLabel, validateRow } from "@/lib/fmd/logic";
import type { CollectionDef, CollectionKey, FieldDef, Row } from "@/lib/fmd/schema";
import { cn } from "@/lib/utils";
import { selectClass } from "./FilterBar";

type All = Record<CollectionKey, Row[]>;

interface Props {
  open: boolean;
  def: CollectionDef;
  initial: Row | null;
  mode: "create" | "edit";
  all: All;
  onOpenChange: (open: boolean) => void;
  onSave: (row: Row) => void;
}

const inputClass =
  "h-8 w-full rounded-sm border border-input bg-background px-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-[invalid=true]:border-negative";

function FieldControl({ field, def, draft, all, set, invalid }: { field: FieldDef; def: CollectionDef; draft: Row; all: All; set: (k: string, v: string) => void; invalid: boolean }) {
  const value = draft[field.key] ?? "";
  const id = `f-${field.key}`;
  if (field.type === "bool")
    return (
      <div className="flex h-8 items-center gap-2">
        <Switch id={id} checked={value === "Yes"} onCheckedChange={(c) => set(field.key, c ? "Yes" : "No")} />
        <span className="text-sm">{value === "Yes" ? "Yes" : "No"}</span>
      </div>
    );
  if (field.type === "select")
    return (
      <select id={id} className={cn(selectClass, "w-full")} value={value} aria-invalid={invalid} onChange={(e) => set(field.key, e.target.value)}>
        <option value="">Select…</option>
        {field.options?.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  if (field.type === "ref" && field.ref) {
    const target = collections[field.ref];
    let options = all[field.ref];
    // Self-referencing parent: exclude self and descendants; same group only.
    if (field.ref === def.key) {
      options = options.filter((r) => r.id !== draft.id && !isDescendant(all[def.key], r.id, draft.id, def.parentKey));
      if (def.key === "dimensionValues") options = options.filter((r) => r.dimension === draft.dimension);
    }
    return (
      <select id={id} className={cn(selectClass, "w-full")} value={value} aria-invalid={invalid} onChange={(e) => set(field.key, e.target.value)}>
        <option value="">{field.required ? "Select…" : "None"}</option>
        {options.map((r) => (
          <option key={r.id} value={r.id}>
            {recordLabel(target, r)}
            {r.status === "Inactive" ? " (Inactive)" : ""}
          </option>
        ))}
      </select>
    );
  }
  if (field.type === "refMulti" && field.ref) {
    const target = collections[field.ref];
    const selected = new Set(value.split(",").filter(Boolean));
    return (
      <div className="max-h-36 space-y-1 overflow-y-auto rounded-sm border border-input p-2" aria-invalid={invalid}>
        {all[field.ref].map((r) => (
          <label key={r.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.has(r.id)}
              onChange={(e) => {
                const next = new Set(selected);
                if (e.target.checked) next.add(r.id);
                else next.delete(r.id);
                set(field.key, [...next].join(","));
              }}
            />
            {recordLabel(target, r)}
          </label>
        ))}
      </div>
    );
  }
  if (field.type === "textarea")
    return (
      <textarea
        id={id}
        rows={2}
        className={cn(inputClass, "h-auto py-1.5")}
        value={value}
        aria-invalid={invalid}
        onChange={(e) => set(field.key, e.target.value)}
      />
    );
  return (
    <input
      id={id}
      type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
      className={inputClass}
      value={value}
      aria-invalid={invalid}
      onChange={(e) => set(field.key, e.target.value)}
    />
  );
}

/** Generic create/edit form driven by the collection schema. */
export function FormDialog({ open, def, initial, mode, all, onOpenChange, onSave }: Props) {
  const [draft, setDraft] = useState<Row>({ id: "" } as Row);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setDraft(initial ?? ({ id: "" } as Row));
      setErrors({});
    }
  }, [open, initial]);

  const set = (k: string, v: string) => setDraft((d) => ({ ...d, [k]: v }) as Row);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateRow(def, draft, all[def.key]);
    setErrors(errs);
    if (Object.keys(errs).length === 0) onSave(draft);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? `New ${def.singular}` : `Edit ${def.singular}`}
          </DialogTitle>
          <DialogDescription>Fields marked * are required. Values are validated before saving.</DialogDescription>
        </DialogHeader>
        <form id="record-form" onSubmit={submit} noValidate className="grid gap-3 sm:grid-cols-2">
          {def.fields
            .filter((f) => !f.readOnly)
            .map((f) => {
              const wide = f.type === "textarea" || f.type === "refMulti";
              return (
                <div key={f.key} className={cn("space-y-1", wide && "sm:col-span-2")}>
                  <label htmlFor={`f-${f.key}`} className="text-xs font-medium">
                    {f.label}
                    {f.required ? <span className="text-negative"> *</span> : null}
                  </label>
                  <FieldControl field={f} def={def} draft={draft} all={all} set={set} invalid={!!errors[f.key]} />
                  {errors[f.key] ? (
                    <p className="text-xs text-negative" role="alert">
                      {errors[f.key]}
                    </p>
                  ) : f.helper ? (
                    <p className="text-[11px] text-muted-foreground">{f.helper}</p>
                  ) : null}
                </div>
              );
            })}
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="record-form">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
