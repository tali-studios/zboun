"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUserRole } from "@/lib/data";

export async function setPasswordAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (!password || !confirmPassword) {
    redirect("/auth/set-password?error=missing_fields");
  }
  if (password.length < 8) {
    redirect("/auth/set-password?error=password_too_short");
  }
  if (password !== confirmPassword) {
    redirect("/auth/set-password?error=password_mismatch");
  }

  const supabase = await createServerSupabaseClient();
  
  // Update password
  const { error: updatePasswordError } = await supabase.auth.updateUser({ password });
  if (updatePasswordError) {
    redirect(`/auth/set-password?error=${encodeURIComponent(updatePasswordError.message)}`);
  }

  // Get user role and redirect appropriately
  const appUser = await getCurrentUserRole();
  
  if (appUser?.role === "superadmin") {
    redirect("/dashboard/super-admin?success=password_changed");
  }
  if (appUser?.role === "restaurant_admin") {
    redirect("/dashboard/business?toast=password_changed");
  }
  
  redirect("/login");
}
