import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface Props {
  path: string;
  selected?: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  title?: string;
}

/** Link to any canonical tree path (all resolve through the catch-all route). */
export function NodeLink({ path, selected, className, children, onClick, title }: Props) {
  if (path === "/" || path === "") {
    return (
      <Link to="/" className={className} onClick={onClick} title={title}>
        {children}
      </Link>
    );
  }
  return (
    <Link
      to="/$"
      params={{ _splat: path.replace(/^\//, "") }}
      search={selected ? { selected } : {}}
      className={className}
      onClick={onClick}
      title={title}
    >
      {children}
    </Link>
  );
}
