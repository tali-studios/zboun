import { Dumbbell, Flame } from "lucide-react";
import {
  formatCaloriesValue,
  formatProteinValue,
  hasMenuNutrition,
} from "@/lib/menu-nutrition";

type Props = {
  calories?: number | null;
  proteinG?: number | null;
  size?: "sm" | "md";
  className?: string;
};

export function MenuNutritionBadges({
  calories,
  proteinG,
  size = "sm",
  className = "",
}: Props) {
  if (!hasMenuNutrition(calories, proteinG)) return null;

  const iconClass = size === "sm" ? "h-3 w-3 shrink-0" : "h-3.5 w-3.5 shrink-0";
  const pillClass =
    size === "sm"
      ? "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none"
      : "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold leading-none";

  const caloriesValue = formatCaloriesValue(calories);
  const proteinValue = formatProteinValue(proteinG);

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`.trim()}>
      {caloriesValue != null ? (
        <span
          className={`${pillClass} bg-amber-50 text-amber-800 ring-1 ring-amber-100/80`}
          title="Calories per serving"
        >
          <Flame className={iconClass} aria-hidden />
          {caloriesValue} kcal
        </span>
      ) : null}
      {proteinValue != null ? (
        <span
          className={`${pillClass} bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100/80`}
          title="Protein per serving"
        >
          <Dumbbell className={iconClass} aria-hidden />
          {proteinValue}g protein
        </span>
      ) : null}
    </div>
  );
}
