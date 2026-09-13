import { useCallback, useEffect, useState } from "react";

export type LoadState = "loading" | "ready" | "error";

export interface Identified {
  id: string;
}

export function uid(prefix = "rec"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

const KEY_PREFIX = "fat.v1";

/**
 * Local persistence layer for the prototype. Swapping this hook's body for
 * API calls is the only change needed to move the module onto a backend.
 */
export function useCollection<T extends Identified>(key: string, seed: T[]) {
  const storageKey = `${KEY_PREFIX}:${key}`;
  const [items, setItems] = useState<T[]>(seed);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setItems(seed);
    setState("loading");
    setError(null);
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as T[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
      setState("ready");
    } catch {
      setError("Saved records could not be read. Showing the default data set.");
      setState("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const persist = useCallback(
    (next: T[]) => {
      setItems(next);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* storage unavailable — keep working in memory */
      }
    },
    [storageKey],
  );

  const add = useCallback((item: T) => persist([...items, item]), [items, persist]);
  const update = useCallback(
    (id: string, patch: Partial<T>) =>
      persist(items.map((item) => (item.id === id ? { ...item, ...patch } : item))),
    [items, persist],
  );
  const remove = useCallback(
    (id: string) => persist(items.filter((item) => item.id !== id)),
    [items, persist],
  );
  const reset = useCallback(() => persist(seed), [persist, seed]);

  return { items, state, error, add, update, remove, reset, replaceAll: persist };
}
