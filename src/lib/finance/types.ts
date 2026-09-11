export type AccountType = "Cash" | "Bank" | "Wallet" | "Savings" | "Credit Card" | "Other";

export type Direction = "in" | "out";

export type AccountingType =
  | "Income"
  | "Expense"
  | "Transfer"
  | "Asset Purchase"
  | "Debt"
  | "Debt Payment"
  | "Adjustment"
  | "Other";

export type CashflowType = "Operating" | "Investing" | "Financing" | "Transfer" | "Other";

export const ACCOUNT_TYPES: AccountType[] = [
  "Cash",
  "Bank",
  "Wallet",
  "Savings",
  "Credit Card",
  "Other",
];

export const ACCOUNTING_TYPES: AccountingType[] = [
  "Income",
  "Expense",
  "Transfer",
  "Asset Purchase",
  "Debt",
  "Debt Payment",
  "Adjustment",
  "Other",
];

export const CASHFLOW_TYPES: CashflowType[] = [
  "Operating",
  "Investing",
  "Financing",
  "Transfer",
  "Other",
];

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  openingBalance: number;
  currency: string;
  /** Liability accounts (credit card / debt) are shown under liabilities. */
  isLiability?: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  /** Planned budget for the current period, entered manually. */
  planned?: number;
}

export interface PlanningColumn {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  order: number;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  currency: string;
  date: string;
  columnId: string;
  accountId: string;
  toAccountId?: string;
  categoryId: string;
  direction: Direction;
  accountingType: AccountingType;
  cashflowType: CashflowType;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  currency: string;
  defaultPeriod: "Week" | "Month" | "Custom";
  theme: "light" | "dark";
}

export interface FinanceData {
  accounts: Account[];
  categories: Category[];
  columns: PlanningColumn[];
  transactions: Transaction[];
  settings: Settings;
}
