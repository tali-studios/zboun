import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/data";

export default async function DashboardIndex() {
  const appUser = await getCurrentUserRole();
  if (!appUser) {
    redirect("/dashboard/login");
  }

  const normalizedRole = String(appUser.role ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, "");
  if (normalizedRole === "superadmin") {
    redirect("/dashboard/super-admin");
  }
  redirect("/dashboard/restaurant");
}
