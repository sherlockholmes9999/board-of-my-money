import type { CollectionKey } from "./schema";

/**
 * Column tokens: a field key, `key:Label` to relabel, or a computed column
 * prefixed with `@` (`@level`, `@validity`, `@children`).
 */
export interface TableView {
  kind: "table";
  collection: CollectionKey;
  columns: string[];
  filters: string[];
}

export interface TreeView {
  kind: "tree";
  collection: CollectionKey;
  /** Partition the tree by a ref field (e.g. one hierarchy per dimension). */
  groupBy?: string;
  columns: string[];
}

export type MasterView = TableView | TreeView;

const B = "/financial-master-data";

export const views: Record<string, MasterView> = {
  [`${B}/chart-of-accounts/account-structure`]: {
    kind: "table",
    collection: "accounts",
    columns: ["code", "name", "accountType", "parentId", "@level", "postingAllowed", "status", "effectiveFrom", "effectiveTo"],
    filters: ["accountType", "status", "postingAllowed"],
  },
  [`${B}/chart-of-accounts/account-hierarchy`]: {
    kind: "tree",
    collection: "accounts",
    columns: ["accountType", "postingAllowed", "status"],
  },
  [`${B}/chart-of-accounts/account-types`]: {
    kind: "table",
    collection: "accountTypes",
    columns: ["type", "description", "normalBalance", "postingAllowed", "status"],
    filters: ["normalBalance", "status"],
  },
  [`${B}/chart-of-accounts/account-control-rules`]: {
    kind: "table",
    collection: "accountControlRules",
    columns: ["ruleId", "ruleName", "accountType", "requiredDimension", "allowedPosting", "effectiveFrom", "effectiveTo", "status"],
    filters: ["accountType", "requiredDimension", "status"],
  },
  [`${B}/cost-centers/cost-center-hierarchy`]: {
    kind: "tree",
    collection: "costCenters",
    columns: ["owner", "@validity", "status"],
  },
  [`${B}/cost-centers/cost-center-ownership`]: {
    kind: "table",
    collection: "costCenters",
    columns: ["code", "name", "owner", "department", "validFrom:Effective From", "validTo:Effective To", "status"],
    filters: ["department", "owner", "status"],
  },
  [`${B}/cost-centers/cost-center-validity`]: {
    kind: "table",
    collection: "costCenters",
    columns: ["code", "name", "validFrom", "validTo", "status:Current Status", "@validity"],
    filters: ["status", "@validity"],
  },
  [`${B}/profit-centers/profit-center-hierarchy`]: {
    kind: "tree",
    collection: "profitCenters",
    columns: ["owner", "@validity", "status"],
  },
  [`${B}/profit-centers/profit-center-ownership`]: {
    kind: "table",
    collection: "profitCenters",
    columns: ["code", "name", "owner", "businessUnit", "validFrom:Effective From", "validTo:Effective To", "status"],
    filters: ["businessUnit", "owner", "status"],
  },
  [`${B}/profit-centers/profit-center-validity`]: {
    kind: "table",
    collection: "profitCenters",
    columns: ["code", "name", "validFrom", "validTo", "status:Current Status", "@validity"],
    filters: ["status", "@validity"],
  },
  [`${B}/financial-dimensions/dimension-definition`]: {
    kind: "table",
    collection: "dimensions",
    columns: ["code", "name", "description", "dataType", "required", "allowMultiple", "status"],
    filters: ["dataType", "required", "status"],
  },
  [`${B}/financial-dimensions/dimension-combinations`]: {
    kind: "table",
    collection: "dimensionCombinations",
    columns: ["combinationId", "account", "costCenter", "profitCenter", "status"],
    filters: ["account", "costCenter", "profitCenter", "status"],
  },
  [`${B}/financial-dimensions/dimension-validation`]: {
    kind: "table",
    collection: "dimensionValidation",
    columns: ["validationId", "ruleName", "accountScope", "dimension", "requirement", "status"],
    filters: ["accountScope", "dimension", "requirement", "status"],
  },
  [`${B}/financial-dimensions/dimension-hierarchies`]: {
    kind: "tree",
    collection: "dimensionValues",
    groupBy: "dimension",
    columns: ["status"],
  },
  [`${B}/legal-entity-finance-interface/legal-entity-structure`]: {
    kind: "tree",
    collection: "legalEntities",
    columns: ["country", "functionalCurrency", "reportingCurrency", "status"],
  },
  [`${B}/legal-entity-finance-interface/intercompany-rules`]: {
    kind: "table",
    collection: "intercompanyRules",
    columns: ["ruleId", "fromEntity", "toEntity", "transactionType", "requiredCounterparty", "postingRule", "status"],
    filters: ["fromEntity", "toEntity", "transactionType", "status"],
  },
  [`${B}/legal-entity-finance-interface/consolidation-scope`]: {
    kind: "table",
    collection: "consolidationScopes",
    columns: ["scopeId", "scopeName", "parentEntity", "includedEntities", "method", "effectiveFrom", "effectiveTo", "status"],
    filters: ["parentEntity", "method", "status"],
  },
  [`${B}/governance/data-ownership`]: {
    kind: "table",
    collection: "ownership",
    columns: ["domain", "object", "owner", "steward", "department", "status"],
    filters: ["domain", "owner", "status"],
  },
  [`${B}/governance/data-quality-rules`]: {
    kind: "table",
    collection: "qualityRules",
    columns: ["ruleId", "ruleName", "domain", "check", "severity", "status", "lastRun", "result"],
    filters: ["domain", "severity", "status"],
  },
  [`${B}/governance/change-control`]: {
    kind: "table",
    collection: "changeControl",
    columns: ["changeId", "domain", "object", "changeType", "requestedBy", "requestedDate", "status", "approvedBy", "effectiveDate"],
    filters: ["domain", "changeType", "status"],
  },
};

/** Short descriptions used by the module dashboard and submodule pages. */
export const areaDescriptions: Record<string, string> = {
  [`${B}/chart-of-accounts`]: "Account structures, hierarchy, account types and posting controls.",
  [`${B}/cost-centers`]: "Cost center structures, ownership and validity.",
  [`${B}/profit-centers`]: "Profit center structures, ownership and validity.",
  [`${B}/financial-dimensions`]: "Dimension definitions, combinations, validation and hierarchies.",
  [`${B}/legal-entity-finance-interface`]: "Legal entity structure, intercompany rules and consolidation scope.",
  [`${B}/governance`]: "Ownership, quality rules and controlled changes.",
};

export const leafDescriptions: Record<string, string> = {
  [`${B}/chart-of-accounts/account-structure`]: "Account master: codes, classification, parent, posting and effectivity.",
  [`${B}/chart-of-accounts/account-hierarchy`]: "Parent and child relationships of the chart of accounts.",
  [`${B}/chart-of-accounts/account-types`]: "Account classifications with normal balance and posting behaviour.",
  [`${B}/chart-of-accounts/account-control-rules`]: "Deterministic posting controls applied per account type.",
  [`${B}/cost-centers/cost-center-hierarchy`]: "Organisational structure of cost centers.",
  [`${B}/cost-centers/cost-center-ownership`]: "Accountable owner and department for every cost center.",
  [`${B}/cost-centers/cost-center-validity`]: "Validity windows and their evaluated state.",
  [`${B}/profit-centers/profit-center-hierarchy`]: "Organisational structure of profit centers.",
  [`${B}/profit-centers/profit-center-ownership`]: "Accountable owner and business unit for every profit center.",
  [`${B}/profit-centers/profit-center-validity`]: "Validity windows and their evaluated state.",
  [`${B}/financial-dimensions/dimension-definition`]: "Analytical dimensions available to financial postings.",
  [`${B}/financial-dimensions/dimension-combinations`]: "Permitted account and dimension value combinations.",
  [`${B}/financial-dimensions/dimension-validation`]: "Dimension requirements per account scope.",
  [`${B}/financial-dimensions/dimension-hierarchies`]: "Value hierarchies per dimension.",
  [`${B}/legal-entity-finance-interface/legal-entity-structure`]: "Group legal entity hierarchy, countries and currencies.",
  [`${B}/legal-entity-finance-interface/intercompany-rules`]: "Posting rules between legal entities.",
  [`${B}/legal-entity-finance-interface/consolidation-scope`]: "Entities included in each consolidation scope.",
  [`${B}/governance/data-ownership`]: "Owner and steward for each master data domain.",
  [`${B}/governance/data-quality-rules`]: "Deterministic quality checks and their latest results.",
  [`${B}/governance/change-control`]: "Register of controlled changes and their lifecycle.",
};
