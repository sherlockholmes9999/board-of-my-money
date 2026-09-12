import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/finance/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  accountBalances,
  balanceSheet,
  cashFlowStatement,
  categoryRows,
  columnTotals,
  incomeStatement,
} from "@/lib/finance/calc";
import { formatAmount, formatNumber } from "@/lib/finance/format";
import { useFinance } from "@/lib/finance/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reporting")({
  head: () => ({
    meta: [
      { title: "Reporting — Personal Financial Board" },
      {
        name: "description",
        content:
          "Income statement, balance sheet, cash flow statement and simple charts calculated from the transactions you entered.",
      },
      { property: "og:title", content: "Reporting — Personal Financial Board" },
      {
        property: "og:description",
        content: "Deterministic statements and charts from your own data.",
      },
    ],
  }),
  component: ReportingPage,
});

function ReportingPage() {
  const { data } = useFinance();
  const currency = data.settings.currency;
  const income = incomeStatement(data);
  const sheet = balanceSheet(data);
  const cash = cashFlowStatement(data);

  const columns = useMemo(
    () => [...data.columns].sort((a, b) => a.order - b.order),
    [data.columns],
  );
  const totals = columnTotals(columns, data.transactions, data.accounts);
  const overTime = columns.map((c) => ({
    name: c.name,
    Income: totals[c.id]?.in ?? 0,
    Expenses: totals[c.id]?.out ?? 0,
    Net: totals[c.id]?.net ?? 0,
  }));
  const balances = accountBalances(data.accounts, data.transactions);
  const accountData = data.accounts
    .filter((a) => !a.isLiability)
    .map((a) => ({ name: a.name, Balance: balances[a.id] ?? 0 }));
  const spending = categoryRows(data)
    .filter((r) => r.actual > 0)
    .map((r) => ({ name: r.category.name, value: r.actual, color: r.category.color }));

  return (
    <div className="space-y-6">
      <PageHeader title="Reporting" subtitle="September 2026 · calculated from your entries." />

      <Tabs defaultValue="income">
        <TabsList className="flex-wrap">
          <TabsTrigger value="income">Income Statement</TabsTrigger>
          <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cash">Cash Flow</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Statement title="Income Statement">
            <Group title="Income" lines={income.income} currency={currency} />
            <TotalRow label="Total Income" value={income.totalIncome} currency={currency} tone="positive" />
            <Group title="Expenses" lines={income.expenses} currency={currency} />
            <TotalRow label="Total Expenses" value={income.totalExpenses} currency={currency} tone="negative" />
            <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary px-3 py-2.5">
              <span className="text-sm font-semibold tracking-wide uppercase">Net Income</span>
              <span
                className={cn(
                  "num text-lg font-semibold",
                  income.netIncome >= 0 ? "text-positive" : "text-negative",
                )}
              >
                {formatAmount(income.netIncome, currency)}
              </span>
            </div>
          </Statement>

          <ChartCard title="Income vs Expenses">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={[
                  { name: "Income", value: income.totalIncome },
                  { name: "Expenses", value: income.totalExpenses },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v: number) => formatAmount(v, currency)} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  <Cell fill="var(--color-chart-1)" />
                  <Cell fill="var(--color-chart-2)" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="balance" className="mt-4">
          <Statement title="Balance Sheet">
            <Group title="Assets" lines={sheet.assets} currency={currency} />
            <TotalRow label="Total Assets" value={sheet.totalAssets} currency={currency} />
            <Group title="Liabilities" lines={sheet.liabilities} currency={currency} />
            <TotalRow label="Total Liabilities" value={sheet.totalLiabilities} currency={currency} />
            <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary px-3 py-2.5">
              <span className="text-sm font-semibold tracking-wide uppercase">Net Position</span>
              <span className="num text-lg font-semibold">
                {formatAmount(sheet.netPosition, currency)}
              </span>
            </div>
          </Statement>
        </TabsContent>

        <TabsContent value="cash" className="mt-4">
          <Statement title="Cash Flow Statement">
            <TotalRow label="Opening Cash" value={cash.opening} currency={currency} />
            <Group
              title="Operating"
              currency={currency}
              lines={[
                { label: "Income", value: cash.opIn },
                { label: "Expenses", value: cash.opOut },
              ]}
            />
            <TotalRow
              label="Operating Cash Flow"
              value={cash.operating}
              currency={currency}
              tone={cash.operating >= 0 ? "positive" : "negative"}
            />
            <Group
              title="Investing"
              currency={currency}
              lines={[{ label: "Asset purchases", value: cash.investing }]}
            />
            <Group
              title="Financing"
              currency={currency}
              lines={[{ label: "Debt / financing", value: cash.financing }]}
            />
            <TotalRow
              label="Net Change"
              value={cash.netChange}
              currency={currency}
              tone={cash.netChange >= 0 ? "positive" : "negative"}
            />
            <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary px-3 py-2.5">
              <span className="text-sm font-semibold tracking-wide uppercase">Closing Cash</span>
              <span className="num text-lg font-semibold">{formatAmount(cash.closing, currency)}</span>
            </div>
          </Statement>
        </TabsContent>

        <TabsContent value="charts" className="mt-4 grid gap-4 lg:grid-cols-2">
          <ChartCard title="Cash Flow Over Time">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={overTime}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v: number) => formatAmount(v, currency)} />
                <Legend />
                <Line type="monotone" dataKey="Income" stroke="var(--color-chart-1)" strokeWidth={2} />
                <Line type="monotone" dataKey="Expenses" stroke="var(--color-chart-2)" strokeWidth={2} />
                <Line type="monotone" dataKey="Net" stroke="var(--color-chart-3)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Income vs Expenses">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={overTime}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v: number) => formatAmount(v, currency)} />
                <Legend />
                <Bar dataKey="Income" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Spending by Category">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={spending} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100}>
                  {spending.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatAmount(v, currency)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Account Balances">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={accountData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v: number) => formatAmount(v, currency)} />
                <Bar dataKey="Balance" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Statement({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-card">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Group({
  title,
  lines,
  currency,
}: {
  title: string;
  lines: { label: string; value: number }[];
  currency: string;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {title}
      </h3>
      <dl className="mt-2 space-y-1">
        {lines.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing recorded.</p>
        ) : (
          lines.map((line) => (
            <div key={line.label} className="flex items-baseline justify-between gap-3 text-sm">
              <dt className="text-foreground">{line.label}</dt>
              <dd className="num text-muted-foreground">{formatNumber(line.value)}</dd>
            </div>
          ))
        )}
      </dl>
      <p className="sr-only">{currency}</p>
    </div>
  );
}

function TotalRow({
  label,
  value,
  currency,
  tone,
}: {
  label: string;
  value: number;
  currency: string;
  tone?: "positive" | "negative";
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-t border-border pt-2 text-sm font-semibold">
      <span>{label}</span>
      <span
        className={cn(
          "num",
          tone === "positive" && "text-positive",
          tone === "negative" && "text-negative",
        )}
      >
        {formatAmount(value, currency)}
      </span>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-card">
      <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase">{title}</h2>
      {children}
    </article>
  );
}
