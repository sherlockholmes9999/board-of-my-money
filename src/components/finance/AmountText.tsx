import { cn } from "@/lib/utils";
import { formatAmount } from "@/lib/finance/format";

interface Props {
  value: number;
  currency?: string;
  neutral?: boolean;
  className?: string;
  showPlus?: boolean;
}

export function AmountText({ value, currency = "EGP", neutral, className, showPlus }: Props) {
  const tone = neutral
    ? "text-neutralv"
    : value > 0
      ? "text-positive"
      : value < 0
        ? "text-negative"
        : "text-muted-foreground";
  const text = formatAmount(value, currency);
  return (
    <span className={cn("num font-medium", tone, className)}>
      {showPlus && value > 0 ? "+" : ""}
      {text}
    </span>
  );
}
