import Link from "next/link";
import { redirect } from "next/navigation";
import { ZbounStoreVisitKit } from "@/components/zboun-store-visit-kit";
import { getCurrentUserRole } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SuperAdminVisitKitPage() {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "superadmin") {
    redirect("/dashboard/login");
  }

  return (
    <main className="flyer-print-page min-h-screen overflow-x-hidden bg-[#f8f8ff] px-3 py-4 sm:p-8">
      <div className="flyer-print-wrap mx-auto w-full min-w-0 max-w-7xl space-y-5">
        <header className="panel print:hidden p-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600">
            Super admin
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Store visit kit</h1>
          <p className="mt-1 text-sm text-slate-600">
            Leave a printed A4 at the shop, or send the WhatsApp pitch after you visit.
          </p>
          <Link
            href="/dashboard/super-admin"
            className="mt-3 inline-flex text-sm font-semibold text-violet-700 hover:text-violet-900"
          >
            ← Back to super admin
          </Link>
        </header>

        <ZbounStoreVisitKit />
      </div>
    </main>
  );
}
