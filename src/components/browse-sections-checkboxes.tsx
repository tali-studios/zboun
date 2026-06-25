"use client";

import { useMemo, useState } from "react";
import {
  BROWSE_SECTION_OPTIONS,
  getSubFiltersForSection,
  type BrowseSection,
} from "@/lib/browse-sections";

type Props = {
  name?: string;
  selected: BrowseSection[];
  selectedSubs?: string[];
  layout?: "chips" | "grid";
};

export function BrowseSectionsCheckboxes({
  name = "browse_sections",
  selected,
  selectedSubs = [],
  layout = "chips",
}: Props) {
  const [sections, setSections] = useState<Set<BrowseSection>>(() => new Set(selected));
  const [subs, setSubs] = useState<Set<string>>(() => new Set(selectedSubs));

  const labelClass =
    layout === "chips"
      ? "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
      : "flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700";
  const containerClass = layout === "chips" ? "mt-2 flex flex-wrap gap-2" : "grid gap-2 sm:grid-cols-2";

  const activeSectionsWithSubs = useMemo(
    () => BROWSE_SECTION_OPTIONS.filter((section) => sections.has(section)),
    [sections],
  );

  function toggleSection(section: BrowseSection, checked: boolean) {
    setSections((prev) => {
      const next = new Set(prev);
      if (checked) next.add(section);
      else next.delete(section);
      return next;
    });
    if (!checked) {
      const sectionSubs = getSubFiltersForSection(section);
      setSubs((prev) => {
        const next = new Set(prev);
        for (const sub of sectionSubs) next.delete(sub);
        return next;
      });
    }
  }

  function toggleSub(sub: string, checked: boolean) {
    setSubs((prev) => {
      const next = new Set(prev);
      if (checked) next.add(sub);
      else next.delete(sub);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className={containerClass}>
        {BROWSE_SECTION_OPTIONS.map((section) => (
          <label key={section} className={labelClass}>
            <input
              type="checkbox"
              name={name}
              value={section}
              checked={sections.has(section)}
              onChange={(e) => toggleSection(section, e.target.checked)}
              className="h-4 w-4 accent-violet-600"
            />
            <span>{section}</span>
          </label>
        ))}
      </div>

      {activeSectionsWithSubs.map((section) => {
        const subOptions = getSubFiltersForSection(section);
        if (subOptions.length === 0) return null;
        return (
          <div key={section} className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold text-slate-700">{section} tags (optional)</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Refine how this business appears under {section} on the home page.
            </p>
            <div className={`${containerClass} mt-2`}>
              {subOptions.map((sub) => (
                <label key={sub} className={labelClass}>
                  <input
                    type="checkbox"
                    name={name}
                    value={sub}
                    checked={subs.has(sub)}
                    onChange={(e) => toggleSub(sub, e.target.checked)}
                    className="h-4 w-4 accent-violet-600"
                  />
                  <span>{sub}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
