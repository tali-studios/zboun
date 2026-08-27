import { redirect } from "next/navigation";
import { SuperAdminShell } from "@/components/super-admin-chrome";
import { ZbounStoreVisitKit } from "@/components/zboun-store-visit-kit";
import { getCurrentUserRole } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SuperAdminVisitKitPage() {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "superadmin") {
    redirect("/dashboard/login");
  }

  return (
    <SuperAdminShell
      className="flyer-print-page"
      layoutClassName="flyer-print-wrap"
    >
      <ZbounStoreVisitKit />
    </SuperAdminShell>
  );
}
