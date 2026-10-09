import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { trail } from "@/lib/fat/tree";
import { Breadcrumbs } from "./Breadcrumbs";
import { NodeLink } from "./NodeLink";

interface Props {
  path: string;
  title: string;
  description?: string;
  meta?: ReactNode;
  actions?: ReactNode;
}

export function ModuleHeader({ path, title, description, meta, actions }: Props) {
  const chain = trail(path);
  const parent = chain.length > 1 ? chain[chain.length - 2] : null;
  return (
    <header className="border-b border-border bg-card px-4 py-3 lg:px-6">
      <Breadcrumbs path={path} />
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {parent ? (
              <NodeLink
                path={parent.path}
                className="grid size-6 place-items-center rounded-sm border border-input text-muted-foreground hover:bg-muted hover:text-foreground"
                title={`Back to ${parent.name}`}
              >
                <ArrowLeft className="size-3.5" aria-label={`Back to ${parent.name}`} />
              </NodeLink>
            ) : null}
            <h1 className="truncate text-xl font-semibold">{title}</h1>
          </div>
          {description ? <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p> : null}
          {meta ? <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">{meta}</div> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
