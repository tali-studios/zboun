"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { ReactNode } from "react";

type Direction = "asc" | "desc" | null;

type Props = {
  children: ReactNode;
  direction: Direction;
  onClick: () => void;
  className?: string;
};

/** Clickable table header cell with a sort direction indicator — click to sort like a normal table. */
export function SortableTh({ children, direction, onClick, className = "" }: Props) {
  return (
    <th className={`px-4 py-3 text-left ${className}`}>
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest transition ${
          direction ? "text-violet-700" : "text-slate-400 hover:text-slate-600"
        }`}
      >
        {children}
        {direction === "asc" ? (
          <ArrowUp className="h-3 w-3" strokeWidth={2.5} aria-hidden />
        ) : direction === "desc" ? (
          <ArrowDown className="h-3 w-3" strokeWidth={2.5} aria-hidden />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40" strokeWidth={2.5} aria-hidden />
        )}
      </button>
    </th>
  );
}
