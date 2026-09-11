import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFinance } from "@/lib/finance/store";
import { todayISO } from "@/lib/finance/format";
import {
  ACCOUNTING_TYPES,
  CASHFLOW_TYPES,
  type AccountingType,
  type CashflowType,
  type Direction,
  type Transaction,
} from "@/lib/finance/types";
import { cn } from "@/lib/utils";

interface DialogApi {
  openNew: (defaults?: { columnId?: string }) => void;
  openEdit: (transaction: Transaction) => void;
}

const TransactionDialogContext = createContext<DialogApi | null>(null);

interface FormState {
  title: string;
  amount: string;
  direction: Direction;
  date: string;
  columnId: string;
  accountId: string;
  toAccountId: string;
  categoryId: string;
  accountingType: AccountingType;
  cashflowType: CashflowType;
  notes: string;
}

export function TransactionDialogProvider({ children }: { children: ReactNode }) {
  const { data, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const blank = useCallback(
    (columnId?: string): FormState => ({
      title: "",
      amount: "",
      direction: "out",
      date: todayISO(),
      columnId: columnId ?? data.columns[0]?.id ?? "",
      accountId: data.accounts[0]?.id ?? "",
      toAccountId: data.accounts[1]?.id ?? "",
      categoryId: data.categories[0]?.id ?? "",
      accountingType: "Expense",
      cashflowType: "Operating",
      notes: "",
    }),
    [data.columns, data.accounts, data.categories],
  );

  const api = useMemo<DialogApi>(
    () => ({
      openNew: (defaults) => {
        setEditing(null);
        setForm(blank(defaults?.columnId));
        setErrors({});
        setConfirmDelete(false);
        setOpen(true);
      },
      openEdit: (transaction) => {
        setEditing(transaction);
        setForm({
          title: transaction.title,
          amount: String(transaction.amount),
          direction: transaction.direction,
          date: transaction.date,
          columnId: transaction.columnId,
          accountId: transaction.accountId,
          toAccountId: transaction.toAccountId ?? data.accounts[1]?.id ?? "",
          categoryId: transaction.categoryId,
          accountingType: transaction.accountingType,
          cashflowType: transaction.cashflowType,
          notes: transaction.notes ?? "",
        });
        setErrors({});
        setConfirmDelete(false);
        setOpen(true);
      },
    }),
    [blank, data.accounts],
  );

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const isTransfer = form?.accountingType === "Transfer";

  useEffect(() => {
    if (isTransfer && form && form.cashflowType !== "Transfer") {
      setForm({ ...form, cashflowType: "Transfer", direction: "out" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTransfer]);

  function submit() {
    if (!form) return;
    const nextErrors: Record<string, string> = {};
    if (!form.title.trim()) nextErrors['title'] = "Give the transaction a name.";
    const amount = Number(form.amount);
    if (!form.amount || Number.isNaN(amount) || amount <= 0)
      nextErrors['amount'] = "Enter an amount greater than zero.";
    if (!form.columnId) nextErrors['columnId'] = "Choose a planning period.";
    if (isTransfer && form.accountId === form.toAccountId)
      nextErrors['toAccountId'] = "Choose two different accounts.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      title: form.title.trim(),
      amount,
      currency: data.settings.currency,
      date: form.date,
      columnId: form.columnId,
      accountId: form.accountId,
      toAccountId: isTransfer ? form.toAccountId : undefined,
      categoryId: form.categoryId,
      direction: isTransfer ? ("out" as Direction) : form.direction,
      accountingType: form.accountingType,
      cashflowType: form.cashflowType,
      notes: form.notes.trim() || undefined,
    };

    if (editing) updateTransaction(editing.id, payload);
    else addTransaction(payload);
    setOpen(false);
  }

  return (
    <TransactionDialogContext.Provider value={api}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92dvh] gap-0 overflow-y-auto p-0 sm:max-w-2xl">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle>{editing ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
            <DialogDescription>
              You choose every classification. Nothing is filled in automatically.
            </DialogDescription>
          </DialogHeader>

          {form ? (
            <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
              <Field label="Name" error={errors['title']} className="sm:col-span-2">
                <Input
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="Amazon"
                  autoFocus
                />
              </Field>

              <Field label="Amount" error={errors['amount']}>
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => set("amount", e.target.value)}
                  placeholder="500"
                />
              </Field>

              {!isTransfer ? (
                <Field label="Direction">
                  <div
                    role="radiogroup"
                    aria-label="Direction"
                    className="inline-flex w-full rounded-lg border border-border bg-muted p-1"
                  >
                    {(["in", "out"] as Direction[]).map((d) => (
                      <button
                        key={d}
                        type="button"
                        role="radio"
                        aria-checked={form.direction === d}
                        onClick={() => set("direction", d)}
                        className={cn(
                          "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                          form.direction === d
                            ? d === "in"
                              ? "bg-positive-soft text-positive"
                              : "bg-negative-soft text-negative"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {d === "in" ? "IN" : "OUT"}
                      </button>
                    ))}
                  </div>
                </Field>
              ) : (
                <Field label="Direction">
                  <p className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
                    Transfers only move money between accounts.
                  </p>
                </Field>
              )}

              <Field label="Date">
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => set("date", e.target.value)}
                />
              </Field>

              <Field label="Planning Period" error={errors['columnId']}>
                <Select value={form.columnId} onValueChange={(v) => set("columnId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.columns.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label={isTransfer ? "From Account" : "Account"}>
                <Select value={form.accountId} onValueChange={(v) => set("accountId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {isTransfer ? (
                <Field label="To Account" error={errors['toAccountId']}>
                  <Select value={form.toAccountId} onValueChange={(v) => set("toAccountId", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              ) : null}

              <Field label="Category">
                <Select value={form.categoryId} onValueChange={(v) => set("categoryId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="flex items-center gap-2">
                          <span
                            className="size-2.5 rounded-full"
                            style={{ backgroundColor: c.color }}
                          />
                          {c.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Accounting Type">
                <Select
                  value={form.accountingType}
                  onValueChange={(v) => set("accountingType", v as AccountingType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNTING_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Cash Flow Type">
                <Select
                  value={form.cashflowType}
                  onValueChange={(v) => set("cashflowType", v as CashflowType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CASHFLOW_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Notes" className="sm:col-span-2">
                <Textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  rows={3}
                  placeholder="Optional"
                />
              </Field>
            </div>
          ) : null}

          <DialogFooter className="flex-col gap-2 border-t border-border px-6 py-4 sm:flex-row sm:justify-between">
            <div>
              {editing ? (
                confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Delete this transaction?</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        deleteTransaction(editing.id);
                        setOpen(false);
                      }}
                    >
                      Delete
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setConfirmDelete(true)}
                  >
                    Delete
                  </Button>
                )
              ) : null}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submit}>{editing ? "Save Changes" : "Save Transaction"}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TransactionDialogContext.Provider>
  );
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string | undefined;
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function useTransactionDialog(): DialogApi {
  const ctx = useContext(TransactionDialogContext);
  if (!ctx) throw new Error("useTransactionDialog must be used inside TransactionDialogProvider");
  return ctx;
}
