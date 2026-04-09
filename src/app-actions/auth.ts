"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUserRole } from "@/lib/data";

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect("/dashboard/login?error=invalid_credentials");
  }

  const role = await getCurrentUserRole();
  if (role?.role === "superadmin") {
    redirect("/dashboard/super-admin");
  }

  redirect("/dashboard/restaurant");
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/dashboard/login");
}
