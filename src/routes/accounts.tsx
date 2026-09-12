import { createFileRoute } from "@tanstack/react-router";
import { MoreHorizontal, Plus } from "lucide-react";
import { useState } from "react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { accountBalances } from "@/lib/finance/calc";
import { formatAmount } from "@/lib/finance/format";
import { useFinance } from "@/lib/finance/store";
import { ACCOUNT_TYPES, type Account, type AccountType } from "@/lib/finance/types";

export const Route = createFileRoute("/accounts")({
  head: () => ({
    meta: [
      { title: "Accounts — Personal Financial Board" },
      {
        name: "description",
        content: "Create and manage the accounts that hold your money: cash, bank, wallet, savings.",
      },
      { property: "og:title", content: "Accounts — Personal Financial Board" },
      { property: "og:description", content: "Manage your cash, bank, wallet and savings accounts." },
    ],
  }),
  component: AccountsPage,
});

interface FormState {
  id: string | null;
  name: string;
  type: AccountType;
  openingBalance: string;
  currency: string;
  isLiability: boolean;
}

function AccountsPage() {
  const { data, addAccount, updateAccount, deleteAccount } = useFinance();
  const [form, setForm] = useState<FormState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);
  const balances = accountBalances(data.accounts, data.transactions);
  const currency = data.settings.currency;

  function openNew() {
    setForm({
      id: null,
      name: "",
      type: "Cash",
      openingBalance: "0",
      currency,
      isLiability: false,
    });
  }

  function save() {
    if (!form) return;
    const payload = {
      name: form.name.trim() || "Untitled account",
      type: form.type,
      openingBalance: Number(form.openingBalance) || 0,
      currency: form.currency || currency,
      isLiability: form.type === "Credit Card" ? true : form.isLiability,
    };
    if (form.id) updateAccount(form.id, payload);
    else addAccount(payload);
    setForm(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts"
        subtitle="Containers for your money. Balances update from your transactions."
        actions={
          <Button onClick={openNew}>
            <Plus className="size-4" aria-hidden />
            Add Account
          </Button>
        }
      />

      {data.accounts.length === 0 ? (
        <EmptyState
          title="No accounts yet."
          description="Add an account to start tracking balances."
          action={<Button onClick={openNew}>Add Account</Button>}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-[11px] tracking-wider text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2 font-semibold">Account</th>
                <th className="px-4 py-2 font-semibold">Type</th>
                <th className="px-4 py-2 text-right font-semibold">Opening</th>
                <th className="px-4 py-2 text-right font-semibold">Balance</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {data.accounts.map((account) => (
                <tr key={account.id} className="border-t border-border">
                  <td className="px-4 py-2.5 font-medium">{account.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {account.type}
                    {account.isLiability ? " · liability" : ""}
                  </td>
                  <td className="num px-4 py-2.5 text-right text-muted-foreground">
                    {formatAmount(account.openingBalance, account.currency)}
                  </td>
                  <td className="num px-4 py-2.5 text-right font-semibold">
                    {formatAmount(balances[account.id] ?? 0, account.currency)}
                  </td>
                  <td className="px-2 py-2.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-label={`${account.name} options`}
                        >
                          <MoreHorizontal className="size-4" aria-hidden />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() =>
                            setForm({
                              id: account.id,
                              name: account.name,
                              type: account.type,
                              openingBalance: String(account.openingBalance),
                              currency: account.currency,
                              isLiability: Boolean(account.isLiability),
                            })
                          }
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() => setDeleteTarget(account)}
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

      <Dialog open={form !== null} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{form?.id ? "Edit Account" : "Add Account"}</DialogTitle>
            <DialogDescription>Accounts simply hold money. No banking connection.</DialogDescription>
          </DialogHeader>
          {form ? (
            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="acc-name">Name</Label>
                <Input
                  id="acc-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Cash"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as AccountType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="acc-open">Opening balance</Label>
                  <Input
                    id="acc-open"
                    type="number"
                    value={form.openingBalance}
                    onChange={(e) => setForm({ ...form, openingBalance: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="acc-cur">Currency</Label>
                  <Input
                    id="acc-cur"
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
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
            <DialogTitle>Delete Account?</DialogTitle>
            <DialogDescription>
              This will permanently remove the account. Transactions that used it will keep their
              record but show no account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) deleteAccount(deleteTarget.id);
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
