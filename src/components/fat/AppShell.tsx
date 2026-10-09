import { useRouterState } from "@tanstack/react-router";
import { Bell, ChevronDown, Map, Menu, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { APP_NAME, allNodes, financeTree, getNode } from "@/lib/fat/tree";
import { hydrateStore } from "@/lib/fmd/store";
import { cn } from "@/lib/utils";
import { FinanceTree, searchTree } from "./FinanceTree";
import { NodeLink } from "./NodeLink";

function useCurrentPath() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return pathname.replace(/\/$/, "") || "/";
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const path = useCurrentPath();
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState("");

  // Expand the ancestors of the active node.
  useEffect(() => {
    if (!getNode(path)) return;
    setExpanded((prev) => {
      const next = new Set(prev);
      const parts = path.split("/").filter(Boolean);
      for (let i = 1; i < parts.length; i++) next.add("/" + parts.slice(0, i).join("/"));
      return next;
    });
  }, [path]);

  const visible = useMemo(() => searchTree(financeTree, query), [query]);
  const toggle = (p: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });

  return (
    <>
      <div
        className={cn("fixed inset-0 z-40 bg-foreground/30 lg:hidden", open ? "block" : "hidden")}
        onClick={onClose}
        aria-hidden
      />
      <aside
        aria-label="Application navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar transition-transform lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-12 items-center gap-2 border-b border-sidebar-border px-3">
          <span className="grid size-7 place-items-center rounded-sm bg-primary font-mono text-[11px] font-bold text-primary-foreground">
            FAT
          </span>
          <NodeLink path="/" className="truncate text-sm font-semibold" onClick={onClose}>
            {APP_NAME}
          </NodeLink>
          <button className="ml-auto lg:hidden" onClick={onClose} aria-label="Close navigation">
            <X className="size-4" />
          </button>
        </div>
        <div className="border-b border-sidebar-border p-2">
          <NodeLink
            path="/map"
            onClick={onClose}
            className={cn(
              "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-sidebar-accent",
              path === "/map" && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary",
            )}
          >
            <Map className="size-3.5" aria-hidden /> Global Finance Map
          </NodeLink>
          <label className="relative mt-2 block">
            <span className="sr-only">Filter navigation</span>
            <Search className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter navigation"
              className="h-7 w-full rounded-sm border border-input bg-background pr-2 pl-7 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            />
          </label>
        </div>
        <div className="scroll-slim flex-1 overflow-y-auto p-2">
          <FinanceTree
            nodes={financeTree}
            expanded={expanded}
            onToggle={toggle}
            activePath={path}
            visible={visible}
            dense
            onNavigate={onClose}
          />
        </div>
        <div className="border-t border-sidebar-border px-3 py-2 text-[11px] text-muted-foreground">
          {allNodes().length} canonical nodes · Prototype phase 1
        </div>
      </aside>
    </>
  );
}

function GlobalSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return allNodes()
      .filter((n) => n.name.toLowerCase().includes(s))
      .slice(0, 10);
  }, [q]);
  return (
    <div className="relative w-full max-w-sm">
      <label className="relative block">
        <span className="sr-only">Search the finance map</span>
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search modules and capabilities"
          className="h-8 w-full rounded-sm border border-input bg-background pr-2 pl-8 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        />
      </label>
      {open && results.length ? (
        <ul className="absolute top-9 right-0 left-0 z-50 max-h-80 overflow-y-auto rounded-sm border border-border bg-popover py-1 shadow-lg">
          {results.map((n) => (
            <li key={n.path}>
              <NodeLink
                path={n.path}
                onClick={() => {
                  setQ("");
                  setOpen(false);
                }}
                className="block px-3 py-1.5 hover:bg-muted"
              >
                <span className="block text-sm">{n.name}</span>
                <span className="block truncate text-[11px] text-muted-foreground">{n.path}</span>
              </NodeLink>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function TopHeader({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-border bg-background/95 px-3 backdrop-blur lg:px-5">
      <button className="lg:hidden" onClick={onMenu} aria-label="Open navigation">
        <Menu className="size-4" />
      </button>
      <span className="hidden text-sm font-semibold xl:inline">{APP_NAME}</span>
      <span className="hidden h-5 w-px bg-border xl:inline" aria-hidden />
      <button
        type="button"
        className="hidden items-center gap-1.5 rounded-sm border border-input px-2 py-1 text-xs md:flex"
        aria-label="Workspace context"
      >
        <span className="text-muted-foreground">Workspace</span>
        <span className="font-medium">Group · FY2026</span>
        <ChevronDown className="size-3" aria-hidden />
      </button>
      <div className="flex flex-1 justify-end md:justify-center">
        <GlobalSearch />
      </div>
      <button type="button" className="relative grid size-8 place-items-center rounded-sm hover:bg-muted" aria-label="Notifications">
        <Bell className="size-4" />
      </button>
      <div className="flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-full bg-secondary text-[11px] font-semibold">FC</span>
        <span className="hidden text-xs leading-tight lg:block">
          <span className="block font-medium">Finance Controller</span>
          <span className="block text-muted-foreground">Prototype user</span>
        </span>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState(false);
  useEffect(() => hydrateStore(), []);
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={menu} onClose={() => setMenu(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader onMenu={() => setMenu(true)} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
