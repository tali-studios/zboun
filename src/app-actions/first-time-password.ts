"use server";

import { redirect } from "next/navigation";
import { getSafeRedirectPath } from "@/lib/auth-redirect";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUserRole } from "@/lib/data";
import { createClient } from "@supabase/supabase-js";
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

export async function changeFirstTimePasswordAction(formData: FormData) {
  const appUser = await getCurrentUserRole();
  if (!appUser) {
    redirect("/login");
  }
  if (appUser.role !== "restaurant_admin" && appUser.role !== "superadmin") {
    redirect("/login");
  }

  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");
  const next = getSafeRedirectPath(formData.get("next"), "/");

  if (!password || !confirmPassword) {
    redirect(`/dashboard/first-time-password-change?error=missing_fields&next=${encodeURIComponent(next)}`);
  }
  if (password.length < 8) {
    redirect(`/dashboard/first-time-password-change?error=password_too_short&next=${encodeURIComponent(next)}`);
  }
  if (password !== confirmPassword) {
    redirect(`/dashboard/first-time-password-change?error=password_mismatch&next=${encodeURIComponent(next)}`);
  }

  const supabase = await createServerSupabaseClient();

  // Update password via Supabase Auth
  const { error: updatePasswordError } = await supabase.auth.updateUser({ password });
  if (updatePasswordError) {
    redirect(`/dashboard/first-time-password-change?error=${encodeURIComponent(updatePasswordError.message)}&next=${encodeURIComponent(next)}`);
  }

  // Clear must_change_password flag
  const adminClient = getAdminClient();
  if (adminClient) {
    await adminClient
      .from("users")
      .update({ must_change_password: false })
      .eq("id", appUser.id);
  }

  // Redirect based on role
  if (appUser.role === "superadmin") {
    redirect("/dashboard/super-admin?success=password_changed");
  }
  if (appUser.role === "restaurant_admin") {
    redirect("/dashboard/business?toast=password_changed");
  }
  
  redirect(next);
}
