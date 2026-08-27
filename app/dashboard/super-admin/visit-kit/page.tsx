import { redirect } from "next/navigation";
import { SuperAdminHeader, SuperAdminShell } from "@/components/super-admin-chrome";
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
      <SuperAdminHeader
        className="print:hidden"
        title="Store visit kit"
        subtitle="Leave a printed A4 at the shop, or send the WhatsApp pitch after you visit."
      />
      <ZbounStoreVisitKit />
    </SuperAdminShell>
  );
}
