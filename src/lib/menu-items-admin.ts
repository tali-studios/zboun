export type MenuItemsSort =
  | "name_asc"
  | "name_desc"
  | "section_asc"
  | "section_desc"
  | "price_asc"
  | "price_desc"
  | "stock_asc"
  | "stock_desc";

export function parseMenuItemsSort(raw: string | undefined | null): MenuItemsSort {
  const value = String(raw ?? "").trim();
  const allowed: MenuItemsSort[] = [
    "name_asc",
    "name_desc",
    "section_asc",
    "section_desc",
    "price_asc",
    "price_desc",
    "stock_asc",
    "stock_desc",
  ];
  return allowed.includes(value as MenuItemsSort) ? (value as MenuItemsSort) : "name_asc";
}

export function sortMenuItems<T extends {
  name: string;
  price: number;
  category_id: string | null;
  track_stock?: boolean;
  stock_quantity?: number | null;
  is_available: boolean;
}>(
  items: T[],
  sort: MenuItemsSort,
  categoryNameById: Map<string, string>,
): T[] {
  const sorted = [...items];
  sorted.sort((a, b) => {
    switch (sort) {
      case "name_desc":
        return b.name.localeCompare(a.name);
      case "section_asc": {
        const aSec = categoryNameById.get(a.category_id ?? "") ?? "";
        const bSec = categoryNameById.get(b.category_id ?? "") ?? "";
        return aSec.localeCompare(bSec) || a.name.localeCompare(b.name);
      }
      case "section_desc": {
        const aSec = categoryNameById.get(a.category_id ?? "") ?? "";
        const bSec = categoryNameById.get(b.category_id ?? "") ?? "";
        return bSec.localeCompare(aSec) || a.name.localeCompare(b.name);
      }
      case "price_asc":
        return a.price - b.price || a.name.localeCompare(b.name);
      case "price_desc":
        return b.price - a.price || a.name.localeCompare(b.name);
      case "stock_asc": {
        const aQty = a.track_stock ? Number(a.stock_quantity ?? 0) : Number.POSITIVE_INFINITY;
        const bQty = b.track_stock ? Number(b.stock_quantity ?? 0) : Number.POSITIVE_INFINITY;
        if (!a.is_available && b.is_available) return -1;
        if (a.is_available && !b.is_available) return 1;
        return aQty - bQty || a.name.localeCompare(b.name);
      }
      case "stock_desc": {
        const aQty = a.track_stock ? Number(a.stock_quantity ?? 0) : -1;
        const bQty = b.track_stock ? Number(b.stock_quantity ?? 0) : -1;
        return bQty - aQty || a.name.localeCompare(b.name);
      }
      case "name_asc":
      default:
        return a.name.localeCompare(b.name);
    }
  });
  return sorted;
}
