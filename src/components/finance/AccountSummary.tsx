import { Link } from "@tanstack/react-router";
import { Banknote, CreditCard, Landmark, PiggyBank, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { accountBalances } from "@/lib/finance/calc";
import { formatAmount } from "@/lib/finance/format";
import { useFinance } from "@/lib/finance/store";
import type { AccountType } from "@/lib/finance/types";
import { EmptyState } from "./EmptyState";

const ICONS: Record<AccountType, typeof Wallet> = {
  Cash: Banknote,
  Bank: Landmark,
  Wallet: Wallet,
  Savings: PiggyBank,
  "Credit Card": CreditCard,
  Other: Wallet,
};

export function AccountSummary() {
  const { data } = useFinance();
  const balances = accountBalances(data.accounts, data.transactions);
  const assets = data.accounts.filter((a) => !a.isLiability);
  const total = assets.reduce((sum, a) => sum + (balances[a.id] ?? 0), 0);
  const currency = data.settings.currency;

  if (assets.length === 0) {
    return (
      <EmptyState
        title="No accounts yet."
        description="Add an account to start tracking where your money sits."
        action={
          <Button asChild size="sm">
            <Link to="/accounts">Manage Accounts</Link>
          </Button>
        }
      />
    );
  }

  return (
    <section aria-label="Account summary" className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Accounts
        </h2>
        <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs">
          <Link to="/accounts">Manage Accounts</Link>
        </Button>
      </div>
      <div className="scroll-slim -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
        {assets.map((account) => {
          const Icon = ICONS[account.type] ?? Wallet;
          return (
            <article
              key={account.id}
              className="min-w-[160px] rounded-xl border border-border bg-card p-3 shadow-card"
            >
              <div className="flex items-center gap-2">
                <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="truncate text-xs font-semibold tracking-wide uppercase">
                  {account.name}
                </span>
              </div>
              <p className="num mt-2 text-lg font-semibold">
                {formatAmount(balances[account.id] ?? 0, currency)}
              </p>
              <p className="text-xs text-muted-foreground">{account.type}</p>
            </article>
          );
        })}
        <article className="min-w-[160px] rounded-xl border border-primary/25 bg-primary p-3 text-primary-foreground shadow-lift">
          <span className="text-xs font-semibold tracking-wide uppercase opacity-80">Total</span>
          <p className="num mt-2 text-lg font-semibold">{formatAmount(total, currency)}</p>
          <p className="text-xs opacity-75">{assets.length} accounts</p>
        </article>
      </div>
    </section>
  );
}
