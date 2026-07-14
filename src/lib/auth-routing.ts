export type DashboardRole = "superadmin" | "restaurant_admin";

export function dashboardHrefForRole(role: string | null | undefined): string | null {
  if (role === "superadmin") return "/dashboard/super-admin";
  if (role === "restaurant_admin") return "/dashboard/business";
  return null;
}

/** Customer app surfaces — not for restaurant / platform admins. */
export function isCustomerAppPath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname === "/login" || pathname.startsWith("/login/")) return true;
  if (pathname === "/signup" || pathname.startsWith("/signup/")) return true;
  if (pathname === "/forgot-password" || pathname.startsWith("/forgot-password/")) return true;
  if (pathname === "/account" || pathname.startsWith("/account/")) return true;
  if (pathname === "/favorites" || pathname.startsWith("/favorites/")) return true;
  return false;
}

export function isDashboardPath(pathname: string): boolean {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}
