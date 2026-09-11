import { uid } from "@/lib/finance/calc";
import type { Category } from "@/lib/finance/types";

export type CategoryInput = Omit<Category, "id">;

export const categoriesService = {
  list(all: Category[]): Category[] {
    return all;
  },
  create(all: Category[], input: CategoryInput): Category[] {
    return [...all, { ...input, id: uid("cat") }];
  },
  update(all: Category[], id: string, patch: Partial<CategoryInput>): Category[] {
    return all.map((c) => (c.id === id ? { ...c, ...patch } : c));
  },
  remove(all: Category[], id: string): Category[] {
    return all.filter((c) => c.id !== id);
  },
};
