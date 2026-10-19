import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CHANGE_FLOW, todayISO } from "@/lib/fmd/logic";
import type { Row } from "@/lib/fmd/schema";
import { useRepo } from "@/lib/fmd/store";
import { cn } from "@/lib/utils";

const NEXT: Record<string, { label: string; to: string }[]> = {
  Draft: [{ label: "Submit", to: "Submitted" }, { label: "Cancel", to: "Cancelled" }],
  Submitted: [{ label: "Start Review", to: "Under Review" }, { label: "Cancel", to: "Cancelled" }],
  "Under Review": [{ label: "Approve", to: "Approved" }, { label: "Reject", to: "Rejected" }],
  Approved: [{ label: "Mark Implemented", to: "Implemented" }],
  Rejected: [{ label: "Return to Draft", to: "Draft" }],
};

/** Prototype change lifecycle: deterministic status transitions only. */
export function ChangeLifecycle({ row }: { row: Row }) {
  const repo = useRepo("changeControl");
  const status = row.status ?? "Draft";
  const terminal = status === "Rejected" || status === "Cancelled";
  const reached = CHANGE_FLOW.indexOf(status as (typeof CHANGE_FLOW)[number]);

  const move = (to: string) => {
    const patch: Record<string, string> = { status: to };
    if (to === "Approved" && !row.approvedBy) patch.approvedBy = "Finance Controller";
    if (to === "Implemented" && !row.effectiveDate) patch.effectiveDate = todayISO();
    repo.update(row.id, patch);
  };

  return (
    <section>
      <h3 className="mb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Change Lifecycle</h3>
      <ol className="flex flex-wrap items-center gap-1 text-[11px]">
        {CHANGE_FLOW.map((step, i) => {
          const done = !terminal && reached >= i;
          return (
            <li key={step} className="flex items-center gap-1">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5",
                  done ? "border-primary/30 bg-secondary font-medium text-primary" : "border-border text-muted-foreground",
                  step === status && "ring-1 ring-primary",
                )}
              >
                {done ? <Check className="size-3" aria-hidden /> : null}
                {step}
              </span>
              {i < CHANGE_FLOW.length - 1 ? <span className="text-muted-foreground">›</span> : null}
            </li>
          );
        })}
      </ol>
      {terminal ? (
        <p className="mt-2 text-xs text-muted-foreground">
          This change ended with status <strong>{status}</strong>.
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {(NEXT[status] ?? []).map((a) => (
          <Button key={a.to} size="sm" variant="outline" onClick={() => move(a.to)}>
            {a.label}
          </Button>
        ))}
      </div>
    </section>
  );
}
