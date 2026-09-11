import type { Account, Category, FinanceData, PlanningColumn, Transaction } from "./types";

export function signedAmount(t: Transaction): number {
  return t.direction === "in" ? t.amount : -t.amount;
}

export function isTransfer(t: Transaction): boolean {
  return t.accountingType === "Transfer";
}

export interface ColumnTotals {
  in: number;
  out: number;
  net: number;
  opening: number;
  closing: number;
}

/** Opening balance of the whole board = sum of non-liability account opening balances. */
export function boardOpening(accounts: Account[]): number {
  return accounts
    .filter((a) => !a.isLiability)
    .reduce((sum, a) => sum + a.openingBalance, 0);
}

export function columnTotals(
  columns: PlanningColumn[],
  transactions: Transaction[],
  accounts: Account[],
): Record<string, ColumnTotals> {
  const ordered = [...columns].sort((a, b) => a.order - b.order);
  const result: Record<string, ColumnTotals> = {};
  let running = boardOpening(accounts);

  for (const col of ordered) {
    const items = transactions.filter((t) => t.columnId === col.id);
    let inSum = 0;
    let outSum = 0;
    for (const t of items) {
      if (isTransfer(t)) continue; // transfers move money, they don't change total
      if (t.direction === "in") inSum += t.amount;
      else outSum += t.amount;
    }
    const net = inSum - outSum;
    const opening = running;
    const closing = opening + net;
    running = closing;
    result[col.id] = { in: inSum, out: outSum, net, opening, closing };
  }
  return result;
}

export interface BoardSummary {
  income: number;
  expenses: number;
  net: number;
  opening: number;
  closing: number;
}

export function boardSummary(data: FinanceData): BoardSummary {
  let income = 0;
  let expenses = 0;
  for (const t of data.transactions) {
    if (isTransfer(t)) continue;
    if (t.direction === "in") income += t.amount;
    else expenses += t.amount;
  }
  const opening = boardOpening(data.accounts);
  const net = income - expenses;
  return { income, expenses, net, opening, closing: opening + net };
}

export function accountBalance(account: Account, transactions: Transaction[]): number {
  let balance = account.openingBalance;
  for (const t of transactions) {
    if (isTransfer(t)) {
      if (t.accountId === account.id) balance -= t.amount;
      if (t.toAccountId === account.id) balance += t.amount;
      continue;
    }
    if (t.accountId !== account.id) continue;
    balance += signedAmount(t);
  }
  return balance;
}

export function accountBalances(
  accounts: Account[],
  transactions: Transaction[],
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const a of accounts) out[a.id] = accountBalance(a, transactions);
  return out;
}

export interface StatementLine {
  label: string;
  value: number;
  color?: string;
}

export function incomeStatement(data: FinanceData) {
  const byCategory = (type: "Income" | "Expense") => {
    const map = new Map<string, number>();
    for (const t of data.transactions) {
      if (t.accountingType !== type) continue;
      map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amount);
    }
    return [...map.entries()]
      .map(([categoryId, value]) => {
        const cat = data.categories.find((c) => c.id === categoryId);
        return { label: cat?.name ?? "Uncategorized", value, color: cat?.color };
      })
      .sort((a, b) => b.value - a.value);
  };

  const income = byCategory("Income");
  const expenses = byCategory("Expense");
  const totalIncome = income.reduce((s, l) => s + l.value, 0);
  const totalExpenses = expenses.reduce((s, l) => s + l.value, 0);
  return { income, expenses, totalIncome, totalExpenses, netIncome: totalIncome - totalExpenses };
}

export function balanceSheet(data: FinanceData) {
  const balances = accountBalances(data.accounts, data.transactions);
  const assets = data.accounts
    .filter((a) => !a.isLiability)
    .map((a) => ({ label: a.name, value: balances[a.id] ?? 0 }));
  const liabilities = data.accounts
    .filter((a) => a.isLiability)
    .map((a) => ({ label: a.name, value: Math.abs(balances[a.id] ?? 0) }));
  const totalAssets = assets.reduce((s, l) => s + l.value, 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + l.value, 0);
  return {
    assets,
    liabilities,
    totalAssets,
    totalLiabilities,
    netPosition: totalAssets - totalLiabilities,
  };
}

export function cashFlowStatement(data: FinanceData) {
  const opening = boardOpening(data.accounts);
  let opIn = 0;
  let opOut = 0;
  let investing = 0;
  let financing = 0;
  let other = 0;

  for (const t of data.transactions) {
    if (isTransfer(t)) continue;
    const signed = signedAmount(t);
    switch (t.cashflowType) {
      case "Operating":
        if (signed > 0) opIn += signed;
        else opOut += signed;
        break;
      case "Investing":
        investing += signed;
        break;
      case "Financing":
        financing += signed;
        break;
      default:
        other += signed;
    }
  }
  const operating = opIn + opOut;
  const netChange = operating + investing + financing + other;
  return {
    opening,
    opIn,
    opOut,
    operating,
    investing,
    financing,
    other,
    netChange,
    closing: opening + netChange,
  };
}

export interface CategoryRow {
  category: Category;
  planned: number;
  actual: number;
  difference: number;
}

export function categoryRows(data: FinanceData): CategoryRow[] {
  return data.categories.map((category) => {
    const actual = data.transactions
      .filter((t) => t.categoryId === category.id && t.direction === "out" && !isTransfer(t))
      .reduce((s, t) => s + t.amount, 0);
    const planned = category.planned ?? 0;
    return { category, planned, actual, difference: planned - actual };
  });
}

export function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
