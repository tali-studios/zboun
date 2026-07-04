"use server";

import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getSafeRedirectPath } from "@/lib/auth-redirect";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUserRole } from "@/lib/data";
import { env } from "@/lib/env";

function getAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!env.supabaseUrl || !serviceRoleKey) {
    return null;
  }
  return createClient(env.supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function loginErrorRedirect(error: string, next?: string): never {
  const params = new URLSearchParams({ error });
  if (next && next !== "/") params.set("next", next);
  redirect(`/login?${params.toString()}`);
}

type AppUserProfile = {
  id: string;
  role: string | null;
  restaurant_id: string | null;
  name: string | null;
  email: string | null;
};

async function loadAppUserProfile(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  userId: string,
): Promise<AppUserProfile | null> {
  const { data: profileByUserClient, error: profileError } = await supabase
    .from("users")
    .select("id, role, restaurant_id, name, email")
    .eq("id", userId)
    .maybeSingle();

  if (!profileError && profileByUserClient) {
    return profileByUserClient as AppUserProfile;
  }

  // RLS can block this read in some policy configurations; fallback to service role lookup.
  const adminClient = getAdminClient();
  if (!adminClient) return (profileByUserClient as AppUserProfile | null) ?? null;

  const { data: profileByAdmin } = await adminClient
    .from("users")
    .select("id, role, restaurant_id, name, email")
    .eq("id", userId)
    .maybeSingle();

  return (profileByAdmin as AppUserProfile | null) ?? null;
}

function normalizeRole(role: string | null | undefined) {
  return String(role ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, "");
}

/** Single login for customers, store admins, and super admins. */
export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = getSafeRedirectPath(formData.get("next"), "/");

  if (!email || !password) {
    loginErrorRedirect("missing_fields", next);
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("email not confirmed")) {
      loginErrorRedirect("email_not_verified", next);
    }
    loginErrorRedirect("invalid_credentials", next);
  }

  const user = data.user;
  if (!user) {
    loginErrorRedirect("invalid_credentials", next);
  }

  const profile = await loadAppUserProfile(supabase, user.id);
  if (profile) {
    const normalizedRole = normalizeRole(profile.role);
    if (normalizedRole === "superadmin") {
      redirect("/dashboard/super-admin");
    }
    if (normalizedRole === "restaurantadmin") {
      if (!profile.restaurant_id) {
        loginErrorRedirect("missing_restaurant_link", next);
      }
      redirect("/dashboard/business");
    }
  }

  const { data: customerProfile } = await supabase
    .from("customer_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (customerProfile) {
    redirect(next);
  }

  // Self-heal legacy customer rows only — never for dashboard staff accounts.
  if (profile) {
    loginErrorRedirect("missing_profile", next);
  }

  const fallbackName =
    String(user.user_metadata?.name ?? "").trim() || email.split("@")[0] || "Customer";
  const { error: ensureProfileError } = await supabase.from("customer_profiles").upsert(
    { id: user.id, name: fallbackName, email },
    { onConflict: "id" },
  );
  if (!ensureProfileError) {
    redirect(next);
  }

  loginErrorRedirect("account_not_found", next);
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function changeDashboardPasswordAction(formData: FormData) {
  const appUser = await getCurrentUserRole();
  if (!appUser) {
    redirect("/login");
  }
  if (appUser.role !== "restaurant_admin" && appUser.role !== "superadmin") {
    redirect("/login");
  }

  const currentPassword = String(formData.get("current_password") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (!currentPassword || !password || !confirmPassword) {
    redirect("/dashboard/change-password?error=missing_fields");
  }
  if (password.length < 8) {
    redirect("/dashboard/change-password?error=password_too_short");
  }
  if (password !== confirmPassword) {
    redirect("/dashboard/change-password?error=password_mismatch");
  }

  const supabase = await createServerSupabaseClient();
  const email = appUser.email?.trim().toLowerCase();
  if (!email) {
    redirect("/dashboard/change-password?error=missing_email");
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  });
  if (signInError) {
    redirect("/dashboard/change-password?error=wrong_current_password");
  }

  const { error: updatePasswordError } = await supabase.auth.updateUser({ password });
  if (updatePasswordError) {
    redirect(`/dashboard/change-password?error=${encodeURIComponent(updatePasswordError.message)}`);
  }

  redirect("/dashboard/change-password?success=password_changed");
}
