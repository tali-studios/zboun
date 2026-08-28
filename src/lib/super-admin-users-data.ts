import type { SupabaseClient } from "@supabase/supabase-js";

export type SuperAdminPlatformUser = {
  id: string;
  email: string;
  role: "superadmin" | "restaurant_admin" | "customer" | "unknown";
  name: string;
  created_at: string | null;
  last_sign_in_at: string | null;
  is_blocked: boolean;
};

export async function loadSuperAdminPlatformUsers(
  dataClient: SupabaseClient,
): Promise<SuperAdminPlatformUser[]> {
  const [
    { data: authUsersPage, error: authUsersError },
    { data: appUsers },
    { data: customerProfiles },
  ] = await Promise.all([
    dataClient.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    dataClient.from("users").select("id, role, name, email"),
    dataClient.from("customer_profiles").select("id, name, email"),
  ]);

  if (authUsersError) {
    throw new Error(authUsersError.message);
  }

  const authUsers = authUsersPage?.users ?? [];
  const appUsersById = new Map((appUsers ?? []).map((u) => [u.id, u]));
  const customersById = new Map((customerProfiles ?? []).map((u) => [u.id, u]));

  return authUsers.map((u) => {
    const appRow = appUsersById.get(u.id);
    const customerRow = customersById.get(u.id);
    const role: SuperAdminPlatformUser["role"] =
      appRow?.role === "superadmin"
        ? "superadmin"
        : appRow?.role === "restaurant_admin"
          ? "restaurant_admin"
          : customerRow
            ? "customer"
            : "unknown";

    return {
      id: u.id,
      email: u.email ?? appRow?.email ?? customerRow?.email ?? "unknown",
      role,
      name: appRow?.name ?? customerRow?.name ?? "",
      created_at: u.created_at ?? null,
      last_sign_in_at: u.last_sign_in_at ?? null,
      is_blocked: Boolean(u.banned_until && new Date(u.banned_until) > new Date()),
    };
  });
}
