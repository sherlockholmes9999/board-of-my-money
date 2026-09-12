import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { formatAmount, formatShortDate } from "@/lib/finance/format";
import type { Account, Category, Transaction } from "@/lib/finance/types";
import { cn } from "@/lib/utils";

interface Props {
  transaction: Transaction;
  category?: Category | undefined;
  account?: Account | undefined;
  currency: string;
  onOpen?: (t: Transaction) => void;
  dragging?: boolean;
}

export function TransactionCardView({
  transaction,
  category,
  account,
  currency,
  onOpen,
  dragging,
  handleProps,
}: Props & { handleProps?: Record<string, unknown> }) {
  const isTransfer = transaction.accountingType === "Transfer";
  const signed = transaction.direction === "in" ? transaction.amount : -transaction.amount;

  return (
    <div
      className={cn(
        "group relative flex gap-2 rounded-xl border border-border bg-card p-2.5 pl-3 shadow-card transition-shadow",
        dragging && "shadow-lift ring-2 ring-ring/40",
      )}
    >
      <span
        aria-hidden
        className="absolute top-2.5 bottom-2.5 left-0 w-1 rounded-full"
        style={{ backgroundColor: category?.color ?? "var(--color-border)" }}
      />
      <button
        type="button"
        aria-label={`Reorder ${transaction.title}`}
        className="mt-0.5 h-fit cursor-grab touch-none rounded text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:cursor-grabbing"
        {...handleProps}
      >
        <GripVertical className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => onOpen?.(transaction)}
        className="min-w-0 flex-1 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <div className="flex items-start justify-between gap-2">
          <span className="min-w-0 truncate text-sm font-medium">{transaction.title}</span>
          <span
            className={cn(
              "num shrink-0 text-sm font-semibold",
              isTransfer ? "text-neutralv" : signed > 0 ? "text-positive" : "text-negative",
            )}
          >
            {isTransfer
              ? formatAmount(transaction.amount, currency)
              : formatAmount(signed, currency)}
          </span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {category ? (
            <span
              className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: `${category.color}1f`, color: category.color }}
            >
              {category.name}
            </span>
          ) : null}
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {account?.name ?? "—"}
          </span>
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[10px]",
              isTransfer ? "bg-neutralv-soft text-neutralv" : "bg-secondary text-secondary-foreground",
            )}
          >
            {transaction.accountingType}
          </span>
          <span className="ml-auto text-[10px] text-muted-foreground">
            {formatShortDate(transaction.date)}
          </span>
        </div>
      </button>
    </div>
  );
}

export function SortableTransactionCard(props: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.transaction.id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && "opacity-40")}
    >
      <TransactionCardView {...props} handleProps={{ ...attributes, ...listeners }} />
    </li>
  );
}
