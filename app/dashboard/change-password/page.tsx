import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/components/change-password-form";
import { SuperAdminHeader, SuperAdminShell } from "@/components/super-admin-chrome";
import { StoreAdminHeader } from "@/components/store-admin-header";
import { getCurrentUserRole } from "@/lib/data";
import { loadStoreAdminHeaderContext } from "@/lib/store-admin-header-context";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<{ success?: string; error?: string }>;
};

export const dynamic = "force-dynamic";

export default async function ChangePasswordPage({ searchParams }: Props) {
  const appUser = await getCurrentUserRole();
  if (!appUser) {
    redirect("/dashboard/login");
  }

  const { success, error } = await searchParams;
  const isRestaurantAdmin = appUser.role === "restaurant_admin" && Boolean(appUser.restaurant_id);
  const isSuperAdmin = appUser.role === "superadmin";

  const header = isRestaurantAdmin
    ? await loadStoreAdminHeaderContext(
        await createServerSupabaseClient(),
        appUser.restaurant_id!,
      )
    : null;

  const formCard = (
    <div className="rounded-3xl border border-violet-100 bg-white p-7 shadow-[0_12px_40px_rgba(120,84,255,0.14)] sm:p-8">
      {!isRestaurantAdmin && !isSuperAdmin ? (
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Change password</h1>
      ) : null}
      <p
        className={`text-sm text-slate-500 ${
          isRestaurantAdmin || isSuperAdmin ? "mt-0" : "mt-1.5"
        }`}
      >
        Enter your current password, then choose a new one.
      </p>

      <ChangePasswordForm
        initialSuccess={success === "password_changed"}
        initialError={error ?? null}
      />
    </div>
  );

  if (isSuperAdmin) {
    return (
      <SuperAdminShell>
        <SuperAdminHeader
          title="Change password"
          subtitle="Update your super admin dashboard login password."
        />
        <div className="mx-auto w-full max-w-md">{formCard}</div>
      </SuperAdminShell>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f8ff] px-3 py-4 sm:p-8">
      <div className={`mx-auto space-y-5 ${isRestaurantAdmin ? "max-w-7xl" : "max-w-md"}`}>
        {isRestaurantAdmin && header ? (
          <StoreAdminHeader
            restaurantName={header.restaurantName}
            categoryLabel={header.categoryLabel}
            slug={header.slug}
            browseSections={header.browseSections}
            menuUrl={header.menuUrl}
            driverManagementEnabled={header.driverManagementEnabled}
            currentPage="password"
            title="Password"
            subtitle="Update your dashboard login password."
          />
        ) : null}

        {formCard}
      </div>
    </main>
  );
}
