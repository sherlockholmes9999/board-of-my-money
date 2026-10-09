import { CheckCircle2, CircleDashed, Clock3, MinusCircle, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type Tone = "positive" | "neutral" | "warning" | "negative" | "info";

const TONES: Record<string, Tone> = {
  active: "positive",
  valid: "positive",
  approved: "positive",
  implemented: "positive",
  passed: "positive",
  yes: "positive",
  implemented_node: "positive",
  inactive: "neutral",
  cancelled: "neutral",
  no: "neutral",
  "not run": "neutral",
  planned: "info",
  draft: "warning",
  pending: "warning",
  submitted: "warning",
  "under review": "warning",
  "not yet valid": "warning",
  expired: "warning",
  warning: "warning",
  info: "info",
  invalid: "negative",
  rejected: "negative",
  failed: "negative",
  error: "negative",
};

const ICONS = {
  positive: CheckCircle2,
  neutral: MinusCircle,
  warning: Clock3,
  negative: XCircle,
  info: CircleDashed,
};

const STYLES: Record<Tone, string> = {
  positive: "border-positive/25 bg-positive-soft text-positive",
  neutral: "border-border bg-muted text-muted-foreground",
  warning: "border-warning/30 bg-warning-soft text-warning",
  negative: "border-negative/25 bg-negative-soft text-negative",
  info: "border-primary/20 bg-secondary text-primary",
};

export function toneFor(value: string): Tone {
  const v = value.toLowerCase();
  if (TONES[v]) return TONES[v]!;
  if (v.startsWith("failed")) return "negative";
  if (v.startsWith("passed")) return "positive";
  return "neutral";
}

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  if (!value || value === "—") return <span className="text-muted-foreground">—</span>;
  const tone = toneFor(value);
  const Icon = ICONS[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-sm border px-1.5 py-0.5 text-[11px] font-medium leading-none",
        STYLES[tone],
        className,
      )}
    >
      <Icon className="size-3" aria-hidden />
      {value}
    </span>
  );
}
