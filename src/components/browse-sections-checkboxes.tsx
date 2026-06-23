import { BROWSE_SECTION_OPTIONS, type BrowseSection } from "@/lib/browse-sections";

type Props = {
  name?: string;
  selected: BrowseSection[];
  layout?: "chips" | "grid";
};

export function BrowseSectionsCheckboxes({
  name = "browse_sections",
  selected,
  layout = "chips",
}: Props) {
  const selectedSet = new Set(selected);
  const labelClass =
    layout === "chips"
      ? "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
      : "flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700";
  const containerClass = layout === "chips" ? "mt-2 flex flex-wrap gap-2" : "grid gap-2 sm:grid-cols-2";

  return (
    <div className={containerClass}>
      {BROWSE_SECTION_OPTIONS.map((section) => (
        <label key={section} className={labelClass}>
          <input
            type="checkbox"
            name={name}
            value={section}
            defaultChecked={selectedSet.has(section)}
            className="h-4 w-4 accent-violet-600"
          />
          <span>{section}</span>
        </label>
      ))}
    </div>
  );
}
