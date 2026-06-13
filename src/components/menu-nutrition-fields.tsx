type Props = {
  idPrefix?: string;
  defaultCalories?: number | string | null;
  defaultProteinG?: number | string | null;
  caloriesName?: string;
  proteinName?: string;
};

export function MenuNutritionFields({
  idPrefix = "nutrition",
  defaultCalories = "",
  defaultProteinG = "",
  caloriesName = "calories",
  proteinName = "protein_g",
}: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="space-y-1" htmlFor={`${idPrefix}-calories`}>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Calories{" "}
          <span className="ml-1 font-normal normal-case text-slate-500">(optional)</span>
        </span>
        <input
          id={`${idPrefix}-calories`}
          name={caloriesName}
          type="number"
          min={0}
          step={1}
          placeholder="e.g. 250"
          defaultValue={
            defaultCalories !== null && defaultCalories !== "" ? String(defaultCalories) : undefined
          }
          className="ui-input w-full"
        />
        <p className="text-xs text-slate-500">Per serving, in kcal.</p>
      </label>
      <label className="space-y-1" htmlFor={`${idPrefix}-protein`}>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Protein{" "}
          <span className="ml-1 font-normal normal-case text-slate-500">(optional)</span>
        </span>
        <input
          id={`${idPrefix}-protein`}
          name={proteinName}
          type="number"
          min={0}
          step={0.1}
          placeholder="e.g. 12"
          defaultValue={
            defaultProteinG !== null && defaultProteinG !== "" ? String(defaultProteinG) : undefined
          }
          className="ui-input w-full"
        />
        <p className="text-xs text-slate-500">Grams of protein per serving.</p>
      </label>
    </div>
  );
}
