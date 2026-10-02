export type Row = { id: string } & Record<string, string>;

export type FieldType = "text" | "textarea" | "select" | "date" | "number" | "bool" | "ref" | "refMulti";

export type CollectionKey =
  | "accounts"
  | "accountTypes"
  | "accountControlRules"
  | "costCenters"
  | "profitCenters"
  | "dimensions"
  | "dimensionValues"
  | "dimensionCombinations"
  | "dimensionValidation"
  | "legalEntities"
  | "intercompanyRules"
  | "consolidationScopes"
  | "ownership"
  | "qualityRules"
  | "changeControl";

export interface FieldDef {
  key: string;
  label: string;
  type?: FieldType;
  options?: string[];
  /** Target collection for ref / refMulti fields. */
  ref?: CollectionKey;
  required?: boolean;
  unique?: boolean;
  helper?: string;
  /** Hidden from the form (system / computed values). */
  readOnly?: boolean;
}

export interface CollectionDef {
  key: CollectionKey;
  singular: string;
  /** Canonical route where records of this collection are maintained. */
  route: string;
  codeField: string;
  nameField?: string;
  /** When true, records have an Active/Inactive status and support deactivation. */
  statusful: boolean;
  fields: FieldDef[];
  /** Date range pair that must satisfy from <= to. */
  dateRange?: [string, string];
  /** Self-referencing parent field (hierarchical collections). */
  parentKey?: string;
  seed: Row[];
}
