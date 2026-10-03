import { useCallback, useSyncExternalStore } from "react";

import { collections } from "./repositories";
import type { CollectionKey, Row } from "./schema";

/**
 * Local persistence for Financial Master Data. Replace the read/write
 * functions below with API calls to move onto a backend; UI code only uses
 * the hooks exported from this module.
 */

const PREFIX = "fat.fmd.v1";
type State = Record<CollectionKey, Row[]>;

const seedState = (): State =>
  Object.fromEntries(
    Object.values(collections).map((c) => [c.key, c.seed]),
  ) as State;

let state: State = seedState();
let hydrated = false;
const listeners = new Set<() => void>();
const updatedAt: Partial<Record<CollectionKey, string>> = {};

function emit() {
  for (const l of listeners) l();
}

export function hydrateStore() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const next = { ...state };
  for (const key of Object.keys(collections) as CollectionKey[]) {
    try {
      const raw = window.localStorage.getItem(`${PREFIX}:${key}`);
      if (raw) {
        const parsed = JSON.parse(raw) as { items: Row[]; updatedAt?: string };
        if (Array.isArray(parsed.items)) next[key] = parsed.items;
        if (parsed.updatedAt) updatedAt[key] = parsed.updatedAt;
      }
    } catch {
      /* corrupt entry — fall back to seed */
    }
  }
  state = next;
  emit();
}

function write(key: CollectionKey, items: Row[]) {
  state = { ...state, [key]: items };
  updatedAt[key] = new Date().toISOString();
  try {
    window.localStorage.setItem(
      `${PREFIX}:${key}`,
      JSON.stringify({ items, updatedAt: updatedAt[key] }),
    );
  } catch {
    /* storage unavailable */
  }
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const getSnapshot = () => state;
const serverState = seedState();
const getServerSnapshot = () => serverState;

export function useAllCollections(): State {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function getUpdatedAt(key: CollectionKey): string | undefined {
  return updatedAt[key];
}

export function newId(key: CollectionKey) {
  return `${key}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useRepo(key: CollectionKey) {
  const all = useAllCollections();
  const items = all[key];
  const add = useCallback((row: Row) => write(key, [...state[key], row]), [key]);
  const update = useCallback(
    (id: string, patch: Partial<Row>) =>
      write(
        key,
        state[key].map((r) => (r.id === id ? ({ ...r, ...patch } as Row) : r)),
      ),
    [key],
  );
  const remove = useCallback(
    (id: string) => write(key, state[key].filter((r) => r.id !== id)),
    [key],
  );
  const replaceAll = useCallback((rows: Row[]) => write(key, rows), [key]);
  return { items, add, update, remove, replaceAll };
}

export function resetAll() {
  for (const c of Object.values(collections)) write(c.key, c.seed);
}
