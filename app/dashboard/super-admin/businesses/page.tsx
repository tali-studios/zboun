import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { SuperAdminCreateRestaurantForm } from "@/components/super-admin-create-restaurant-form";
import { SuperAdminRestaurantsPanel } from "@/components/super-admin-restaurants-panel";
import { SuperAdminHeader, SuperAdminSection, SuperAdminShell } from "@/components/super-admin-chrome";
import { CopyableInviteLink } from "@/components/copyable-invite-link";
import { getCurrentUserRole } from "@/lib/data";
import { getPublicAppUrl } from "@/lib/public-app-url";
import { loadSuperAdminRestaurantsWithDetails } from "@/lib/super-admin-restaurants-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ success?: string; error?: string; invite_link?: string; email?: string }>;
};

export default async function SuperAdminBusinessesPage({ searchParams }: Props) {
  const { success, error, invite_link, email } = await searchParams;
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "superadmin") {
    redirect("/dashboard/login");
  }

  const supabase = await createServerSupabaseClient();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const dataClient =
    env.supabaseUrl && serviceRoleKey
      ? createClient(env.supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      : supabase;

  const restaurantsWithDetails = await loadSuperAdminRestaurantsWithDetails(dataClient);

  return (
    <SuperAdminShell>
      <SuperAdminHeader
        title="Businesses"
        subtitle="Activate stores, billing, browse categories, and admin access."
      />

      {success === "restaurant_created" && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
          Business created successfully. Admin invite email has been sent.
        </p>
      )}
      {success === "restaurant_created_invite_email_failed" && invite_link && email && (
        <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-700">
            Business was created, but the invite email failed to send.
          </p>
          <div className="rounded-lg border border-amber-300 bg-white p-3 text-sm">
            <p className="font-semibold text-amber-900">Share this invite link manually:</p>
            <p className="mt-2">
              <strong>Email:</strong> {email}
            </p>
            <p className="mt-2">
              <strong>Invite Link:</strong>
            </p>
            <CopyableInviteLink link={invite_link} tone="amber" />
            <p className="mt-2 text-xs text-amber-700">
              Admin will set their own password via this link. It expires soon (~1 hour by default) — use
              “Resend invite” from the list below if it dies.
            </p>
          </div>
        </div>
      )}
      {success === "restaurant_created_emails_failed" && invite_link && email && (
        <div className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            Business was created, but both emails failed to send.
          </p>
          <div className="rounded-lg border border-red-300 bg-white p-3 text-sm">
            <p className="font-semibold text-red-900">Share this invite link manually:</p>
            <p className="mt-2">
              <strong>Email:</strong> {email}
            </p>
            <p className="mt-2">
              <strong>Invite Link:</strong>
            </p>
            <CopyableInviteLink link={invite_link} tone="red" />
            <p className="mt-2">
              <strong>Login:</strong> {getPublicAppUrl()}/login
            </p>
            <p className="mt-2 text-xs text-red-700">
              Admin will set their own password via this link. It expires soon (~1 hour by default) — use
              “Resend invite” from the list below if it dies.
            </p>
          </div>
        </div>
      )}
      {success === "invite_resent" && email && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
          A fresh invite link was emailed to {email}.
        </p>
      )}
      {success === "invite_resent_email_failed" && invite_link && email && (
        <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-700">
            A new invite link was generated, but the email failed to send.
          </p>
          <div className="rounded-lg border border-amber-300 bg-white p-3 text-sm">
            <p className="font-semibold text-amber-900">Share this invite link manually:</p>
            <p className="mt-2">
              <strong>Email:</strong> {email}
            </p>
            <p className="mt-2">
              <strong>Invite Link:</strong>
            </p>
            <CopyableInviteLink link={invite_link} tone="amber" />
            <p className="mt-2 text-xs text-amber-700">It expires soon (~1 hour by default).</p>
          </div>
        </div>
      )}
      {success === "restaurant_created_email_failed" && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-700">
          Business was created, but the onboarding email could not be sent. Share the login details
          manually.
        </p>
      )}
      {success === "subscription_renewed" && (
        <p className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm font-medium text-violet-700">
          Subscription renewed. The store received a confirmation email with the service agreement PDF
          attached.
        </p>
      )}
      {success === "subscription_renewed_email_failed" && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-700">
          Subscription was extended, but the renewal email could not be sent. Check SMTP settings and
          try again, or share the contract manually.
        </p>
      )}
      {success === "restaurant_password_updated" && (
        <p className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm font-medium text-violet-700">
          Store admin password updated successfully.
        </p>
      )}
      {success === "restaurant_deleted" && (
        <p className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm font-medium text-violet-700">
          Business deleted successfully.
        </p>
      )}
      {error === "duplicate_business_name" && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          A business with this name already exists. Choose a different name.
        </p>
      )}
      {error === "duplicate_business_email" && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          This email is already in use. Choose a different admin email.
        </p>
      )}
      {error === "missing_browse_categories" && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          Pick at least one business category when creating a business.
        </p>
      )}
      {error === "no_restaurant_admin" && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          No store admin account is linked to this business.
        </p>
      )}
      {error &&
        error !== "no_restaurant_admin" &&
        error !== "missing_restaurant_id" &&
        error !== "missing_browse_categories" &&
        error !== "duplicate_business_name" &&
        error !== "duplicate_business_email" && (
          <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {decodeURIComponent(error)}
          </p>
        )}

      <SuperAdminSection
        title="Create business + admin invite"
        description="Create a store account and email the admin a secure set-password link."
      >
        <SuperAdminCreateRestaurantForm />
      </SuperAdminSection>

      <SuperAdminRestaurantsPanel restaurants={restaurantsWithDetails} />
    </SuperAdminShell>
  );
}
