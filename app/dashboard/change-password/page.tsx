import { redirect } from "next/navigation";
import { changeDashboardPasswordAction } from "@/app-actions/auth";
import { PasswordInput } from "@/components/password-input";
import { StoreAdminHeader } from "@/components/store-admin-header";
import { getCurrentUserRole } from "@/lib/data";
import { loadStoreAdminHeaderContext } from "@/lib/store-admin-header-context";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<{ success?: string; error?: string }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  missing_fields: "Please fill in all fields.",
  password_too_short: "New password must be at least 8 characters.",
  password_mismatch: "New passwords do not match.",
  wrong_current_password: "Your current password is incorrect.",
  missing_email: "Could not read your account email. Please sign in again.",
};

export const dynamic = "force-dynamic";

export default async function ChangePasswordPage({ searchParams }: Props) {
  const appUser = await getCurrentUserRole();
  if (!appUser) {
    redirect("/dashboard/login");
  }

  const { success, error } = await searchParams;
  const isRestaurantAdmin = appUser.role === "restaurant_admin" && Boolean(appUser.restaurant_id);
  const errorMessage =
    error && ERROR_MESSAGES[error]
      ? ERROR_MESSAGES[error]
      : error
        ? decodeURIComponent(error).replaceAll("_", " ")
        : null;

  const header = isRestaurantAdmin
    ? await loadStoreAdminHeaderContext(
        await createServerSupabaseClient(),
        appUser.restaurant_id!,
      )
    : null;

  return (
    <main className="min-h-screen bg-[#f8f8ff] px-3 py-4 sm:p-8">
      <div className={`mx-auto space-y-5 ${isRestaurantAdmin ? "max-w-4xl" : "max-w-md"}`}>
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

        <div className="rounded-3xl border border-violet-100 bg-white p-7 shadow-[0_12px_40px_rgba(120,84,255,0.14)] sm:p-8">
          {!isRestaurantAdmin ? (
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Change password</h1>
          ) : null}
          <p className={`text-sm text-slate-500 ${isRestaurantAdmin ? "mt-1.5" : "mt-1.5"}`}>
            Enter your current password, then choose a new one.
          </p>

          {success === "password_changed" && (
            <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50 px-3.5 py-3 text-sm text-violet-800">
              Password changed successfully.
            </div>
          )}
          {errorMessage ? (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <form action={changeDashboardPasswordAction} className="mt-6 space-y-3">
            <div>
              <label htmlFor="current_password" className="mb-1.5 block text-xs font-semibold text-slate-600">
                Current password
              </label>
              <PasswordInput
                id="current_password"
                name="current_password"
                required
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-slate-600">
                New password
              </label>
              <PasswordInput
                id="password"
                name="password"
                required
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label htmlFor="confirm_password" className="mb-1.5 block text-xs font-semibold text-slate-600">
                Confirm new password
              </label>
              <PasswordInput
                id="confirm_password"
                name="confirm_password"
                required
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            <button className="btn btn-primary mt-2 w-full rounded-2xl py-3.5 text-sm">
              Update password
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
