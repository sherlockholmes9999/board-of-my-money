import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { AccountSummary } from "@/components/finance/AccountSummary";
import { EmptyState } from "@/components/finance/EmptyState";
import { PageHeader } from "@/components/finance/PageHeader";
import { PlanningBoard } from "@/components/finance/PlanningBoard";
import { useTransactionDialog } from "@/components/finance/TransactionDialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { boardSummary } from "@/lib/finance/calc";
import { formatAmount } from "@/lib/finance/format";
import { useFinance } from "@/lib/finance/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Planning — Personal Financial Board" },
      {
        name: "description",
        content:
          "Plan and organize your money across time on a horizontal financial board with manual categories, accounts and deterministic totals.",
      },
      { property: "og:title", content: "Planning — Personal Financial Board" },
      {
        property: "og:description",
        content: "Plan your income, expenses and transfers period by period.",
      },
    ],
  }),
  component: PlanningPage,
});

function PlanningPage() {
  const { data, status, error } = useFinance();
  const dialog = useTransactionDialog();
  const summary = boardSummary(data);
  const currency = data.settings.currency;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planning"
        subtitle="Plan and organize your money across time."
        actions={
          <>
            <Select defaultValue={data.settings.defaultPeriod}>
              <SelectTrigger className="w-[120px]" aria-label="Period type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Week">Week</SelectItem>
                <SelectItem value="Month">Month</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => dialog.openNew()}>
              <Plus className="size-4" aria-hidden />
              Add Transaction
            </Button>
          </>
        }
      />

      {error ? (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-negative-soft px-3 py-2 text-sm text-negative">
          {error}
        </p>
      ) : null}

      <AccountSummary />

      <section aria-label="Board summary" className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <SummaryTile label="Planned income" value={formatAmount(summary.income, currency)} tone="positive" />
        <SummaryTile label="Planned expenses" value={formatAmount(-summary.expenses, currency)} tone="negative" />
        <SummaryTile
          label="Net"
          value={formatAmount(summary.net, currency)}
          tone={summary.net >= 0 ? "positive" : "negative"}
        />
        <SummaryTile label="Opening balance" value={formatAmount(summary.opening, currency)} />
        <SummaryTile label="Planned closing" value={formatAmount(summary.closing, currency)} emphasis />
      </section>

      {status !== "loading" && data.transactions.length === 0 ? (
        <EmptyState
          title="No transactions planned yet."
          description="Add your first transaction to start planning your money."
          action={
            <Button onClick={() => dialog.openNew()}>
              <Plus className="size-4" aria-hidden />
              Add Transaction
            </Button>
          }
        />
      ) : null}

      <PlanningBoard />
    </div>
  );
}

function SummaryTile({
  label,
  value,
  tone,
  emphasis,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
  emphasis?: boolean;
}) {
  return (
    <article
      className={cn(
        "rounded-xl border border-border bg-card p-3 shadow-card",
        emphasis && "border-primary/25 bg-primary text-primary-foreground",
      )}
    >
      <p
        className={cn(
          "text-[10px] font-semibold tracking-wider uppercase",
          emphasis ? "opacity-80" : "text-muted-foreground",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "num mt-1 text-lg font-semibold",
          !emphasis && tone === "positive" && "text-positive",
          !emphasis && tone === "negative" && "text-negative",
        )}
      >
        {value}
      </p>
    </article>
  );
}
