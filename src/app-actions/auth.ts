"use server";

import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUserRole } from "@/lib/data";
import { env } from "@/lib/env";
import { isRestaurantDashboardBlocked } from "@/lib/subscription-lifecycle";

function getAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!env.supabaseUrl || !serviceRoleKey) {
    return null;
  }
  return createClient(env.supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect("/dashboard/login?error=invalid_credentials");
  }

  const user = data.user;
  if (!user) {
    redirect("/dashboard/login?error=invalid_credentials");
  }

  const { data: profileByUserClient, error: profileError } = await supabase
    .from("users")
    .select("id, role, restaurant_id, name, email")
    .eq("id", user.id)
    .maybeSingle();

  let profile = profileByUserClient;
  if (profileError || !profile) {
    // RLS can block this read in some policy configurations; fallback to service role lookup.
    const adminClient = getAdminClient();
    if (adminClient) {
      const { data: profileByAdmin } = await adminClient
        .from("users")
        .select("id, role, restaurant_id, name, email")
        .eq("id", user.id)
        .maybeSingle();
      profile = profileByAdmin ?? null;
    }
  }

  if (!profile) {
    redirect("/dashboard/login?error=missing_profile");
  }
  const normalizedRole = String(profile.role ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, "");
  if (normalizedRole === "superadmin") {
    redirect("/dashboard/super-admin");
  }
  if (normalizedRole === "restaurantadmin") {
    if (!profile.restaurant_id) {
      redirect("/dashboard/login?error=missing_restaurant_link");
    }
    const blocked = await isRestaurantDashboardBlocked(profile.restaurant_id);
    if (blocked !== false) {
      await supabase.auth.signOut();
      redirect("/dashboard/login?error=account_deactivated");
    }
    redirect("/dashboard/business");
  }
  redirect("/dashboard/login?error=missing_profile");
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/dashboard/login");
}

export async function changeDashboardPasswordAction(formData: FormData) {
  const appUser = await getCurrentUserRole();
  if (!appUser) {
    redirect("/dashboard/login");
  }
  if (appUser.role !== "restaurant_admin" && appUser.role !== "superadmin") {
    redirect("/dashboard/login");
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
