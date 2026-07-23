"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, Smile, Star } from "lucide-react";
import {
  BROWSE_SECTION_ICONS,
  BROWSE_SECTION_OPTIONS,
  type BrowseSection,
} from "@/lib/browse-sections";

export type SearchSortBy = "recommended" | "popular" | "rating";

export type SearchFilterState = {
  sortBy: SearchSortBy;
  freeDelivery: boolean;
  openNow: boolean;
  fastDelivery: boolean;
  /** Empty = all categories */
  sections: BrowseSection[];
};

export const DEFAULT_SEARCH_FILTERS: SearchFilterState = {
  sortBy: "recommended",
  freeDelivery: false,
  openNow: false,
  fastDelivery: false,
  sections: [],
};

const SECTION_SHORT: Record<BrowseSection, string> = {
  "Food & Restaurants": "Food",
  Groceries: "Market",
  "Fashion & Apparel": "Fashion",
  "Electronics & Tech": "Electronics",
  "Beauty & Pharmacy": "Self-care",
  "Home & Living": "Home",
  "Drinks & Beverages": "Drinks",
  "Smoke & Tobacco": "Smoke",
  "Pets & Supplies": "Pets",
  Automotive: "Auto",
  "Gifts & Lifestyle": "Gifts",
  "Sports & Outdoors": "Sports",
};

const DISMISS_THRESHOLD_PX = 110;

type Props = {
  open: boolean;
  value: SearchFilterState;
  onClose: () => void;
  onApply: (next: SearchFilterState) => void;
};

export function SearchFilterSheet({ open, value, onClose, onApply }: Props) {
  const [draft, setDraft] = useState<SearchFilterState>(value);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startYRef = useRef(0);
  const dragYRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setDraft(value);
      setDragY(0);
      dragYRef.current = 0;
    }
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  function toggleSection(section: BrowseSection) {
    setDraft((prev) => {
      const has = prev.sections.includes(section);
      return {
        ...prev,
        sections: has
          ? prev.sections.filter((s) => s !== section)
          : [...prev.sections, section],
      };
    });
  }

  function onTouchStart(e: React.TouchEvent) {
    startYRef.current = e.touches[0].clientY;
    dragYRef.current = 0;
    setDragging(true);
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!dragging) return;
    const dy = e.touches[0].clientY - startYRef.current;
    const next = Math.max(0, dy);
    dragYRef.current = next;
    setDragY(next);
  }

  function onTouchEnd() {
    if (!dragging) return;
    setDragging(false);
    if (dragYRef.current >= DISMISS_THRESHOLD_PX) {
      setDragY(0);
      dragYRef.current = 0;
      onClose();
      return;
    }
    setDragY(0);
    dragYRef.current = 0;
  }

  const backdropOpacity = Math.max(0.15, 0.45 * (1 - dragY / 320));

  return (
    <>
      <div
        className="fixed inset-0 z-[60] backdrop-blur-[2px]"
        style={{ backgroundColor: `rgba(15, 23, 42, ${backdropOpacity})` }}
        onClick={onClose}
        aria-hidden
      />

      <div
        className="fixed inset-x-0 bottom-0 z-[70] flex max-h-[88dvh] flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl"
        style={{
          transform: `translateY(${dragY}px)`,
          transition: dragging ? "none" : "transform 200ms ease-out",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Search filters"
      >
        {/* Drag handle — swipe down here to close */}
        <div
          className="flex cursor-grab touch-none justify-center pt-3 pb-3 active:cursor-grabbing"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
          aria-label="Swipe down to close"
        >
          <span className="h-1.5 w-12 rounded-full bg-slate-300" aria-hidden />
        </div>

        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4"
        >
          <h2 className="pt-1 text-lg font-bold text-slate-900">Sort by</h2>
          <ul className="mt-2 divide-y divide-slate-100">
            {(
              [
                {
                  id: "recommended" as const,
                  label: "Recommended",
                  icon: <Smile className="h-5 w-5 text-slate-500" />,
                },
                {
                  id: "popular" as const,
                  label: "Popular",
                  icon: <Heart className="h-5 w-5 text-slate-500" />,
                },
                {
                  id: "rating" as const,
                  label: "Rating",
                  icon: <Star className="h-5 w-5 text-slate-500" />,
                },
              ] as const
            ).map((opt) => {
              const selected = draft.sortBy === opt.id;
              return (
                <li key={opt.id}>
                  <button
                    type="button"
                    onClick={() => setDraft((p) => ({ ...p, sortBy: opt.id }))}
                    className="flex w-full items-center gap-3 py-3.5 text-left"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50">
                      {opt.icon}
                    </span>
                    <span className="flex-1 text-[15px] font-medium text-slate-900">
                      {opt.label}
                    </span>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        selected
                          ? "border-violet-600 bg-violet-600"
                          : "border-slate-300 bg-white"
                      }`}
                      aria-hidden
                    >
                      {selected ? (
                        <span className="h-2 w-2 rounded-full bg-white" />
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <h2 className="mt-5 text-lg font-bold text-slate-900">Filter By</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {(
              [
                { key: "freeDelivery" as const, label: "Free delivery" },
                { key: "openNow" as const, label: "Open now" },
                { key: "fastDelivery" as const, label: "Fast delivery" },
              ] as const
            ).map((chip) => {
              const on = draft[chip.key];
              return (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => setDraft((p) => ({ ...p, [chip.key]: !p[chip.key] }))}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    on
                      ? "bg-violet-600 text-white"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          <h2 className="mt-6 text-lg font-bold text-slate-900">Categories</h2>
          <ul className="mt-1 divide-y divide-slate-100">
            {BROWSE_SECTION_OPTIONS.map((section) => {
              const checked = draft.sections.includes(section);
              return (
                <li key={section}>
                  <button
                    type="button"
                    onClick={() => toggleSection(section)}
                    className="flex w-full items-center gap-3 py-3.5 text-left"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-xl">
                      {BROWSE_SECTION_ICONS[section]}
                    </span>
                    <span className="min-w-0 flex-1 text-[15px] font-medium text-slate-900">
                      {SECTION_SHORT[section]}
                      <span className="mt-0.5 block truncate text-xs font-normal text-slate-400">
                        {section}
                      </span>
                    </span>
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
                        checked
                          ? "border-violet-600 bg-violet-600 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                      aria-hidden
                    >
                      {checked ? (
                        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="shrink-0 border-t border-slate-100 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDraft(DEFAULT_SEARCH_FILTERS)}
              className="rounded-2xl border border-slate-200 px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => {
                onApply(draft);
                onClose();
              }}
              className="flex-1 rounded-2xl bg-violet-600 py-3.5 text-center text-sm font-bold text-white shadow-sm shadow-violet-400/30 transition hover:bg-violet-700"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
