import type { FinanceNode } from "@/lib/fat/tree";
import { trail } from "@/lib/fat/tree";
import { ModuleHeader } from "./ModuleHeader";
import { NodeLink } from "./NodeLink";
import { StatusBadge } from "./StatusBadge";

export function PlaceholderPage({ node }: { node: FinanceNode }) {
  const chain = trail(node.path);
  const parent = chain.length > 1 ? chain[chain.length - 2] : null;
  return (
    <div>
      <ModuleHeader path={node.path} title={node.name} />
      <div className="p-4 lg:p-6">
        <section className="max-w-3xl rounded-sm border border-border bg-card">
          <div className="border-b border-border px-4 py-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Module placeholder
          </div>
          <div className="space-y-4 p-4">
            <p className="font-mono text-xs text-muted-foreground">{chain.map((n) => n.name).join(" → ")}</p>
            <div>
              <p className="text-base font-semibold">Module not implemented</p>
              <p className="mt-1 text-sm text-muted-foreground">
                This module is part of the Finance Accounting Treasury architecture and is scheduled for
                implementation.
              </p>
            </div>
            <dl className="grid grid-cols-[140px_1fr] gap-y-2 text-sm">
              <dt className="text-muted-foreground">Module name</dt>
              <dd>{node.name}</dd>
              <dt className="text-muted-foreground">Node type</dt>
              <dd className="capitalize">{node.type}</dd>
              <dt className="text-muted-foreground">Parent module</dt>
              <dd>{parent ? <NodeLink path={parent.path} className="text-primary hover:underline">{parent.name}</NodeLink> : "Finance Accounting Treasury"}</dd>
              <dt className="text-muted-foreground">Status</dt>
              <dd><StatusBadge value="Planned" /></dd>
              <dt className="text-muted-foreground">Route</dt>
              <dd className="font-mono text-xs">{node.path}</dd>
            </dl>
            {node.children.length ? (
              <div>
                <p className="mb-1 text-xs font-semibold text-muted-foreground uppercase">Child capabilities</p>
                <ul className="divide-y divide-border rounded-sm border border-border">
                  {node.children.map((c) => (
                    <li key={c.path}>
                      <NodeLink path={c.path} className="flex items-center justify-between px-3 py-1.5 text-sm hover:bg-muted">
                        {c.name}
                        <span className="text-[11px] text-muted-foreground capitalize">{c.type}</span>
                      </NodeLink>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
