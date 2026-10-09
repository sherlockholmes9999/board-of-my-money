import { ChevronRight } from "lucide-react";

import { APP_NAME, trail } from "@/lib/fat/tree";
import { NodeLink } from "./NodeLink";

export function Breadcrumbs({ path, extra }: { path: string; extra?: string }) {
  const nodes = path ? trail(path) : [];
  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <li>
          <NodeLink path="/" className="hover:text-foreground hover:underline">
            {APP_NAME}
          </NodeLink>
        </li>
        {nodes.map((n, i) => {
          const last = i === nodes.length - 1 && !extra;
          return (
            <li key={n.path} className="flex min-w-0 items-center gap-1">
              <ChevronRight className="size-3 shrink-0" aria-hidden />
              {last ? (
                <span aria-current="page" className="truncate font-medium text-foreground">
                  {n.name}
                </span>
              ) : (
                <NodeLink path={n.path} className="truncate hover:text-foreground hover:underline">
                  {n.name}
                </NodeLink>
              )}
            </li>
          );
        })}
        {extra ? (
          <li className="flex items-center gap-1">
            <ChevronRight className="size-3" aria-hidden />
            <span aria-current="page" className="font-medium text-foreground">
              {extra}
            </span>
          </li>
        ) : null}
      </ol>
    </nav>
  );
}
