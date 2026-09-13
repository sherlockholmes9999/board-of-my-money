/**
 * Canonical Finance Accounting Treasury application tree (the SRS).
 * Names and hierarchy must never be altered — only `implemented` may evolve.
 */

export type NodeType = "root" | "module" | "submodule" | "leaf" | "subleaf";

export interface FinanceNode {
  id: string;
  name: string;
  type: NodeType;
  parentId: string | null;
  path: string;
  children: FinanceNode[];
  implemented: boolean;
}

interface RawNode {
  name: string;
  slug?: string;
  children?: RawNode[];
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const RAW: RawNode[] = [
  {
    name: "Financial Master Data",
    children: [
      {
        name: "Chart Of Accounts",
        children: [
          { name: "Account Structure" },
          { name: "Account Hierarchy" },
          { name: "Account Types" },
          { name: "Account Control Rules" },
        ],
      },
      {
        name: "Cost Centers",
        children: [
          { name: "Cost Center Hierarchy" },
          { name: "Cost Center Ownership" },
          { name: "Cost Center Validity" },
        ],
      },
      {
        name: "Profit Centers",
        children: [
          { name: "Profit Center Hierarchy" },
          { name: "Profit Center Ownership" },
          { name: "Profit Center Validity" },
        ],
      },
      {
        name: "Financial Dimensions",
        children: [
          { name: "Dimension Definition" },
          { name: "Dimension Combinations" },
          { name: "Dimension Validation" },
          { name: "Dimension Hierarchies" },
        ],
      },
      {
        name: "Legal Entity Finance Interface",
        children: [
          { name: "Legal Entity Structure" },
          { name: "Intercompany Rules" },
          { name: "Consolidation Scope" },
        ],
      },
      {
        name: "Financial Master Data Governance",
        slug: "governance",
        children: [
          { name: "Data Ownership" },
          { name: "Data Quality Rules" },
          { name: "Change Control" },
        ],
      },
    ],
  },
  {
    name: "Accounting",
    children: [
      {
        name: "General Ledger",
        children: [
          { name: "Journal Entry" },
          { name: "Journal Approval" },
          { name: "Posting Rules" },
          { name: "Period Control" },
          { name: "Ledger Inquiry" },
        ],
      },
      {
        name: "Accounts Payable",
        children: [
          { name: "Vendor Invoice Capture" },
          { name: "Invoice Matching" },
          { name: "Invoice Approval" },
          { name: "Payment Proposal" },
          { name: "Vendor Payment" },
        ],
      },
      {
        name: "Accounts Receivable",
        children: [
          { name: "Customer Invoice" },
          { name: "Credit Memo" },
          { name: "Cash Application" },
          { name: "Dunning" },
          { name: "Customer Payment" },
        ],
      },
      {
        name: "Fixed Assets Accounting",
        children: [
          { name: "Asset Capitalization" },
          { name: "Depreciation Calculation" },
          { name: "Asset Transfer" },
          { name: "Asset Revaluation" },
          { name: "Asset Retirement" },
        ],
      },
      {
        name: "Cost Accounting",
        children: [
          { name: "Cost Allocation" },
          { name: "Activity Based Costing" },
          { name: "Cost Center Accounting" },
          { name: "Product Costing Interface" },
        ],
      },
      {
        name: "Project Accounting",
        children: [
          { name: "Project Cost Collection" },
          { name: "Project Billing" },
          { name: "Project Revenue Recognition" },
          { name: "Project Profitability" },
        ],
      },
      {
        name: "Lease Accounting",
        children: [
          { name: "Lease Classification" },
          { name: "Lease Liability" },
          { name: "Right Of Use Asset" },
          { name: "Lease Payment" },
        ],
      },
      {
        name: "Intercompany Accounting",
        children: [
          { name: "Intercompany Transaction" },
          { name: "Intercompany Elimination" },
          { name: "Intercompany Reconciliation" },
        ],
      },
      {
        name: "Inventory Accounting Interface",
        children: [
          { name: "Inventory Valuation" },
          { name: "Inventory Posting" },
          { name: "Inventory Reconciliation" },
        ],
      },
      {
        name: "Revenue Recognition",
        children: [
          { name: "Revenue Rules Engine" },
          { name: "Performance Obligations" },
          { name: "Revenue Scheduling" },
          { name: "Revenue Posting" },
        ],
      },
      {
        name: "Subledger Accounting",
        children: [
          { name: "Subledger To General Ledger" },
          { name: "Subledger Reconciliation" },
          { name: "Subledger Inquiry" },
        ],
      },
    ],
  },
  {
    name: "Close Reporting Tax",
    children: [
      {
        name: "Financial Close",
        children: [
          { name: "Close Task Management" },
          { name: "Close Calendar" },
          { name: "Close Checklist" },
          { name: "Close Status Tracking" },
          { name: "Close Sign Off" },
        ],
      },
      {
        name: "Reconciliations",
        children: [
          { name: "Account Reconciliation" },
          { name: "Reconciliation Rules" },
          { name: "Reconciliation Evidence" },
          { name: "Reconciliation Approval" },
        ],
      },
      {
        name: "Consolidation",
        children: [
          { name: "Consolidation Scope" },
          { name: "Consolidation Adjustments" },
          { name: "Intercompany Eliminations" },
          { name: "Consolidation Reporting" },
        ],
      },
      {
        name: "Financial Statements",
        children: [
          { name: "Balance Sheet" },
          { name: "Income Statement" },
          { name: "Cash Flow Statement" },
          { name: "Statement Of Changes In Equity" },
        ],
      },
      {
        name: "Management Reporting",
        children: [
          { name: "Management Packs" },
          { name: "Variance Analysis" },
          { name: "Flash Reports" },
          { name: "Board Reporting Packs" },
        ],
      },
      {
        name: "Statutory Reporting",
        children: [
          { name: "Local GAAP Reports" },
          { name: "IFRS Reports" },
          { name: "Regulatory Filings" },
          { name: "Statutory Audit Support" },
        ],
      },
      {
        name: "Tax Management",
        children: [
          { name: "Tax Determination" },
          { name: "Tax Calculation" },
          { name: "Tax Reporting" },
          { name: "Tax Provision" },
          { name: "Tax Compliance Calendar" },
        ],
      },
    ],
  },
  {
    name: "Treasury Payments Credit",
    children: [
      {
        name: "Advanced Treasury Management",
        children: [
          {
            name: "Cash Positioning",
            children: [
              { name: "Bank Balances" },
              { name: "Cash Pooling" },
              { name: "Intraday Liquidity" },
            ],
          },
          {
            name: "Liquidity Forecasting",
            children: [
              { name: "Short Term Forecast" },
              { name: "Medium Term Forecast" },
              { name: "Forecast Accuracy" },
            ],
          },
          {
            name: "Bank Account Management",
            children: [
              { name: "Account Inventory" },
              { name: "Account Opening Closing" },
              { name: "Signatory Management" },
            ],
          },
          {
            name: "Payment Factory",
            children: [
              { name: "Payment Factory Rules" },
              { name: "Payment Routing" },
              { name: "Payment Execution" },
            ],
          },
        ],
      },
      {
        name: "Cash Management",
        children: [
          { name: "Cash Operations" },
          { name: "Bank Statement Processing" },
          { name: "Cash Reconciliation" },
        ],
      },
      {
        name: "Payment Operations",
        children: [
          { name: "Payment Initiation" },
          { name: "Payment Approval" },
          { name: "Payment Execution" },
          { name: "Payment Status Tracking" },
        ],
      },
      {
        name: "Cash Application",
        children: [
          { name: "Automatic Matching" },
          { name: "Manual Matching" },
          { name: "Unapplied Cash" },
        ],
      },
      {
        name: "Collections",
        children: [
          { name: "Collection Strategies" },
          { name: "Collection Worklist" },
          { name: "Promise To Pay" },
          { name: "Collection Escalation" },
        ],
      },
      {
        name: "Credit Management",
        children: [
          { name: "Credit Limits" },
          { name: "Credit Scoring" },
          { name: "Credit Holds" },
          { name: "Credit Review" },
        ],
      },
      {
        name: "Banking Operations",
        children: [
          { name: "Bank Communication" },
          { name: "Bank Fee Management" },
          { name: "Bank Relationship Tracking" },
        ],
      },
      {
        name: "Fraud Detection",
        children: [
          { name: "Payment Fraud Rules" },
          { name: "Anomaly Detection" },
          { name: "Fraud Case Management" },
        ],
      },
      { name: "Liquidity Management" },
      { name: "Bank Relationship Management" },
      {
        name: "Trade Finance",
        children: [
          { name: "Letter Of Credit" },
          { name: "Bank Guarantees" },
          { name: "Documentary Collections" },
          { name: "Trade Finance Tracking" },
        ],
      },
    ],
  },
  {
    name: "Planning And Performance",
    children: [
      {
        name: "Budgeting",
        children: [
          { name: "Budget Preparation" },
          { name: "Budget Approval" },
          { name: "Budget Allocation" },
          { name: "Budget Control" },
        ],
      },
      {
        name: "Forecasting",
        children: [
          { name: "Rolling Forecast" },
          { name: "Driver Based Forecast" },
          { name: "Forecast Versions" },
        ],
      },
      {
        name: "FP And A",
        children: [
          { name: "Financial Planning Models" },
          { name: "Scenario Modeling" },
          { name: "Management Reporting" },
          { name: "Decision Support" },
        ],
      },
      {
        name: "Capital Management",
        children: [
          { name: "Capital Planning" },
          { name: "Capital Allocation" },
          { name: "Capital Tracking" },
        ],
      },
      {
        name: "Profitability Analysis",
        children: [
          { name: "Profitability Dimensions" },
          { name: "Profitability Models" },
          { name: "Profitability Reporting" },
        ],
      },
    ],
  },
  {
    name: "Finance Interfaces",
    children: [
      { name: "Asset Finance Interface" },
      { name: "Payroll Accounting Interface" },
      { name: "Procurement Finance Interface" },
      { name: "Sales Finance Interface" },
      { name: "Audit Support" },
      { name: "Finance Intelligence Interface" },
    ],
  },
];

const TYPE_BY_DEPTH: NodeType[] = ["module", "submodule", "leaf", "subleaf", "subleaf"];

function build(raw: RawNode, depth: number, parent: FinanceNode | null): FinanceNode {
  const slug = raw.slug ?? slugify(raw.name);
  const path = `${parent ? parent.path : ""}/${slug}`;
  const node: FinanceNode = {
    id: path,
    name: raw.name,
    type: TYPE_BY_DEPTH[Math.min(depth, TYPE_BY_DEPTH.length - 1)]!,
    parentId: parent ? parent.id : null,
    path,
    children: [],
    implemented: depth === 0 ? raw.name === "Financial Master Data" : (parent?.implemented ?? false),
  };
  node.children = (raw.children ?? []).map((child) => build(child, depth + 1, node));
  return node;
}

export const APP_NAME = "Finance Accounting Treasury";

export const financeTree: FinanceNode[] = RAW.map((raw) => build(raw, 0, null));

const byPath = new Map<string, FinanceNode>();
const parents = new Map<string, FinanceNode | null>();

(function index(nodes: FinanceNode[], parent: FinanceNode | null) {
  for (const node of nodes) {
    byPath.set(node.path, node);
    parents.set(node.path, parent);
    index(node.children, node);
  }
})(financeTree, null);

export function getNode(path: string): FinanceNode | undefined {
  return byPath.get(path);
}

export function allNodes(): FinanceNode[] {
  return [...byPath.values()];
}

/** Ancestor chain (root module first), including the node itself. */
export function trail(path: string): FinanceNode[] {
  const out: FinanceNode[] = [];
  let current = byPath.get(path);
  while (current) {
    out.unshift(current);
    current = parents.get(current.path) ?? undefined;
  }
  return out;
}

export function countNodes(node: FinanceNode): number {
  return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
}
