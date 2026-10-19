import { Eye, MoreHorizontal, Pencil, Plus, Power, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Row } from "@/lib/fmd/schema";

interface Props {
  row: Row;
  label: string;
  statusful: boolean;
  onView: () => void;
  onEdit: () => void;
  onToggle?: () => void;
  onDelete: () => void;
  onAddChild?: () => void;
}

export function RowMenu({ row, label, statusful, onView, onEdit, onToggle, onDelete, onAddChild }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="grid size-7 place-items-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label={`Actions for ${label}`}
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onSelect={onView}>
          <Eye className="size-3.5" /> View details
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onEdit}>
          <Pencil className="size-3.5" /> Edit
        </DropdownMenuItem>
        {onAddChild ? (
          <DropdownMenuItem onSelect={onAddChild}>
            <Plus className="size-3.5" /> Add child
          </DropdownMenuItem>
        ) : null}
        {statusful && onToggle ? (
          <DropdownMenuItem onSelect={onToggle}>
            <Power className="size-3.5" /> {row.status === "Inactive" ? "Activate" : "Deactivate"}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onDelete} className="text-negative focus:text-negative">
          <Trash2 className="size-3.5" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
