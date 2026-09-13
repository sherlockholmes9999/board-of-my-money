export type FieldType = "text" | "select" | "date" | "number";

export interface FieldDef {
  key: string;
  label: string;
  type?: FieldType;
  options?: string[];
  required?: boolean;
}

export interface TableRow {
  id: string;
  [key: string]: string;
}

export interface TableDataset {
  storageKey: string;
  description: string;
  /** Column used for the status filter and badge rendering. */
  statusKey?: string;
  fields: FieldDef[];
  seed: TableRow[];
}

const STATUS = ["Active", "Inactive", "Draft"];
const SEVERITY = ["Error", "Warning", "Information"];
const YES_NO = ["Yes", "No"];

function rows(prefix: string, data: Record<string, string>[]): TableRow[] {
  return data.map((row, index) => ({ id: `${prefix}_${index + 1}`, ...row }) as TableRow);
}

export const tableDatasets: Record<string, TableDataset> = {
  "/financial-master-data/chart-of-accounts/account-structure": {
    storageKey: "account-structure",
    description:
      "Maintain the operational chart of accounts. Each account carries a code, classification, parent and validity.",
    statusKey: "status",
    fields: [
      { key: "code", label: "Account Code", required: true },
      { key: "name", label: "Account Name", required: true },
      {
        key: "accountType",
        label: "Account Type",
        type: "select",
        options: ["Asset", "Liability", "Equity", "Revenue", "Expense"],
      },
      { key: "parent", label: "Parent Account" },
      { key: "status", label: "Status", type: "select", options: STATUS },
      { key: "effectiveDate", label: "Effective Date", type: "date" },
    ],
    seed: rows("acc", [
      { code: "1000", name: "Assets", accountType: "Asset", parent: "—", status: "Active", effectiveDate: "2024-01-01" },
      { code: "1100", name: "Current Assets", accountType: "Asset", parent: "1000", status: "Active", effectiveDate: "2024-01-01" },
      { code: "1110", name: "Cash", accountType: "Asset", parent: "1100", status: "Active", effectiveDate: "2024-01-01" },
      { code: "1120", name: "Bank", accountType: "Asset", parent: "1100", status: "Active", effectiveDate: "2024-01-01" },
      { code: "1130", name: "Accounts Receivable", accountType: "Asset", parent: "1100", status: "Active", effectiveDate: "2024-01-01" },
      { code: "1200", name: "Non-Current Assets", accountType: "Asset", parent: "1000", status: "Active", effectiveDate: "2024-01-01" },
      { code: "1210", name: "Property", accountType: "Asset", parent: "1200", status: "Active", effectiveDate: "2024-01-01" },
      { code: "1220", name: "Equipment", accountType: "Asset", parent: "1200", status: "Active", effectiveDate: "2024-01-01" },
      { code: "2000", name: "Liabilities", accountType: "Liability", parent: "—", status: "Active", effectiveDate: "2024-01-01" },
      { code: "2100", name: "Accounts Payable", accountType: "Liability", parent: "2000", status: "Active", effectiveDate: "2024-01-01" },
      { code: "2200", name: "Loans Payable", accountType: "Liability", parent: "2000", status: "Active", effectiveDate: "2024-01-01" },
      { code: "3000", name: "Equity", accountType: "Equity", parent: "—", status: "Active", effectiveDate: "2024-01-01" },
      { code: "3100", name: "Retained Earnings", accountType: "Equity", parent: "3000", status: "Active", effectiveDate: "2024-01-01" },
      { code: "4000", name: "Revenue", accountType: "Revenue", parent: "—", status: "Active", effectiveDate: "2024-01-01" },
      { code: "4100", name: "Product Revenue", accountType: "Revenue", parent: "4000", status: "Active", effectiveDate: "2024-01-01" },
      { code: "4200", name: "Service Revenue", accountType: "Revenue", parent: "4000", status: "Draft", effectiveDate: "2025-01-01" },
      { code: "5000", name: "Expenses", accountType: "Expense", parent: "—", status: "Active", effectiveDate: "2024-01-01" },
      { code: "5100", name: "Personnel Expense", accountType: "Expense", parent: "5000", status: "Active", effectiveDate: "2024-01-01" },
      { code: "5200", name: "Facility Expense", accountType: "Expense", parent: "5000", status: "Active", effectiveDate: "2024-01-01" },
      { code: "5300", name: "Depreciation Expense", accountType: "Expense", parent: "5000", status: "Inactive", effectiveDate: "2023-01-01" },
    ]),
  },

  "/financial-master-data/chart-of-accounts/account-types": {
    storageKey: "account-types",
    description: "Configure account classifications, their normal balance and posting behaviour.",
    statusKey: "status",
    fields: [
      { key: "type", label: "Type", required: true },
      { key: "description", label: "Description" },
      { key: "normalBalance", label: "Normal Balance", type: "select", options: ["Debit", "Credit"] },
      { key: "postingAllowed", label: "Posting Allowed", type: "select", options: YES_NO },
      { key: "status", label: "Status", type: "select", options: STATUS },
    ],
    seed: rows("typ", [
      { type: "Asset", description: "Resources controlled by the entity", normalBalance: "Debit", postingAllowed: "Yes", status: "Active" },
      { type: "Liability", description: "Present obligations of the entity", normalBalance: "Credit", postingAllowed: "Yes", status: "Active" },
      { type: "Equity", description: "Residual interest in the entity", normalBalance: "Credit", postingAllowed: "No", status: "Active" },
      { type: "Revenue", description: "Income arising from ordinary activities", normalBalance: "Credit", postingAllowed: "Yes", status: "Active" },
      { type: "Expense", description: "Outflows arising from ordinary activities", normalBalance: "Debit", postingAllowed: "Yes", status: "Active" },
    ]),
  },

  "/financial-master-data/chart-of-accounts/account-control-rules": {
    storageKey: "account-control-rules",
    description:
      "Deterministic posting controls applied to accounts. Rules are configuration records, evaluated in order.",
    statusKey: "status",
    fields: [
      { key: "ruleId", label: "Rule ID", required: true },
      { key: "ruleName", label: "Rule Name", required: true },
      {
        key: "accountType",
        label: "Account Type",
        type: "select",
        options: ["Asset", "Liability", "Equity", "Revenue", "Expense", "All"],
      },
      { key: "requiredDimension", label: "Required Dimension" },
      { key: "allowedPosting", label: "Allowed Posting", type: "select", options: ["Manual", "Automatic", "Both", "None"] },
      { key: "status", label: "Status", type: "select", options: STATUS },
    ],
    seed: rows("acr", [
      { ruleId: "CR-001", ruleName: "Expense requires cost center", accountType: "Expense", requiredDimension: "Cost Center", allowedPosting: "Both", status: "Active" },
      { ruleId: "CR-002", ruleName: "Revenue requires profit center", accountType: "Revenue", requiredDimension: "Profit Center", allowedPosting: "Both", status: "Active" },
      { ruleId: "CR-003", ruleName: "Equity manual posting blocked", accountType: "Equity", requiredDimension: "—", allowedPosting: "None", status: "Active" },
      { ruleId: "CR-004", ruleName: "Bank accounts automatic only", accountType: "Asset", requiredDimension: "Bank Account", allowedPosting: "Automatic", status: "Active" },
      { ruleId: "CR-005", ruleName: "Project expense requires project", accountType: "Expense", requiredDimension: "Project", allowedPosting: "Both", status: "Draft" },
    ]),
  },

  "/financial-master-data/cost-centers/cost-center-ownership": {
    storageKey: "cost-center-ownership",
    description: "Accountable owner and organisational assignment for every cost center.",
    statusKey: "status",
    fields: [
      { key: "costCenter", label: "Cost Center", required: true },
      { key: "owner", label: "Owner", required: true },
      { key: "department", label: "Department" },
      { key: "effectiveDate", label: "Effective Date", type: "date" },
      { key: "status", label: "Status", type: "select", options: STATUS },
    ],
    seed: rows("cco", [
      { costCenter: "CC-1000 Corporate", owner: "N. Farouk", department: "Corporate", effectiveDate: "2024-01-01", status: "Active" },
      { costCenter: "CC-1100 Finance", owner: "S. Meyer", department: "Finance", effectiveDate: "2024-01-01", status: "Active" },
      { costCenter: "CC-1200 Information Technology", owner: "A. Rahman", department: "IT", effectiveDate: "2024-04-01", status: "Active" },
      { costCenter: "CC-2100 Manufacturing", owner: "L. Okafor", department: "Operations", effectiveDate: "2024-01-01", status: "Active" },
      { costCenter: "CC-2200 Logistics", owner: "M. Duarte", department: "Operations", effectiveDate: "2025-01-01", status: "Draft" },
      { costCenter: "CC-3100 Sales Europe", owner: "K. Lindqvist", department: "Commercial", effectiveDate: "2024-07-01", status: "Active" },
    ]),
  },

  "/financial-master-data/cost-centers/cost-center-validity": {
    storageKey: "cost-center-validity",
    description: "Validity windows control the periods in which a cost center may be posted to.",
    statusKey: "status",
    fields: [
      { key: "costCenter", label: "Cost Center", required: true },
      { key: "validFrom", label: "Valid From", type: "date" },
      { key: "validTo", label: "Valid To", type: "date" },
      { key: "status", label: "Status", type: "select", options: STATUS },
      { key: "validationState", label: "Validation State", type: "select", options: ["Validated", "Pending", "Failed"] },
    ],
    seed: rows("ccv", [
      { costCenter: "CC-1000 Corporate", validFrom: "2024-01-01", validTo: "2099-12-31", status: "Active", validationState: "Validated" },
      { costCenter: "CC-1100 Finance", validFrom: "2024-01-01", validTo: "2099-12-31", status: "Active", validationState: "Validated" },
      { costCenter: "CC-1200 Information Technology", validFrom: "2024-04-01", validTo: "2099-12-31", status: "Active", validationState: "Validated" },
      { costCenter: "CC-2100 Manufacturing", validFrom: "2024-01-01", validTo: "2026-12-31", status: "Active", validationState: "Pending" },
      { costCenter: "CC-2200 Logistics", validFrom: "2025-01-01", validTo: "2099-12-31", status: "Draft", validationState: "Pending" },
      { costCenter: "CC-9000 Legacy Plant", validFrom: "2019-01-01", validTo: "2023-12-31", status: "Inactive", validationState: "Failed" },
    ]),
  },

  "/financial-master-data/profit-centers/profit-center-ownership": {
    storageKey: "profit-center-ownership",
    description: "Accountable owner and organisational assignment for every profit center.",
    statusKey: "status",
    fields: [
      { key: "profitCenter", label: "Profit Center", required: true },
      { key: "owner", label: "Owner", required: true },
      { key: "department", label: "Department" },
      { key: "effectiveDate", label: "Effective Date", type: "date" },
      { key: "status", label: "Status", type: "select", options: STATUS },
    ],
    seed: rows("pco", [
      { profitCenter: "PC-1000 Group", owner: "R. Castellano", department: "Corporate", effectiveDate: "2024-01-01", status: "Active" },
      { profitCenter: "PC-1100 Industrial Products", owner: "H. Bauer", department: "Industrial", effectiveDate: "2024-01-01", status: "Active" },
      { profitCenter: "PC-1200 Services", owner: "T. Alvarez", department: "Services", effectiveDate: "2024-01-01", status: "Active" },
      { profitCenter: "PC-2100 Region EMEA", owner: "D. Haddad", department: "Commercial", effectiveDate: "2024-01-01", status: "Active" },
      { profitCenter: "PC-2200 Region APAC", owner: "Y. Tanaka", department: "Commercial", effectiveDate: "2025-01-01", status: "Draft" },
    ]),
  },

  "/financial-master-data/profit-centers/profit-center-validity": {
    storageKey: "profit-center-validity",
    description: "Validity windows control the periods in which a profit center may be posted to.",
    statusKey: "status",
    fields: [
      { key: "profitCenter", label: "Profit Center", required: true },
      { key: "validFrom", label: "Valid From", type: "date" },
      { key: "validTo", label: "Valid To", type: "date" },
      { key: "status", label: "Status", type: "select", options: STATUS },
      { key: "validationState", label: "Validation State", type: "select", options: ["Validated", "Pending", "Failed"] },
    ],
    seed: rows("pcv", [
      { profitCenter: "PC-1000 Group", validFrom: "2024-01-01", validTo: "2099-12-31", status: "Active", validationState: "Validated" },
      { profitCenter: "PC-1100 Industrial Products", validFrom: "2024-01-01", validTo: "2099-12-31", status: "Active", validationState: "Validated" },
      { profitCenter: "PC-1200 Services", validFrom: "2024-01-01", validTo: "2099-12-31", status: "Active", validationState: "Pending" },
      { profitCenter: "PC-2200 Region APAC", validFrom: "2025-01-01", validTo: "2099-12-31", status: "Draft", validationState: "Pending" },
    ]),
  },

  "/financial-master-data/financial-dimensions/dimension-definition": {
    storageKey: "dimension-definition",
    description: "Definition of the analytical dimensions available to financial postings.",
    statusKey: "status",
    fields: [
      { key: "dimension", label: "Dimension", required: true },
      { key: "name", label: "Name", required: true },
      { key: "description", label: "Description" },
      { key: "dataType", label: "Data Type", type: "select", options: ["Text", "Code", "Numeric", "Date", "Reference"] },
      { key: "required", label: "Required", type: "select", options: YES_NO },
      { key: "status", label: "Status", type: "select", options: STATUS },
    ],
    seed: rows("dim", [
      { dimension: "DIM-CC", name: "Cost Center", description: "Responsibility unit carrying cost", dataType: "Reference", required: "Yes", status: "Active" },
      { dimension: "DIM-PC", name: "Profit Center", description: "Responsibility unit carrying result", dataType: "Reference", required: "Yes", status: "Active" },
      { dimension: "DIM-PRJ", name: "Project", description: "Project or work breakdown element", dataType: "Code", required: "No", status: "Active" },
      { dimension: "DIM-PRD", name: "Product Line", description: "Commercial product grouping", dataType: "Code", required: "No", status: "Active" },
      { dimension: "DIM-REG", name: "Region", description: "Geographic reporting region", dataType: "Code", required: "No", status: "Active" },
      { dimension: "DIM-CHN", name: "Sales Channel", description: "Route to market", dataType: "Code", required: "No", status: "Draft" },
    ]),
  },

  "/financial-master-data/financial-dimensions/dimension-combinations": {
    storageKey: "dimension-combinations",
    description: "Permitted combinations of dimension values used when validating a posting.",
    statusKey: "status",
    fields: [
      { key: "combinationId", label: "Combination ID", required: true },
      { key: "dimensionA", label: "Dimension A" },
      { key: "valueA", label: "Value A" },
      { key: "dimensionB", label: "Dimension B" },
      { key: "valueB", label: "Value B" },
      { key: "rule", label: "Rule", type: "select", options: ["Allowed", "Blocked"] },
      { key: "status", label: "Status", type: "select", options: STATUS },
    ],
    seed: rows("dcb", [
      { combinationId: "CMB-001", dimensionA: "Cost Center", valueA: "CC-1100", dimensionB: "Project", valueB: "PRJ-FIN-01", rule: "Allowed", status: "Active" },
      { combinationId: "CMB-002", dimensionA: "Cost Center", valueA: "CC-2100", dimensionB: "Product Line", valueB: "PL-IND", rule: "Allowed", status: "Active" },
      { combinationId: "CMB-003", dimensionA: "Profit Center", valueA: "PC-2100", dimensionB: "Region", valueB: "EMEA", rule: "Allowed", status: "Active" },
      { combinationId: "CMB-004", dimensionA: "Profit Center", valueA: "PC-1200", dimensionB: "Product Line", valueB: "PL-IND", rule: "Blocked", status: "Active" },
      { combinationId: "CMB-005", dimensionA: "Cost Center", valueA: "CC-9000", dimensionB: "Project", valueB: "Any", rule: "Blocked", status: "Inactive" },
    ]),
  },

  "/financial-master-data/financial-dimensions/dimension-validation": {
    storageKey: "dimension-validation",
    description: "Validation rules applied to dimension values at entry and at posting.",
    statusKey: "status",
    fields: [
      { key: "ruleId", label: "Rule ID", required: true },
      { key: "ruleName", label: "Rule Name", required: true },
      { key: "dimension", label: "Dimension" },
      { key: "condition", label: "Condition" },
      { key: "severity", label: "Severity", type: "select", options: SEVERITY },
      { key: "status", label: "Status", type: "select", options: STATUS },
    ],
    seed: rows("dvr", [
      { ruleId: "DV-001", ruleName: "Cost center must be valid on posting date", dimension: "Cost Center", condition: "date within validity", severity: "Error", status: "Active" },
      { ruleId: "DV-002", ruleName: "Project required for capital expense", dimension: "Project", condition: "account group = CAPEX", severity: "Error", status: "Active" },
      { ruleId: "DV-003", ruleName: "Region should match profit center", dimension: "Region", condition: "region in profit center scope", severity: "Warning", status: "Active" },
      { ruleId: "DV-004", ruleName: "Sales channel recommended on revenue", dimension: "Sales Channel", condition: "account type = Revenue", severity: "Information", status: "Draft" },
    ]),
  },

  "/financial-master-data/legal-entity-finance-interface/intercompany-rules": {
    storageKey: "intercompany-rules",
    description: "Clearing configuration governing transactions between legal entities.",
    statusKey: "status",
    fields: [
      { key: "ruleId", label: "Rule ID", required: true },
      { key: "fromEntity", label: "From Entity", required: true },
      { key: "toEntity", label: "To Entity", required: true },
      { key: "transactionType", label: "Transaction Type", type: "select", options: ["Trading", "Financing", "Service Charge", "Cost Recharge", "Dividend"] },
      { key: "clearingAccount", label: "Clearing Account" },
      { key: "status", label: "Status", type: "select", options: STATUS },
    ],
    seed: rows("icr", [
      { ruleId: "IC-001", fromEntity: "LE-100 Group Holding", toEntity: "LE-200 Manufacturing BV", transactionType: "Financing", clearingAccount: "1650", status: "Active" },
      { ruleId: "IC-002", fromEntity: "LE-200 Manufacturing BV", toEntity: "LE-300 Sales GmbH", transactionType: "Trading", clearingAccount: "1651", status: "Active" },
      { ruleId: "IC-003", fromEntity: "LE-100 Group Holding", toEntity: "LE-300 Sales GmbH", transactionType: "Service Charge", clearingAccount: "1652", status: "Active" },
      { ruleId: "IC-004", fromEntity: "LE-300 Sales GmbH", toEntity: "LE-400 Services Ltd", transactionType: "Cost Recharge", clearingAccount: "1653", status: "Draft" },
    ]),
  },

  "/financial-master-data/legal-entity-finance-interface/consolidation-scope": {
    storageKey: "consolidation-scope",
    description: "Entities included in each consolidation scope, with method and ownership.",
    statusKey: "status",
    fields: [
      { key: "scope", label: "Scope", required: true },
      { key: "entity", label: "Entity", required: true },
      { key: "method", label: "Method", type: "select", options: ["Full", "Proportional", "Equity", "Excluded"] },
      { key: "ownership", label: "Ownership %", type: "number" },
      { key: "currency", label: "Currency" },
      { key: "status", label: "Status", type: "select", options: STATUS },
    ],
    seed: rows("csc", [
      { scope: "Group IFRS", entity: "LE-100 Group Holding", method: "Full", ownership: "100", currency: "EUR", status: "Active" },
      { scope: "Group IFRS", entity: "LE-200 Manufacturing BV", method: "Full", ownership: "100", currency: "EUR", status: "Active" },
      { scope: "Group IFRS", entity: "LE-300 Sales GmbH", method: "Full", ownership: "90", currency: "EUR", status: "Active" },
      { scope: "Group IFRS", entity: "LE-400 Services Ltd", method: "Equity", ownership: "35", currency: "GBP", status: "Active" },
      { scope: "Local GAAP NL", entity: "LE-200 Manufacturing BV", method: "Full", ownership: "100", currency: "EUR", status: "Active" },
      { scope: "Group IFRS", entity: "LE-500 Treasury SA", method: "Excluded", ownership: "100", currency: "CHF", status: "Draft" },
    ]),
  },

  "/financial-master-data/governance/data-ownership": {
    storageKey: "data-ownership",
    description: "Accountable owner and data steward for every financial master data domain.",
    statusKey: "status",
    fields: [
      { key: "domain", label: "Data Domain", required: true },
      { key: "owner", label: "Owner", required: true },
      { key: "steward", label: "Steward" },
      { key: "status", label: "Status", type: "select", options: STATUS },
    ],
    seed: rows("dow", [
      { domain: "Chart Of Accounts", owner: "Group Controller", steward: "S. Meyer", status: "Active" },
      { domain: "Cost Centers", owner: "Head of Controlling", steward: "A. Rahman", status: "Active" },
      { domain: "Profit Centers", owner: "Head of Controlling", steward: "H. Bauer", status: "Active" },
      { domain: "Financial Dimensions", owner: "Finance Data Office", steward: "M. Duarte", status: "Active" },
      { domain: "Legal Entities", owner: "Group Legal", steward: "R. Castellano", status: "Active" },
      { domain: "Consolidation Scope", owner: "Group Reporting", steward: "K. Lindqvist", status: "Draft" },
    ]),
  },

  "/financial-master-data/governance/data-quality-rules": {
    storageKey: "data-quality-rules",
    description: "Deterministic quality checks executed against master data records.",
    statusKey: "status",
    fields: [
      { key: "rule", label: "Rule", required: true },
      { key: "domain", label: "Domain" },
      { key: "validation", label: "Validation" },
      { key: "severity", label: "Severity", type: "select", options: SEVERITY },
      { key: "status", label: "Status", type: "select", options: STATUS },
    ],
    seed: rows("dqr", [
      { rule: "Unique account code", domain: "Chart Of Accounts", validation: "code is unique across the ledger", severity: "Error", status: "Active" },
      { rule: "Parent account exists", domain: "Chart Of Accounts", validation: "parent resolves to an active account", severity: "Error", status: "Active" },
      { rule: "Cost center owner assigned", domain: "Cost Centers", validation: "owner is not empty", severity: "Warning", status: "Active" },
      { rule: "Validity window closed", domain: "Cost Centers", validation: "valid to >= valid from", severity: "Error", status: "Active" },
      { rule: "Dimension description present", domain: "Financial Dimensions", validation: "description is not empty", severity: "Information", status: "Active" },
      { rule: "Ownership percentage bounded", domain: "Consolidation Scope", validation: "0 < ownership <= 100", severity: "Error", status: "Draft" },
    ]),
  },

  "/financial-master-data/governance/change-control": {
    storageKey: "change-control",
    description: "Change requests raised against financial master data objects and their approval state.",
    statusKey: "status",
    fields: [
      { key: "changeId", label: "Change ID", required: true },
      { key: "object", label: "Object", required: true },
      { key: "requestedBy", label: "Requested By" },
      { key: "requestedDate", label: "Requested Date", type: "date" },
      { key: "status", label: "Status", type: "select", options: ["Draft", "Submitted", "Approved", "Rejected"] },
      { key: "approval", label: "Approval" },
    ],
    seed: rows("chg", [
      { changeId: "CHG-1001", object: "Account 4200 Service Revenue", requestedBy: "S. Meyer", requestedDate: "2026-08-14", status: "Submitted", approval: "Group Controller" },
      { changeId: "CHG-1002", object: "Cost Center CC-2200 Logistics", requestedBy: "M. Duarte", requestedDate: "2026-08-20", status: "Approved", approval: "Head of Controlling" },
      { changeId: "CHG-1003", object: "Dimension DIM-CHN Sales Channel", requestedBy: "K. Lindqvist", requestedDate: "2026-08-28", status: "Draft", approval: "—" },
      { changeId: "CHG-1004", object: "Consolidation Scope Group IFRS", requestedBy: "R. Castellano", requestedDate: "2026-09-02", status: "Rejected", approval: "Group Reporting" },
      { changeId: "CHG-1005", object: "Control Rule CR-005", requestedBy: "A. Rahman", requestedDate: "2026-09-08", status: "Submitted", approval: "Finance Data Office" },
    ]),
  },
};
