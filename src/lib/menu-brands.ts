type MenuBrandOption = { id: string; name: string };

/** Brands table shows this many rows per page in restaurant admin (not a total cap). */
export const BRANDS_ADMIN_PAGE_SIZE = 3;

type MenuItemBrandSource = {
  brand_id?: string | null;
  brand_name?: string | null;
  menu_brands?: { id: string; name: string } | null;
};

export function resolveMenuItemBrandId(
  item: MenuItemBrandSource,
  brands: MenuBrandOption[],
): string {
  if (item.brand_id) return item.brand_id;
  if (item.menu_brands?.id) return item.menu_brands.id;
  const name = item.brand_name?.trim();
  if (!name) return "";
  const match = brands.find((brand) => brand.name.toLowerCase() === name.toLowerCase());
  return match?.id ?? "";
}
