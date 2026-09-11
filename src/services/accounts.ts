import { uid } from "@/lib/finance/calc";
import type { Account } from "@/lib/finance/types";

export type AccountInput = Omit<Account, "id">;

export const accountsService = {
  list(all: Account[]): Account[] {
    return all;
  },
  create(all: Account[], input: AccountInput): Account[] {
    return [...all, { ...input, id: uid("acc") }];
  },
  update(all: Account[], id: string, patch: Partial<AccountInput>): Account[] {
    return all.map((a) => (a.id === id ? { ...a, ...patch } : a));
  },
  remove(all: Account[], id: string): Account[] {
    return all.filter((a) => a.id !== id);
  },
};
