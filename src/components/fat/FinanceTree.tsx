import {
  BookOpenCheck,
  Building2,
  ChevronRight,
  Database,
  FileText,
  Landmark,
  Network,
  PieChart,
  Plug,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { FinanceNode } from "@/lib/fat/tree";
import { cn } from "@/lib/utils";
import { NodeLink } from "./NodeLink";
import { StatusBadge } from "./StatusBadge";

export const MODULE_ICONS: Record<string, LucideIcon> = {
  "Financial Master Data": Database,
  Accounting: BookOpenCheck,
  "Close Reporting Tax": FileText,
  "Treasury Payments Credit": Landmark,
  "Planning And Performance": PieChart,
  "Finance Interfaces": Plug,
};

export function nodeIcon(node: FinanceNode): LucideIcon {
  if (node.type === "module") return MODULE_ICONS[node.name] ?? Building2;
  if (node.children.length) return Network;
  return FileText;
}

interface Props {
  nodes: FinanceNode[];
  expanded: Set<string>;
  onToggle: (path: string) => void;
  activePath?: string;
  /** When provided, only nodes in this set are rendered (search). */
  visible?: Set<string> | null;
  showMeta?: boolean;
  dense?: boolean;
  onNavigate?: () => void;
  depth?: number;
}

/** Recursive tree for the canonical application structure. */
export function FinanceTree({
  nodes,
  expanded,
  onToggle,
  activePath,
  visible,
  showMeta,
  dense,
  onNavigate,
  depth = 0,
}: Props) {
  return (
    <ul role={depth === 0 ? "tree" : "group"} className="space-y-px">
      {nodes
        .filter((n) => !visible || visible.has(n.path))
        .map((node) => {
          const hasChildren = node.children.length > 0;
          const open = expanded.has(node.path) || (visible ? true : false);
          const active = activePath === node.path;
          const inPath = activePath ? activePath.startsWith(node.path + "/") : false;
          const Icon = nodeIcon(node);
          return (
            <li key={node.path} role="treeitem" aria-expanded={hasChildren ? open : undefined} aria-selected={active}>
              <div
                className={cn(
                  "group flex items-center gap-1 rounded-sm pr-2 text-sm",
                  dense ? "py-0.5" : "py-1",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : inPath
                      ? "text-foreground"
                      : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
                style={{ paddingLeft: 4 + depth * 14 }}
              >
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() => onToggle(node.path)}
                    className="grid size-5 shrink-0 place-items-center rounded-sm hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    aria-label={`${open ? "Collapse" : "Expand"} ${node.name}`}
                  >
                    <ChevronRight className={cn("size-3.5 transition-transform", open && "rotate-90")} aria-hidden />
                  </button>
                ) : (
                  <span className="size-5 shrink-0" aria-hidden />
                )}
                <NodeLink
                  path={node.path}
                  onClick={onNavigate}
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-2 rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    node.type === "module" && "font-semibold",
                  )}
                >
                  <Icon className={cn("size-3.5 shrink-0", active ? "opacity-100" : "opacity-60")} aria-hidden />
                  <span className="truncate">{node.name}</span>
                  {!node.implemented && !showMeta && node.type === "module" ? (
                    <span className="ml-auto text-[10px] font-normal tracking-wide uppercase opacity-60">Planned</span>
                  ) : null}
                </NodeLink>
                {showMeta ? (
                  <span className="ml-2 hidden shrink-0 items-center gap-2 sm:flex">
                    <span className="w-16 text-[11px] text-muted-foreground capitalize">{node.type}</span>
                    <StatusBadge value={node.implemented ? "Implemented" : "Planned"} />
                  </span>
                ) : null}
              </div>
              {hasChildren && open ? (
                <FinanceTree
                  nodes={node.children}
                  expanded={expanded}
                  onToggle={onToggle}
                  activePath={activePath}
                  visible={visible}
                  showMeta={showMeta}
                  dense={dense}
                  onNavigate={onNavigate}
                  depth={depth + 1}
                />
              ) : null}
            </li>
          );
        })}
    </ul>
  );
}

/** Paths of nodes matching a query plus all their ancestors. */
export function searchTree(nodes: FinanceNode[], query: string): Set<string> | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  const out = new Set<string>();
  const walk = (list: FinanceNode[], ancestors: string[]) => {
    for (const n of list) {
      if (n.name.toLowerCase().includes(q)) {
        out.add(n.path);
        ancestors.forEach((a) => out.add(a));
      }
      walk(n.children, [...ancestors, n.path]);
    }
  };
  walk(nodes, []);
  return out;
}
