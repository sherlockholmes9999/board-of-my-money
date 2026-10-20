import { ArrowRight } from "lucide-react";

import { ModuleHeader } from "@/components/fat/ModuleHeader";
import { NodeLink } from "@/components/fat/NodeLink";
import { StatusBadge } from "@/components/fat/StatusBadge";
import { Button } from "@/components/ui/button";
import { getNode, type FinanceNode } from "@/lib/fat/tree";
import { runQualityCheck } from "@/lib/fmd/logic";
import type { CollectionKey } from "@/lib/fmd/schema";
import { getUpdatedAt, useAllCollections } from "@/lib/fmd/store";
import { areaDescriptions, leafDescriptions, views } from "@/lib/fmd/views";
import { cn } from "@/lib/utils";

const FMD_PATH = "/financial-master-data";

/** Distinct collections maintained beneath a node. */
function collectionsUnder(node: FinanceNode): CollectionKey[] {
  const keys = new Set<CollectionKey>();
  const walk = (n: FinanceNode) => {
    const v = views[n.path];
    if (v) keys.add(v.collection);
    n.children.forEach(walk);
  };
  walk(node);
  return [...keys];
}

function useAreaStats(node: FinanceNode) {
  const all = useAllCollections();
  const keys = collectionsUnder(node);
  const records = keys.reduce((s, k) => s + all[k].length, 0);
  const active = keys.reduce((s, k) => s + all[k].filter((r) => r.status === "Active").length, 0);
  const pending = all.changeControl.filter((c) =>
    ["Draft", "Submitted", "Under Review"].includes(c.status ?? "") &&
    keys.some((k) => (DOMAIN_KEYS[c.domain ?? ""] ?? []).includes(k)),
  ).length;
  const failures = all.qualityRules
    .filter((r) => r.status === "Active" && keys.some((k) => (DOMAIN_KEYS[r.domain ?? ""] ?? []).includes(k)))
    .reduce((s, r) => s + runQualityCheck(all, r).failed, 0);
  const stamps = keys.map((k) => getUpdatedAt(k)).filter(Boolean) as string[];
  const last = stamps.sort().at(-1);
  return { records, active, pending, failures, last: last ? last.slice(0, 16).replace("T", " ") : "Seed data" };
}

const DOMAIN_KEYS: Record<string, CollectionKey[]> = {
  "Chart Of Accounts": ["accounts", "accountTypes", "accountControlRules"],
  "Cost Centers": ["costCenters"],
  "Profit Centers": ["profitCenters"],
  "Financial Dimensions": ["dimensions", "dimensionValues", "dimensionCombinations", "dimensionValidation"],
  "Legal Entities": ["legalEntities", "intercompanyRules", "consolidationScopes"],
};

function AreaRow({ node }: { node: FinanceNode }) {
  const s = useAreaStats(node);
  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-muted/40">
      <td className="px-3 py-2.5 align-top">
        <NodeLink path={node.path} className="font-medium hover:underline">
          {node.name}
        </NodeLink>
        <p className="text-xs text-muted-foreground">{areaDescriptions[node.path]}</p>
        <p className="mt-1 flex flex-wrap gap-x-3 text-[11px]">
          {node.children.map((c) => (
            <NodeLink key={c.path} path={c.path} className="text-primary hover:underline">
              {c.name}
            </NodeLink>
          ))}
        </p>
      </td>
      <td className="num px-3 py-2.5 text-right align-top">{s.records}</td>
      <td className="num px-3 py-2.5 text-right align-top">{s.active}</td>
      <td className="num px-3 py-2.5 text-right align-top">{s.pending}</td>
      <td className="px-3 py-2.5 align-top">
        <StatusBadge value={s.failures ? "Warning" : "Valid"} />
        {s.failures ? <span className="ml-1 text-[11px] text-muted-foreground">{s.failures} issue(s)</span> : null}
      </td>
      <td className="px-3 py-2.5 align-top text-xs whitespace-nowrap text-muted-foreground">{s.last}</td>
      <td className="px-3 py-2.5 text-right align-top">
        <Button asChild size="sm" variant="outline">
          <NodeLink path={node.path}>
            Open <ArrowRight className="size-3.5" aria-hidden />
          </NodeLink>
        </Button>
      </td>
    </tr>
  );
}

export function FmdDashboard({ node }: { node: FinanceNode }) {
  const all = useAllCollections();
  const openChanges = all.changeControl.filter((c) => ["Draft", "Submitted", "Under Review"].includes(c.status ?? ""));
  return (
    <div>
      <ModuleHeader
        path={node.path}
        title="Financial Master Data"
        description="Manage the foundational structures and controls used across Finance Accounting Treasury."
      />
      <div className="space-y-6 p-4 lg:p-6">
        <section aria-labelledby="areas" className="overflow-hidden rounded-sm border border-border bg-card">
          <h2 id="areas" className="border-b border-border px-3 py-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Functional areas
          </h2>
          <div className="scroll-slim overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-muted/60 text-[11px] tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Area</th>
                  <th className="px-3 py-2 text-right font-semibold">Records</th>
                  <th className="px-3 py-2 text-right font-semibold">Active</th>
                  <th className="px-3 py-2 text-right font-semibold">Pending changes</th>
                  <th className="px-3 py-2 text-left font-semibold">Validation</th>
                  <th className="px-3 py-2 text-left font-semibold">Last updated</th>
                  <th className="px-3 py-2"><span className="sr-only">Open</span></th>
                </tr>
              </thead>
              <tbody>
                {node.children.map((c) => (
                  <AreaRow key={c.path} node={c} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="overflow-hidden rounded-sm border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <h2 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Open change requests</h2>
            <NodeLink path={`${FMD_PATH}/governance/change-control`} className="text-xs text-primary hover:underline">
              Change Control
            </NodeLink>
          </div>
          {openChanges.length ? (
            <ul className="divide-y divide-border text-sm">
              {openChanges.map((c) => (
                <li key={c.id}>
                  <NodeLink path={`${FMD_PATH}/governance/change-control`} selected={c.id} className="flex items-center gap-3 px-3 py-2 hover:bg-muted/40">
                    <span className="font-mono text-xs">{c.changeId}</span>
                    <span className="min-w-0 flex-1 truncate">{c.object}</span>
                    <span className="hidden text-xs text-muted-foreground sm:inline">{c.domain}</span>
                    <StatusBadge value={c.status ?? ""} />
                  </NodeLink>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No open change requests.</p>
          )}
        </section>
      </div>
    </div>
  );
}

export function FmdAreaPage({ node }: { node: FinanceNode }) {
  const all = useAllCollections();
  return (
    <div>
      <ModuleHeader path={node.path} title={node.name} description={areaDescriptions[node.path]} />
      <div className="p-4 lg:p-6">
        <ul className="divide-y divide-border rounded-sm border border-border bg-card">
          {node.children.map((leaf) => {
            const v = views[leaf.path];
            const rows = v ? all[v.collection] : [];
            return (
              <li key={leaf.path}>
                <NodeLink path={leaf.path} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/40">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{leaf.name}</p>
                    <p className="text-xs text-muted-foreground">{leafDescriptions[leaf.path]}</p>
                  </div>
                  <span className="hidden text-[11px] text-muted-foreground uppercase sm:inline">{v?.kind === "tree" ? "Hierarchy" : "Table"}</span>
                  <span className="num w-24 text-right text-xs">
                    <strong>{rows.length}</strong> records
                  </span>
                  <span className="num w-20 text-right text-xs text-muted-foreground">
                    {rows.filter((r) => r.status === "Active").length} active
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
                </NodeLink>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/** Persistent secondary navigation inside Financial Master Data. */
export function FmdNav({ activePath }: { activePath: string }) {
  const root = getNode(FMD_PATH)!;
  return (
    <nav aria-label="Financial Master Data" className="scroll-slim hidden w-60 shrink-0 overflow-y-auto border-r border-border bg-card xl:block">
      <div className="sticky top-12 max-h-[calc(100vh-3rem)] overflow-y-auto p-3">
        <NodeLink
          path={FMD_PATH}
          className={cn(
            "block rounded-sm px-2 py-1 text-sm font-semibold hover:bg-muted",
            activePath === FMD_PATH && "bg-secondary",
          )}
        >
          Financial Master Data
        </NodeLink>
        {root.children.map((area) => (
          <div key={area.path} className="mt-3">
            <NodeLink
              path={area.path}
              className={cn(
                "block rounded-sm px-2 py-1 text-xs font-semibold text-muted-foreground uppercase hover:bg-muted hover:text-foreground",
                activePath === area.path && "bg-secondary text-foreground",
              )}
            >
              {area.name}
            </NodeLink>
            <ul className="mt-0.5 border-l border-border pl-2 ml-2">
              {area.children.map((leaf) => (
                <li key={leaf.path}>
                  <NodeLink
                    path={leaf.path}
                    className={cn(
                      "block rounded-sm px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
                      activePath === leaf.path && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    )}
                  >
                    {leaf.name}
                  </NodeLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
