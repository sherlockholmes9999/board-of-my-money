import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { FinanceTree, searchTree } from "@/components/fat/FinanceTree";
import { SearchBar } from "@/components/fat/FilterBar";
import { Breadcrumbs } from "@/components/fat/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { APP_NAME, allNodes, financeTree } from "@/lib/fat/tree";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: `Global Finance Map — ${APP_NAME}` },
      { name: "description", content: "Interactive map of every module, submodule and capability in Finance Accounting Treasury." },
      { property: "og:title", content: `Global Finance Map — ${APP_NAME}` },
      { property: "og:description", content: "Explore the complete canonical Finance Accounting Treasury tree." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const nodes = allNodes();
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(financeTree.map((n) => n.path)));
  const [query, setQuery] = useState("");
  const visible = useMemo(() => searchTree(financeTree, query), [query]);
  const implemented = nodes.filter((n) => n.implemented).length;
  const toggle = (p: string) =>
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(p)) n.delete(p);
      else n.add(p);
      return n;
    });

  return (
    <div>
      <header className="border-b border-border bg-card px-4 py-3 lg:px-6">
        <Breadcrumbs path="" extra="Global Finance Map" />
        <h1 className="mt-2 text-xl font-semibold">Global Finance Map</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The canonical application tree. Every node is navigable; implementation status only controls page content.
        </p>
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span><strong className="num text-foreground">{nodes.length}</strong> nodes</span>
          <span><strong className="num text-foreground">{implemented}</strong> implemented</span>
          <span><strong className="num text-foreground">{nodes.length - implemented}</strong> placeholder</span>
        </div>
      </header>
      <div className="space-y-3 p-4 lg:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <SearchBar value={query} onChange={setQuery} placeholder="Search the tree" />
          <Button size="sm" variant="outline" onClick={() => setExpanded(new Set(nodes.map((n) => n.path)))}>
            Expand All
          </Button>
          <Button size="sm" variant="outline" onClick={() => setExpanded(new Set())}>
            Collapse All
          </Button>
        </div>
        <div className="rounded-sm border border-border bg-card p-2">
          <div className="mb-1 hidden justify-end gap-2 border-b border-border px-2 pb-1 text-[11px] font-semibold text-muted-foreground uppercase sm:flex">
            <span className="w-16">Type</span>
            <span className="w-24">Status</span>
          </div>
          <FinanceTree nodes={financeTree} expanded={expanded} onToggle={toggle} visible={visible} showMeta />
        </div>
      </div>
    </div>
  );
}
