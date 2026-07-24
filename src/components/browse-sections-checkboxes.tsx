"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BROWSE_SECTION_OPTIONS,
  browseSectionShortLabel,
  getSubFiltersForSection,
  validateBrowseSelection,
  type BrowseSection,
} from "@/lib/browse-sections";
import { DashboardAlertModal } from "@/components/dashboard-alert-modal";

type Props = {
  name?: string;
  formId?: string;
  selected: BrowseSection[];
  selectedSubs?: string[];
  layout?: "chips" | "grid";
  /** When set (e.g. 1), only that many top-level categories can be selected. */
  maxSections?: number;
};

export function BrowseSectionsCheckboxes({
  name = "browse_sections",
  formId,
  selected,
  selectedSubs = [],
  layout = "chips",
  maxSections,
}: Props) {
  const [sections, setSections] = useState<Set<BrowseSection>>(() => new Set(selected));
  const [subs, setSubs] = useState<Set<string>>(() => new Set(selectedSubs));
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const labelClass =
    layout === "chips"
      ? "flex w-full items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 sm:w-auto sm:rounded-full sm:py-1.5"
      : "flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700";
  const containerClass =
    layout === "chips"
      ? "mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap"
      : "mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2";

  const activeSectionsWithSubs = useMemo(
    () => BROWSE_SECTION_OPTIONS.filter((section) => sections.has(section)),
    [sections],
  );

  const sectionsMissingTags = useMemo(() => {
    const selection = [...sections, ...subs];
    const result = validateBrowseSelection(selection);
    if (result.ok) return new Set<BrowseSection>();
    return result.section ? new Set<BrowseSection>([result.section]) : new Set<BrowseSection>();
  }, [sections, subs]);

  function toggleSection(section: BrowseSection, checked: boolean) {
    setAlertMessage(null);
    setSections((prev) => {
      if (!checked) {
        const next = new Set(prev);
        next.delete(section);
        return next;
      }
      if (maxSections === 1) {
        return new Set<BrowseSection>([section]);
      }
      const next = new Set(prev);
      if (maxSections != null && next.size >= maxSections && !next.has(section)) {
        return prev;
      }
      next.add(section);
      return next;
    });
    if (!checked) {
      const sectionSubs = getSubFiltersForSection(section);
      setSubs((prev) => {
        const next = new Set(prev);
        for (const sub of sectionSubs) next.delete(sub);
        return next;
      });
    } else if (maxSections === 1) {
      // Drop tags from any previously selected category.
      const keep = new Set(getSubFiltersForSection(section));
      setSubs((prev) => new Set([...prev].filter((tag) => keep.has(tag))));
    }
  }

  function toggleSub(sub: string, checked: boolean) {
    setAlertMessage(null);
    setSubs((prev) => {
      const next = new Set(prev);
      if (checked) next.add(sub);
      else next.delete(sub);
      return next;
    });
  }

  useEffect(() => {
    if (!formId) return;
    const form = document.getElementById(formId);
    if (!form) return;

    const onSubmit = (event: Event) => {
      const result = validateBrowseSelection([...sections, ...subs], {
        maxSections,
      });
      if (!result.ok) {
        event.preventDefault();
        event.stopPropagation();
        setAlertMessage(result.error);
      }
    };

    form.addEventListener("submit", onSubmit, true);
    return () => form.removeEventListener("submit", onSubmit, true);
  }, [formId, sections, subs, maxSections]);

  const inputType = maxSections === 1 ? "radio" : "checkbox";

  return (
    <>
      <div className="space-y-4">
        <div className={containerClass}>
          {BROWSE_SECTION_OPTIONS.map((section) => (
            <label key={section} className={labelClass}>
              <input
                type={inputType}
                name={maxSections === 1 ? `${name}_section` : name}
                value={section}
                checked={sections.has(section)}
                onChange={(e) => toggleSection(section, e.target.checked)}
                className="h-4 w-4 accent-violet-600"
              />
              {/* Always submit real browse_sections values via hidden inputs for radio mode */}
              {maxSections === 1 && sections.has(section) ? (
                <input type="hidden" name={name} value={section} />
              ) : null}
              <span>{browseSectionShortLabel(section)}</span>
            </label>
          ))}
        </div>

        {activeSectionsWithSubs.map((section) => {
          const subOptions = getSubFiltersForSection(section);
          if (subOptions.length === 0) return null;
          const missingTag = sectionsMissingTags.has(section);
          const short = browseSectionShortLabel(section);
          return (
            <div
              key={section}
              className={`rounded-xl border bg-white p-3 ${
                missingTag ? "border-amber-300 bg-amber-50/40" : "border-slate-200"
              }`}
            >
              <p className="text-xs font-semibold text-slate-700">
                {short} tags <span className="text-red-500">*</span>
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Pick at least one tag so customers can filter your business under {short}.
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

      <DashboardAlertModal
        open={alertMessage != null}
        heading="Tags required"
        message={alertMessage ?? ""}
        variant="warning"
        onClose={() => setAlertMessage(null)}
      />
    </>
  );
}
