import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { SuperAdminHeader, SuperAdminShell } from "@/components/super-admin-chrome";
import { SuperAdminUsersPanel } from "@/components/super-admin-users-panel";
import { getCurrentUserRole } from "@/lib/data";
import { loadSuperAdminPlatformUsers } from "@/lib/super-admin-users-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function SuperAdminUsersPage({ searchParams }: Props) {
  const { success, error } = await searchParams;
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

  let platformUsers;
  try {
    platformUsers = await loadSuperAdminPlatformUsers(dataClient);
  } catch (loadError) {
    const message = loadError instanceof Error ? loadError.message : "Failed to load users";
    redirect(`/dashboard/super-admin/users?error=${encodeURIComponent(message)}`);
  }

  return (
    <SuperAdminShell>
      <SuperAdminHeader
        title="Users"
        subtitle="Customers, store admins, and platform operators across zboun.net."
      />

      {success === "user_blocked" && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-700">
          User blocked successfully.
        </p>
      )}
      {success === "user_unblocked" && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
          User unblocked successfully.
        </p>
      )}
      {success === "user_deleted" && (
        <p className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm font-medium text-violet-700">
          User account deleted successfully.
        </p>
      )}
      {success === "user_password_updated" && (
        <p className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm font-medium text-violet-700">
          User password updated successfully.
        </p>
      )}
      {error === "missing_user_id" && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          Missing user id.
        </p>
      )}
      {error === "cannot_block_self" && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          You cannot block your own account.
        </p>
      )}
      {error === "cannot_delete_self" && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          You cannot delete your own account.
        </p>
      )}
      {error === "missing_password" && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          Please enter a password.
        </p>
      )}
      {error === "password_too_short" && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          Password must be at least 8 characters.
        </p>
      )}
      {error === "password_mismatch" && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          Passwords do not match.
        </p>
      )}
      {error &&
        error !== "missing_user_id" &&
        error !== "cannot_block_self" &&
        error !== "cannot_delete_self" &&
        error !== "missing_password" &&
        error !== "password_too_short" &&
        error !== "password_mismatch" && (
          <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {decodeURIComponent(error)}
          </p>
        )}

      <SuperAdminUsersPanel users={platformUsers} currentUserId={appUser.id} />
    </SuperAdminShell>
  );
}
