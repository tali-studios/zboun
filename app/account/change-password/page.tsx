import { redirect } from "next/navigation";
import { getCustomerSession } from "@/app-actions/customer-auth";
import { changePasswordAction } from "@/app-actions/customer-auth";
import { CustomerDesktopNav } from "@/components/customer-desktop-nav";
import { CustomerMobileFooterNav } from "@/components/customer-mobile-footer-nav";
import { CustomerMobileTopBar } from "@/components/customer-mobile-top-bar";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  missing_fields: "Please fill in all fields.",
  too_short:      "New password must be at least 8 characters.",
  mismatch:       "New passwords do not match.",
  wrong_current:  "Your current password is incorrect.",
  update_failed:  "Something went wrong. Please try again.",
};

export default async function ChangePasswordPage({ searchParams }: Props) {
  const session = await getCustomerSession();
  if (!session) redirect("/login");

  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop nav */}
      <CustomerDesktopNav title="Change Password" backHref="/account" />

      <CustomerMobileTopBar title="Change Password" backHref="/account" />

      <main className="mx-auto max-w-lg px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-6 sm:pb-16 sm:pt-10">

        {/* Error banner */}
        {error && ERROR_MESSAGES[error] ? (
          <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {ERROR_MESSAGES[error]}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Security</p>
          </div>

          <form action={changePasswordAction} className="px-4 py-4 space-y-4">
            <div>
              <label htmlFor="current_password" className="mb-1.5 block text-xs font-semibold text-slate-600">
                Current password
              </label>
              <input
                id="current_password"
                type="password"
                name="current_password"
                required
                placeholder="••••••••"
                autoComplete="current-password"
                className="ui-input"
              />
            </div>

            <div>
              <label htmlFor="new_password" className="mb-1.5 block text-xs font-semibold text-slate-600">
                New password
              </label>
              <input
                id="new_password"
                type="password"
                name="new_password"
                required
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className="ui-input"
              />
            </div>

            <div>
              <label htmlFor="confirm_password" className="mb-1.5 block text-xs font-semibold text-slate-600">
                Confirm new password
              </label>
              <input
                id="confirm_password"
                type="password"
                name="confirm_password"
                required
                placeholder="••••••••"
                autoComplete="new-password"
                className="ui-input"
              />
            </div>

            <button
              type="submit"
              className="mt-2 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-md shadow-violet-400/30 transition hover:brightness-110 active:scale-[0.98]"
            >
              Update password
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Password must be at least 8 characters.
        </p>
      </main>

      <CustomerMobileFooterNav />
    </div>
  );
}
