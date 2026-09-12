import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ChevronLeft, ChevronRight, MoreHorizontal, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

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
import { columnTotals } from "@/lib/finance/calc";
import { formatAmount, formatDate, todayISO } from "@/lib/finance/format";
import { useFinance } from "@/lib/finance/store";
import type { PlanningColumn, Transaction } from "@/lib/finance/types";
import { cn } from "@/lib/utils";
import { EmptyState } from "./EmptyState";
import { SortableTransactionCard, TransactionCardView } from "./TransactionCard";
import { useTransactionDialog } from "./TransactionDialog";

export function PlanningBoard() {
  const { data, moveTransaction, addColumn, updateColumn, deleteColumn, status } = useFinance();
  const dialog = useTransactionDialog();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [columnForm, setColumnForm] = useState<{
    mode: "new" | "edit";
    column: PlanningColumn | null;
    name: string;
    startDate: string;
    endDate: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PlanningColumn | null>(null);

  const currency = data.settings.currency;
  const columns = useMemo(
    () => [...data.columns].sort((a, b) => a.order - b.order),
    [data.columns],
  );
  const totals = useMemo(
    () => columnTotals(columns, data.transactions, data.accounts),
    [columns, data.transactions, data.accounts],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.transactions.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q)) return false;
      if (categoryFilter !== "all" && t.categoryId !== categoryFilter) return false;
      if (accountFilter !== "all" && t.accountId !== accountFilter && t.toAccountId !== accountFilter)
        return false;
      if (typeFilter !== "all" && t.accountingType !== typeFilter) return false;
      return true;
    });
  }, [data.transactions, search, categoryFilter, accountFilter, typeFilter]);

  const byColumn = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    for (const col of columns) map[col.id] = [];
    for (const t of visible) map[t.columnId]?.push(t);
    return map;
  }, [columns, visible]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const activeTransaction = activeId ? data.transactions.find((t) => t.id === activeId) : null;

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const activeTx = data.transactions.find((t) => t.id === active.id);
    if (!activeTx) return;
    const overId = String(over.id);

    if (overId.startsWith("col:")) {
      const columnId = overId.slice(4);
      moveTransaction(activeTx.id, columnId);
      return;
    }
    const overTx = data.transactions.find((t) => t.id === overId);
    if (!overTx || overTx.id === activeTx.id) return;
    moveTransaction(activeTx.id, overTx.columnId, overTx.id);
  }

  function saveColumn() {
    if (!columnForm) return;
    const name = columnForm.name.trim() || "Untitled period";
    if (columnForm.mode === "new") {
      addColumn({ name, startDate: columnForm.startDate, endDate: columnForm.endDate });
    } else if (columnForm.column) {
      updateColumn(columnForm.column.id, {
        name,
        startDate: columnForm.startDate,
        endDate: columnForm.endDate,
      });
    }
    setColumnForm(null);
  }

  if (status === "loading") {
    return (
      <div className="flex gap-4 overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-72 w-[300px] shrink-0 animate-pulse rounded-2xl border border-border bg-surface"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-card">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Previous period">
            <ChevronLeft className="size-4" aria-hidden />
          </Button>
          <span className="px-1 text-sm font-medium whitespace-nowrap">September 2026</span>
          <Button variant="ghost" size="icon" aria-label="Next period">
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </div>

        <div className="relative min-w-[160px] flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions"
            aria-label="Search transactions"
            className="h-9 pl-8"
          />
        </div>

        <FilterSelect
          value={categoryFilter}
          onChange={setCategoryFilter}
          label="Category"
          options={data.categories.map((c) => ({ value: c.id, label: c.name }))}
        />
        <FilterSelect
          value={accountFilter}
          onChange={setAccountFilter}
          label="Account"
          options={data.accounts.map((a) => ({ value: a.id, label: a.name }))}
        />
        <FilterSelect
          value={typeFilter}
          onChange={setTypeFilter}
          label="Type"
          options={["Income", "Expense", "Transfer"].map((t) => ({ value: t, label: t }))}
        />

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setColumnForm({
              mode: "new",
              column: null,
              name: "",
              startDate: todayISO(),
              endDate: todayISO(),
            })
          }
        >
          <Plus className="size-4" aria-hidden />
          Add Column
        </Button>
      </div>

      {columns.length === 0 ? (
        <EmptyState
          title="No planning periods yet."
          description="Add a column to start planning your money across time."
          action={
            <Button
              onClick={() =>
                setColumnForm({
                  mode: "new",
                  column: null,
                  name: "",
                  startDate: todayISO(),
                  endDate: todayISO(),
                })
              }
            >
              <Plus className="size-4" aria-hidden />
              Add Column
            </Button>
          }
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <div className="scroll-slim -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
            {columns.map((column) => (
              <BoardColumn
                key={column.id}
                column={column}
                transactions={byColumn[column.id] ?? []}
                currency={currency}
                totals={totals[column.id]}
                onAdd={() => dialog.openNew({ columnId: column.id })}
                onEdit={() =>
                  setColumnForm({
                    mode: "edit",
                    column,
                    name: column.name,
                    startDate: column.startDate,
                    endDate: column.endDate,
                  })
                }
                onDelete={() => setDeleteTarget(column)}
                onOpenTransaction={dialog.openEdit}
                categories={data.categories}
                accounts={data.accounts}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTransaction ? (
              <div className="w-[280px] rotate-1">
                <TransactionCardView
                  transaction={activeTransaction}
                  currency={currency}
                  category={data.categories.find((c) => c.id === activeTransaction.categoryId)}
                  account={data.accounts.find((a) => a.id === activeTransaction.accountId)}
                  dragging
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <Dialog open={columnForm !== null} onOpenChange={(o) => !o && setColumnForm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {columnForm?.mode === "edit" ? "Edit Period" : "Add Planning Period"}
            </DialogTitle>
            <DialogDescription>Name the period and set its date range.</DialogDescription>
          </DialogHeader>
          {columnForm ? (
            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="col-name">Name</Label>
                <Input
                  id="col-name"
                  value={columnForm.name}
                  onChange={(e) => setColumnForm({ ...columnForm, name: e.target.value })}
                  placeholder="1–5 OCT"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="col-start">Start date</Label>
                  <Input
                    id="col-start"
                    type="date"
                    value={columnForm.startDate}
                    onChange={(e) => setColumnForm({ ...columnForm, startDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="col-end">End date</Label>
                  <Input
                    id="col-end"
                    type="date"
                    value={columnForm.endDate}
                    onChange={(e) => setColumnForm({ ...columnForm, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setColumnForm(null)}>
              Cancel
            </Button>
            <Button onClick={saveColumn}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete period?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `${data.transactions.filter((t) => t.columnId === deleteTarget.id).length} transaction(s) in "${deleteTarget.name}" will be permanently removed.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) deleteColumn(deleteTarget.id);
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

function FilterSelect({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-[130px]" aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {label.toLowerCase()}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface ColumnProps {
  column: PlanningColumn;
  transactions: Transaction[];
  currency: string;
  totals: { in: number; out: number; net: number; opening: number; closing: number } | undefined;
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onOpenTransaction: (t: Transaction) => void;
  categories: { id: string; name: string; color: string }[];
  accounts: { id: string; name: string }[];
}

function BoardColumn({
  column,
  transactions,
  currency,
  totals,
  onAdd,
  onEdit,
  onDelete,
  onOpenTransaction,
  categories,
  accounts,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `col:${column.id}` });

  return (
    <section
      aria-label={column.name}
      className="flex w-[290px] shrink-0 snap-start flex-col rounded-2xl border border-border bg-surface"
    >
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 border-b border-border px-3 py-2.5">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold tracking-wide uppercase">{column.name}</h3>
          <p className="truncate text-[11px] text-muted-foreground">
            {formatDate(column.startDate)}
            {column.endDate !== column.startDate ? ` – ${formatDate(column.endDate)}` : ""}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7" aria-label={`${column.name} options`}>
              <MoreHorizontal className="size-4" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onEdit}>Rename</DropdownMenuItem>
            <DropdownMenuItem onSelect={onEdit}>Edit dates</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onSelect={onDelete}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div
        ref={setNodeRef}
        className={cn(
          "min-h-[120px] flex-1 space-y-2 p-2 transition-colors",
          isOver && "bg-accent/40 ring-2 ring-ring/30 ring-inset",
        )}
      >
        <SortableContext
          items={transactions.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-2">
            {transactions.map((t) => (
              <SortableTransactionCard
                key={t.id}
                transaction={t}
                currency={currency}
                category={categories.find((c) => c.id === t.categoryId)}
                account={accounts.find((a) => a.id === t.accountId)}
                onOpen={onOpenTransaction}
              />
            ))}
          </ul>
        </SortableContext>
        {transactions.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
            Drop a transaction here
          </p>
        ) : null}
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={onAdd}>
          <Plus className="size-4" aria-hidden />
          Add transaction
        </Button>
      </div>

      <footer className="space-y-1 border-t border-border px-3 py-2.5 text-xs">
        <Row label="IN" value={formatAmount(totals?.in ?? 0, currency)} tone="positive" />
        <Row label="OUT" value={formatAmount(-(totals?.out ?? 0), currency)} tone="negative" />
        <div className="my-1 h-px bg-border" />
        <Row
          label="NET"
          value={formatAmount(totals?.net ?? 0, currency)}
          tone={(totals?.net ?? 0) >= 0 ? "positive" : "negative"}
          strong
        />
        <Row label="OPENING" value={formatAmount(totals?.opening ?? 0, currency)} />
        <Row label="CLOSING" value={formatAmount(totals?.closing ?? 0, currency)} strong />
      </footer>
    </section>
  );
}

function Row({
  label,
  value,
  tone,
  strong,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      <span
        className={cn(
          "num",
          strong && "font-semibold",
          tone === "positive" && "text-positive",
          tone === "negative" && "text-negative",
        )}
      >
        {value}
      </span>
    </div>
  );
}
