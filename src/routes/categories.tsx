import { createFileRoute } from "@tanstack/react-router";
import { MoreHorizontal, Plus } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/finance/EmptyState";
import { PageHeader } from "@/components/finance/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { categoryRows } from "@/lib/finance/calc";
import { formatAmount, formatNumber } from "@/lib/finance/format";
import { useFinance } from "@/lib/finance/store";
import type { Category } from "@/lib/finance/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — Personal Financial Board" },
      {
        name: "description",
        content:
          "Organize transactions and compare planned versus actual spending across your own categories.",
      },
      { property: "og:title", content: "Categories — Personal Financial Board" },
      { property: "og:description", content: "Planned versus actual spending by category." },
    ],
  }),
  component: CategoriesPage,
});

interface FormState {
  id: string | null;
  name: string;
  color: string;
  planned: string;
}

function CategoriesPage() {
  const { data, addCategory, updateCategory, deleteCategory } = useFinance();
  const [form, setForm] = useState<FormState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const rows = categoryRows(data);
  const currency = data.settings.currency;

  const spending = rows
    .filter((r) => r.actual > 0)
    .map((r) => ({ name: r.category.name, value: r.actual, color: r.category.color }));
  const comparison = rows
    .filter((r) => r.planned > 0 || r.actual > 0)
    .slice(0, 8)
    .map((r) => ({ name: r.category.name, Planned: r.planned, Actual: r.actual }));

  function save() {
    if (!form) return;
    const payload = {
      name: form.name.trim() || "Untitled",
      color: form.color,
      planned: Number(form.planned) || 0,
    };
    if (form.id) updateCategory(form.id, payload);
    else addCategory(payload);
    setForm(null);
  }

  const usage = (id: string) => data.transactions.filter((t) => t.categoryId === id).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        subtitle="Organize transactions and compare planned versus actual spending."
        actions={
          <Button onClick={() => setForm({ id: null, name: "", color: "#41A08C", planned: "0" })}>
            <Plus className="size-4" aria-hidden />
            Add Category
          </Button>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          title="No categories yet."
          description="Create a category to organize your transactions."
          action={
            <Button onClick={() => setForm({ id: null, name: "", color: "#41A08C", planned: "0" })}>
              <Plus className="size-4" aria-hidden />
              Add Category
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-[11px] tracking-wider text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2 font-semibold">Category</th>
                <th className="px-4 py-2 font-semibold">Color</th>
                <th className="px-4 py-2 text-right font-semibold">Planned</th>
                <th className="px-4 py-2 text-right font-semibold">Actual</th>
                <th className="px-4 py-2 text-right font-semibold">Difference</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ category, planned, actual, difference }) => (
                <tr key={category.id} className="border-t border-border">
                  <td className="px-4 py-2.5 font-medium">{category.name}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className="inline-block size-4 rounded-full ring-1 ring-border"
                      style={{ backgroundColor: category.color }}
                      aria-label={category.color}
                    />
                  </td>
                  <td className="num px-4 py-2.5 text-right text-muted-foreground">
                    {formatNumber(planned)}
                  </td>
                  <td className="num px-4 py-2.5 text-right">{formatNumber(actual)}</td>
                  <td
                    className={cn(
                      "num px-4 py-2.5 text-right font-semibold",
                      difference > 0 && "text-positive",
                      difference < 0 && "text-negative",
                    )}
                  >
                    {difference > 0 ? "+" : ""}
                    {formatNumber(difference)}
                  </td>
                  <td className="px-2 py-2.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-label={`${category.name} options`}
                        >
                          <MoreHorizontal className="size-4" aria-hidden />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() =>
                            setForm({
                              id: category.id,
                              name: category.name,
                              color: category.color,
                              planned: String(category.planned ?? 0),
                            })
                          }
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() => setDeleteTarget(category)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Spending by Category">
          {spending.length === 0 ? (
            <EmptyState title="No spending recorded yet." className="h-full border-0" />
          ) : (
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
          )}
        </ChartCard>

        <ChartCard title="Planned vs Actual">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={comparison}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v: number) => formatAmount(v, currency)} />
              <Legend />
              <Bar dataKey="Planned" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Actual" fill="var(--color-chart-4)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <Dialog open={form !== null} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{form?.id ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>Categories are yours to define and assign manually.</DialogDescription>
          </DialogHeader>
          {form ? (
            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="cat-name">Name</Label>
                <Input
                  id="cat-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Food"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="cat-color">Color</Label>
                  <Input
                    id="cat-color"
                    type="color"
                    className="h-10 p-1"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="cat-planned">Planned amount</Label>
                  <Input
                    id="cat-planned"
                    type="number"
                    value={form.planned}
                    onChange={(e) => setForm({ ...form, planned: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setForm(null)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Category?</DialogTitle>
            <DialogDescription>
              {deleteTarget && usage(deleteTarget.id) > 0
                ? `${usage(deleteTarget.id)} transaction(s) use this category. They keep their record and stay uncategorized.`
                : "This will permanently remove the category."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) deleteCategory(deleteTarget.id);
                setDeleteTarget(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
