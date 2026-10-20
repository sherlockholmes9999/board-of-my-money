import { createFileRoute } from "@tanstack/react-router";

import { MODULE_ICONS } from "@/components/fat/FinanceTree";
import { NodeLink } from "@/components/fat/NodeLink";
import { StatusBadge } from "@/components/fat/StatusBadge";
import { APP_NAME, countNodes, financeTree } from "@/lib/fat/tree";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${APP_NAME} — Enterprise Finance Workspace` },
      { name: "description", content: "Finance Accounting Treasury prototype: module navigation and Financial Master Data." },
      { property: "og:title", content: `${APP_NAME} — Enterprise Finance Workspace` },
      { property: "og:description", content: "Navigate the finance architecture and maintain financial master data." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div>
      <header className="border-b border-border bg-card px-4 py-4 lg:px-6">
        <p className="text-xs text-muted-foreground">{APP_NAME}</p>
        <h1 className="mt-1 text-xl font-semibold">Application modules</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Six modules from the canonical architecture. Financial Master Data is implemented in this phase.
        </p>
      </header>
      <div className="p-4 lg:p-6">
        <ul className="divide-y divide-border rounded-sm border border-border bg-card">
          {financeTree.map((m) => {
            const Icon = MODULE_ICONS[m.name]!;
            return (
              <li key={m.path}>
                <NodeLink path={m.path} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/40">
                  <Icon className="size-4 text-muted-foreground" aria-hidden />
                  <span className="flex-1 font-medium">{m.name}</span>
                  <span className="num hidden text-xs text-muted-foreground sm:inline">
                    {m.children.length} submodules · {countNodes(m) - 1} nodes
                  </span>
                  <StatusBadge value={m.implemented ? "Implemented" : "Planned"} />
                </NodeLink>
              </li>
            );
          })}
        </ul>
        <NodeLink path="/map" className="mt-4 inline-block text-sm text-primary hover:underline">
          Open the Global Finance Map →
        </NodeLink>
      </div>
    </div>
  );
}
