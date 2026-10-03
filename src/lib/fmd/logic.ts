import { collections } from "./repositories";
import type { CollectionDef, CollectionKey, FieldDef, Row } from "./schema";

type All = Record<CollectionKey, Row[]>;

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function recordLabel(def: CollectionDef, row: Row | undefined): string {
  if (!row) return "—";
  const code = row[def.codeField] ?? "";
  const name = def.nameField ? row[def.nameField] : "";
  return name ? `${code} ${name}` : code;
}

export function refLabel(all: All, key: CollectionKey, id: string): string {
  if (!id) return "—";
  return recordLabel(collections[key], all[key].find((r) => r.id === id));
}

/** Plain display string for a field value (used for search/sort/render). */
export function displayValue(all: All, field: FieldDef, row: Row): string {
  const value = row[field.key] ?? "";
  if (field.type === "ref" && field.ref) return value ? refLabel(all, field.ref, value) : "—";
  if (field.type === "refMulti" && field.ref) {
    const ids = value.split(",").filter(Boolean);
    return ids.length ? ids.map((id) => refLabel(all, field.ref!, id)).join(", ") : "—";
  }
  return value || "—";
}

export function depth(rows: Row[], row: Row, parentKey = "parentId"): number {
  let level = 1;
  let current = row;
  const seen = new Set<string>();
  while (current[parentKey] && !seen.has(current.id)) {
    seen.add(current.id);
    const parent = rows.find((r) => r.id === current[parentKey]);
    if (!parent) break;
    level += 1;
    current = parent;
  }
  return level;
}

export function isDescendant(rows: Row[], candidateId: string, ancestorId: string, parentKey = "parentId") {
  let current = rows.find((r) => r.id === candidateId);
  const seen = new Set<string>();
  while (current && !seen.has(current.id)) {
    if (current.id === ancestorId) return true;
    seen.add(current.id);
    current = rows.find((r) => r.id === current![parentKey]);
  }
  return false;
}

export type ValidityState = "Valid" | "Expired" | "Not Yet Valid" | "Invalid" | "Inactive";

/** Deterministic validity check from dates and status. */
export function validityState(row: Row, from: string, to: string): ValidityState {
  const f = row[from] ?? "";
  const t = row[to] ?? "";
  if (!f || (t && t < f)) return "Invalid";
  if (row.status === "Inactive") return "Inactive";
  const today = todayISO();
  if (f > today) return "Not Yet Valid";
  if (t && t < today) return "Expired";
  return "Valid";
}

/** Form validation: required, unique, date range, hierarchy integrity. */
export function validateRow(
  def: CollectionDef,
  draft: Row,
  rows: Row[],
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of def.fields) {
    if (f.readOnly) continue;
    const v = (draft[f.key] ?? "").trim();
    if (f.required && !v) errors[f.key] = `${f.label} is required.`;
    if (f.unique && v) {
      const dup = rows.find((r) => r.id !== draft.id && (r[f.key] ?? "").trim().toLowerCase() === v.toLowerCase());
      if (dup) errors[f.key] = `${f.label} "${v}" already exists.`;
    }
    if (f.type === "number" && v && Number.isNaN(Number(v))) errors[f.key] = `${f.label} must be a number.`;
  }
  if (def.dateRange) {
    const [a, b] = def.dateRange;
    if (draft[a] && draft[b] && draft[b] < draft[a]) errors[b] = "End date cannot be before start date.";
  }
  if (def.parentKey && draft[def.parentKey]) {
    if (draft[def.parentKey] === draft.id) errors[def.parentKey] = "A record cannot be its own parent.";
    else if (isDescendant(rows, draft[def.parentKey], draft.id, def.parentKey))
      errors[def.parentKey] = "Parent cannot be one of this record's descendants.";
  }
  if (def.key === "intercompanyRules" && draft.fromEntity && draft.fromEntity === draft.toEntity)
    errors.toEntity = "From and To entity must differ.";
  if (def.key === "dimensionValues" && draft.parentId) {
    const parent = rows.find((r) => r.id === draft.parentId);
    if (parent && parent.dimension !== draft.dimension) errors.parentId = "Parent value must belong to the same dimension.";
  }
  return errors;
}

export interface Reference {
  collection: CollectionKey;
  field: FieldDef;
  row: Row;
}

/** Records in other collections pointing at this record. */
export function referencesTo(all: All, key: CollectionKey, id: string): Reference[] {
  const out: Reference[] = [];
  for (const def of Object.values(collections)) {
    for (const field of def.fields) {
      if (field.ref !== key) continue;
      for (const row of all[def.key]) {
        if (row.id === id) continue;
        const v = row[field.key] ?? "";
        const hit = field.type === "refMulti" ? v.split(",").includes(id) : v === id;
        if (hit) out.push({ collection: def.key, field, row });
      }
    }
  }
  return out;
}

const DOMAIN_COLLECTION: Record<string, CollectionKey> = {
  "Chart Of Accounts": "accounts",
  "Cost Centers": "costCenters",
  "Profit Centers": "profitCenters",
  "Financial Dimensions": "dimensions",
  "Legal Entities": "legalEntities",
};

/** Executes a deterministic data quality check; returns failing record count. */
export function runQualityCheck(all: All, rule: Row): { failed: number; total: number } {
  const key = DOMAIN_COLLECTION[rule.domain ?? ""] ?? "accounts";
  const def = collections[key];
  const rows = all[key];
  let failed = 0;
  switch (rule.check) {
    case "Unique codes": {
      const seen = new Map<string, number>();
      for (const r of rows) seen.set(r[def.codeField] ?? "", (seen.get(r[def.codeField] ?? "") ?? 0) + 1);
      failed = rows.filter((r) => (seen.get(r[def.codeField] ?? "") ?? 0) > 1).length;
      break;
    }
    case "Parent exists":
      failed = def.parentKey
        ? rows.filter((r) => r[def.parentKey!] && !rows.some((p) => p.id === r[def.parentKey!])).length
        : 0;
      break;
    case "Owner assigned":
      failed = rows.filter((r) => "owner" in r && !(r.owner ?? "").trim()).length;
      break;
    case "Valid date range":
      failed = def.dateRange
        ? rows.filter((r) => validityState(r, def.dateRange![0], def.dateRange![1]) === "Invalid").length
        : 0;
      break;
    case "Currencies assigned":
      failed = rows.filter((r) => "functionalCurrency" in r && (!r.functionalCurrency || !r.reportingCurrency)).length;
      break;
  }
  return { failed, total: rows.length };
}

export const CHANGE_FLOW = ["Draft", "Submitted", "Under Review", "Approved", "Implemented"] as const;
