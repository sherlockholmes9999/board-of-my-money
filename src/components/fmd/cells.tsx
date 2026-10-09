import type { ReactNode } from "react";

import { NodeLink } from "@/components/fat/NodeLink";
import { StatusBadge } from "@/components/fat/StatusBadge";
import { collections } from "@/lib/fmd/repositories";
import { depth, displayValue, refLabel, validityState } from "@/lib/fmd/logic";
import type { CollectionDef, CollectionKey, FieldDef, Row } from "@/lib/fmd/schema";

type All = Record<CollectionKey, Row[]>;

export interface Column {
  id: string;
  label: string;
  value: (row: Row) => string;
  render: (row: Row) => ReactNode;
  numeric?: boolean;
}

const BADGE_KEYS = new Set(["status", "result", "severity"]);

export function RefLink({ refKey, id, all }: { refKey: CollectionKey; id: string; all: All }) {
  if (!id) return <span className="text-muted-foreground">—</span>;
  const target = all[refKey].find((r) => r.id === id);
  const label = refLabel(all, refKey, id);
  if (!target) return <span className="text-negative">Missing reference</span>;
  return (
    <NodeLink
      path={collections[refKey].route}
      selected={id}
      className="text-primary underline-offset-2 hover:underline"
    >
      {label}
    </NodeLink>
  );
}

export function renderField(all: All, field: FieldDef, row: Row): ReactNode {
  const v = row[field.key] ?? "";
  if (field.type === "ref" && field.ref) return <RefLink refKey={field.ref} id={v} all={all} />;
  if (field.type === "refMulti" && field.ref) {
    const ids = v.split(",").filter(Boolean);
    if (!ids.length) return <span className="text-muted-foreground">—</span>;
    return (
      <span className="flex flex-wrap gap-x-2 gap-y-0.5">
        {ids.map((id) => (
          <RefLink key={id} refKey={field.ref!} id={id} all={all} />
        ))}
      </span>
    );
  }
  if (field.type === "bool" || BADGE_KEYS.has(field.key)) return <StatusBadge value={v || "—"} />;
  if (!v) return <span className="text-muted-foreground">—</span>;
  return v;
}

export function computedValue(token: string, def: CollectionDef, row: Row, all: All): string {
  if (token === "@level") return String(depth(all[def.key], row, def.parentKey));
  if (token === "@validity" && def.dateRange) return validityState(row, def.dateRange[0], def.dateRange[1]);
  if (token === "@children") return String(all[def.key].filter((r) => r[def.parentKey ?? "parentId"] === row.id).length);
  return "";
}

const COMPUTED_LABEL: Record<string, string> = {
  "@level": "Level",
  "@validity": "Validation Status",
  "@children": "Children",
};

export function buildColumns(tokens: string[], def: CollectionDef, all: All): Column[] {
  return tokens.map((token) => {
    if (token.startsWith("@")) {
      return {
        id: token,
        label: COMPUTED_LABEL[token] ?? token,
        numeric: token === "@level" || token === "@children",
        value: (row) => computedValue(token, def, row, all),
        render: (row) => {
          const v = computedValue(token, def, row, all);
          return token === "@validity" ? <StatusBadge value={v} /> : <span className="num">{v}</span>;
        },
      };
    }
    const [key, label] = token.split(":");
    const field = def.fields.find((f) => f.key === key)!;
    return {
      id: key!,
      label: label ?? field.label,
      value: (row) => displayValue(all, field, row),
      render: (row) =>
        key === def.codeField ? (
          <span className="font-mono text-xs font-medium">{row[key!] || "—"}</span>
        ) : (
          renderField(all, field, row)
        ),
    };
  });
}

export function filterOptions(token: string, def: CollectionDef, all: All): { value: string; label: string }[] {
  if (token === "@validity")
    return ["Valid", "Expired", "Not Yet Valid", "Invalid", "Inactive"].map((v) => ({ value: v, label: v }));
  const field = def.fields.find((f) => f.key === token);
  if (!field) return [];
  if (field.type === "ref" && field.ref) {
    const used = new Set(all[def.key].map((r) => r[field.key]).filter(Boolean));
    return all[field.ref]
      .filter((r) => used.has(r.id))
      .map((r) => ({ value: r.id, label: refLabel(all, field.ref!, r.id) }));
  }
  if (field.type === "bool") return ["Yes", "No"].map((v) => ({ value: v, label: v }));
  if (field.options) return field.options.map((v) => ({ value: v, label: v }));
  const distinct = [...new Set(all[def.key].map((r) => r[field.key]).filter(Boolean))].sort();
  return distinct.map((v) => ({ value: v, label: v }));
}

export function filterLabel(token: string, def: CollectionDef) {
  if (token.startsWith("@")) return COMPUTED_LABEL[token] ?? token;
  return def.fields.find((f) => f.key === token)?.label ?? token;
}

export function rowMatchesFilter(token: string, value: string, def: CollectionDef, row: Row, all: All) {
  if (!value) return true;
  if (token.startsWith("@")) return computedValue(token, def, row, all) === value;
  return (row[token] ?? "") === value;
}
