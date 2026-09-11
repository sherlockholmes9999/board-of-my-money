import { uid } from "@/lib/finance/calc";
import type { Transaction } from "@/lib/finance/types";

export type TransactionInput = Omit<Transaction, "id" | "createdAt" | "updatedAt">;

export const transactionsService = {
  list(all: Transaction[]): Transaction[] {
    return all;
  },
  create(all: Transaction[], input: TransactionInput): Transaction[] {
    const now = new Date().toISOString();
    return [...all, { ...input, id: uid("t"), createdAt: now, updatedAt: now }];
  },
  update(all: Transaction[], id: string, patch: Partial<TransactionInput>): Transaction[] {
    const now = new Date().toISOString();
    return all.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: now } : t));
  },
  remove(all: Transaction[], id: string): Transaction[] {
    return all.filter((t) => t.id !== id);
  },
  move(all: Transaction[], id: string, columnId: string, beforeId?: string): Transaction[] {
    const moving = all.find((t) => t.id === id);
    if (!moving) return all;
    const updated: Transaction = { ...moving, columnId, updatedAt: new Date().toISOString() };
    const rest = all.filter((t) => t.id !== id);
    if (!beforeId) return [...rest, updated];
    const index = rest.findIndex((t) => t.id === beforeId);
    if (index === -1) return [...rest, updated];
    return [...rest.slice(0, index), updated, ...rest.slice(index)];
  },
};
