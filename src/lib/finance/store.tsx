import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { demoData } from "./demo-data";
import type { FinanceData, Settings } from "./types";
import { accountsService, type AccountInput } from "@/services/accounts";
import { categoriesService, type CategoryInput } from "@/services/categories";
import { planningColumnsService, type PlanningColumnInput } from "@/services/planningColumns";
import { transactionsService, type TransactionInput } from "@/services/transactions";

const STORAGE_KEY = "pfb.data.v1";

export interface FinanceStore {
  data: FinanceData;
  status: "loading" | "ready" | "error";
  error: string | null;
  addTransaction: (input: TransactionInput) => void;
  updateTransaction: (id: string, patch: Partial<TransactionInput>) => void;
  deleteTransaction: (id: string) => void;
  moveTransaction: (id: string, columnId: string, beforeId?: string) => void;
  addAccount: (input: AccountInput) => void;
  updateAccount: (id: string, patch: Partial<AccountInput>) => void;
  deleteAccount: (id: string) => void;
  addCategory: (input: CategoryInput) => void;
  updateCategory: (id: string, patch: Partial<CategoryInput>) => void;
  deleteCategory: (id: string) => void;
  addColumn: (input: PlanningColumnInput) => void;
  updateColumn: (id: string, patch: Partial<PlanningColumnInput>) => void;
  deleteColumn: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetDemo: () => void;
}

const FinanceContext = createContext<FinanceStore | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FinanceData>(demoData);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as FinanceData;
        if (parsed && Array.isArray(parsed.accounts)) setData(parsed);
      }
      setStatus("ready");
    } catch {
      setError("We couldn't load your saved data, so demo data is shown instead.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage unavailable — keep working in memory */
    }
  }, [data, status]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", data.settings.theme === "dark");
  }, [data.settings.theme]);

  const patch = useCallback((fn: (current: FinanceData) => FinanceData) => {
    setData((current) => fn(current));
  }, []);

  const store = useMemo<FinanceStore>(
    () => ({
      data,
      status,
      error,
      addTransaction: (input) =>
        patch((d) => ({ ...d, transactions: transactionsService.create(d.transactions, input) })),
      updateTransaction: (id, p) =>
        patch((d) => ({ ...d, transactions: transactionsService.update(d.transactions, id, p) })),
      deleteTransaction: (id) =>
        patch((d) => ({ ...d, transactions: transactionsService.remove(d.transactions, id) })),
      moveTransaction: (id, columnId, beforeId) =>
        patch((d) => ({
          ...d,
          transactions: transactionsService.move(d.transactions, id, columnId, beforeId),
        })),
      addAccount: (input) =>
        patch((d) => ({ ...d, accounts: accountsService.create(d.accounts, input) })),
      updateAccount: (id, p) =>
        patch((d) => ({ ...d, accounts: accountsService.update(d.accounts, id, p) })),
      deleteAccount: (id) =>
        patch((d) => ({ ...d, accounts: accountsService.remove(d.accounts, id) })),
      addCategory: (input) =>
        patch((d) => ({ ...d, categories: categoriesService.create(d.categories, input) })),
      updateCategory: (id, p) =>
        patch((d) => ({ ...d, categories: categoriesService.update(d.categories, id, p) })),
      deleteCategory: (id) =>
        patch((d) => ({ ...d, categories: categoriesService.remove(d.categories, id) })),
      addColumn: (input) =>
        patch((d) => ({ ...d, columns: planningColumnsService.create(d.columns, input) })),
      updateColumn: (id, p) =>
        patch((d) => ({ ...d, columns: planningColumnsService.update(d.columns, id, p) })),
      deleteColumn: (id) =>
        patch((d) => ({
          ...d,
          columns: planningColumnsService.remove(d.columns, id),
          transactions: d.transactions.filter((t) => t.columnId !== id),
        })),
      updateSettings: (p) => patch((d) => ({ ...d, settings: { ...d.settings, ...p } })),
      resetDemo: () => setData(demoData),
    }),
    [data, status, error, patch],
  );

  return <FinanceContext.Provider value={store}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceStore {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used inside FinanceProvider");
  return ctx;
}

export function useCurrency(): string {
  return useFinance().data.settings.currency;
}
