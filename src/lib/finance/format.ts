export function formatAmount(value: number, currency = "EGP"): string {
  const rounded = Math.round(value * 100) / 100;
  const abs = Math.abs(rounded).toLocaleString("en-US", { maximumFractionDigits: 2 });
  const sign = rounded < 0 ? "-" : "";
  return `${sign}${abs} ${currency}`;
}

export function formatSigned(value: number, currency = "EGP"): string {
  const rounded = Math.round(value * 100) / 100;
  const abs = Math.abs(rounded).toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (rounded === 0) return `0 ${currency}`;
  return `${rounded > 0 ? "+" : "-"}${abs} ${currency}`;
}

export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
