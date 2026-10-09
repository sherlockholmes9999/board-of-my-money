import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface FilterDef {
  id: string;
  label: string;
  options: { value: string; label: string }[];
}

interface Props {
  search: string;
  onSearch: (v: string) => void;
  filters?: FilterDef[];
  values?: Record<string, string>;
  onFilter?: (id: string, v: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="relative block w-full sm:w-64">
      <span className="sr-only">Search</span>
      <Search className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Search records"}
        className="h-8 w-full rounded-sm border border-input bg-background pr-2 pl-7 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      />
    </label>
  );
}

export const selectClass =
  "h-8 rounded-sm border border-input bg-background px-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

export function FilterBar({ search, onSearch, filters = [], values = {}, onFilter, onClear, placeholder }: Props) {
  const active = !!search || Object.values(values).some(Boolean);
  return (
    <div className="flex flex-wrap items-center gap-2" role="search">
      <SearchBar value={search} onChange={onSearch} placeholder={placeholder} />
      {filters.map((f) => (
        <label key={f.id} className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="sr-only sm:not-sr-only">{f.label}</span>
          <select
            className={selectClass}
            value={values[f.id] ?? ""}
            onChange={(e) => onFilter?.(f.id, e.target.value)}
            aria-label={`Filter by ${f.label}`}
          >
            <option value="">All</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      ))}
      {active ? (
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="size-3.5" aria-hidden /> Clear Filters
        </Button>
      ) : null}
    </div>
  );
}
