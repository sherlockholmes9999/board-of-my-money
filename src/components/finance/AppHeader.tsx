import { Link } from "@tanstack/react-router";
import { Menu, Plus, Settings, Wallet } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { accountBalances, boardOpening } from "@/lib/finance/calc";
import { formatAmount } from "@/lib/finance/format";
import { useFinance } from "@/lib/finance/store";
import { cn } from "@/lib/utils";
import { useTransactionDialog } from "./TransactionDialog";

const NAV = [
  { to: "/", label: "Planning" },
  { to: "/reporting", label: "Reporting" },
  { to: "/categories", label: "Categories" },
] as const;

const SECONDARY = [
  { to: "/accounts", label: "Accounts" },
  { to: "/settings", label: "Settings" },
] as const;

export function AppHeader() {
  const { data } = useFinance();
  const dialog = useTransactionDialog();
  const [menuOpen, setMenuOpen] = useState(false);

  const balances = accountBalances(data.accounts, data.transactions);
  const total = data.accounts
    .filter((a) => !a.isLiability)
    .reduce((sum, a) => sum + (balances[a.id] ?? 0), 0);
  void boardOpening;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto grid max-w-[1600px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 lg:flex lg:justify-between lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Wallet className="size-4" aria-hidden />
          </span>
          <Link to="/" className="min-w-0">
            <span className="block truncate font-display text-base font-semibold">
              Personal Financial Board
            </span>
          </Link>
        </div>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
          <span className="mx-2 h-5 w-px bg-border" aria-hidden />
          {SECONDARY.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden rounded-lg border border-border bg-card px-3 py-1.5 text-right sm:block">
            <span className="block text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
              Total balance
            </span>
            <span className="num block text-sm font-semibold">
              {formatAmount(total, data.settings.currency)}
            </span>
          </div>
          <Button size="sm" onClick={() => dialog.openNew()}>
            <Plus className="size-4" aria-hidden />
            <span className="hidden sm:inline">Add Transaction</span>
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label="Settings">
            <Link to="/settings">
              <Settings className="size-4" aria-hidden />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Menu className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      <nav
        aria-label="Mobile"
        className={cn("border-t border-border px-4 pb-3 lg:hidden", menuOpen ? "block" : "hidden")}
      >
        <ul className="grid gap-1 pt-2">
          {[...NAV, ...SECONDARY].map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
