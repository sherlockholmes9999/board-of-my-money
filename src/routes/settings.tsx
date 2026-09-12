import { Link, createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/finance/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFinance } from "@/lib/finance/store";
import type { Settings } from "@/lib/finance/types";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Personal Financial Board" },
      {
        name: "description",
        content: "Set your default currency, default planning period and interface theme.",
      },
      { property: "og:title", content: "Settings — Personal Financial Board" },
      { property: "og:description", content: "Currency, planning period and theme preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data, updateSettings, resetDemo } = useFinance();
  const s = data.settings;

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Settings" subtitle="A few preferences. Nothing more." />

      <section className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-card">
        <h2 className="text-sm font-semibold tracking-wide uppercase">General</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-1.5">
            <Label htmlFor="currency">Default currency</Label>
            <Input
              id="currency"
              value={s.currency}
              onChange={(e) => updateSettings({ currency: e.target.value.toUpperCase() })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Default planning period</Label>
            <Select
              value={s.defaultPeriod}
              onValueChange={(v) => updateSettings({ defaultPeriod: v as Settings["defaultPeriod"] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Week">Week</SelectItem>
                <SelectItem value="Month">Month</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Theme</Label>
            <Select
              value={s.theme}
              onValueChange={(v) => updateSettings({ theme: v as Settings["theme"] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <LinkCard to="/categories" title="Categories" text="Organize and budget your spending." />
        <LinkCard to="/accounts" title="Accounts" text="Manage where your money is held." />
      </section>

      <section className="rounded-xl border border-border bg-card p-4 shadow-card">
        <h2 className="text-sm font-semibold tracking-wide uppercase">Data</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your data is stored on this device only.
        </p>
        <Button variant="outline" size="sm" className="mt-3" onClick={resetDemo}>
          Reset to demo data
        </Button>
      </section>
    </div>
  );
}

function LinkCard({ to, title, text }: { to: "/categories" | "/accounts"; title: string; text: string }) {
  return (
    <Link
      to={to}
      className="rounded-xl border border-border bg-card p-4 shadow-card transition-colors hover:bg-muted"
    >
      <p className="font-display text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </Link>
  );
}
