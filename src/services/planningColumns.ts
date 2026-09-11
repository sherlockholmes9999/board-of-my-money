import { uid } from "@/lib/finance/calc";
import type { PlanningColumn } from "@/lib/finance/types";

export type PlanningColumnInput = Omit<PlanningColumn, "id" | "order"> & { order?: number };

export const planningColumnsService = {
  list(all: PlanningColumn[]): PlanningColumn[] {
    return [...all].sort((a, b) => a.order - b.order);
  },
  create(all: PlanningColumn[], input: PlanningColumnInput): PlanningColumn[] {
    const order = input.order ?? all.reduce((max, c) => Math.max(max, c.order), -1) + 1;
    return [...all, { ...input, order, id: uid("col") }];
  },
  update(all: PlanningColumn[], id: string, patch: Partial<PlanningColumnInput>): PlanningColumn[] {
    return all.map((c) => (c.id === id ? { ...c, ...patch } : c));
  },
  remove(all: PlanningColumn[], id: string): PlanningColumn[] {
    return all.filter((c) => c.id !== id);
  },
};
