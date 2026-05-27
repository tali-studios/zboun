"use server";

import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getSafeRedirectPath } from "@/lib/auth-redirect";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

function getAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!env.supabaseUrl || !key) return null;
  return createClient(env.supabaseUrl, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Errors from Supabase that mean "account created but email send failed" — not a real failure. */
function isEmailSendError(msg: string) {
  const lower = msg.toLowerCase();
  return (
    lower.includes("sending confirmation email") ||
    lower.includes("error sending") ||
    lower.includes("smtp") ||
    lower.includes("email rate limit") ||
    lower.includes("confirmation email")
  );
}

export async function customerSignUpAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");

  if (!name || !email || !password)
    redirect("/signup?error=missing_fields");
  if (password.length < 8)
    redirect("/signup?error=password_too_short");
  if (password !== confirm)
    redirect("/signup?error=password_mismatch");

  const supabase = await createServerSupabaseClient();
  const adminClient = getAdminClient();

  const { data, error } = await supabase.auth.signUp({ email, password });

  // If signUp returned an error but it's only the confirmation email failing,
  // the user account was still created — look it up and continue.
  let userId = data.user?.id ?? null;

  if (error) {
    if (!isEmailSendError(error.message)) {
      // Real error (e.g. email already in use) — bail out
      redirect(`/signup?error=${encodeURIComponent(error.message)}`);
    }
    // Email send failed but account may exist — find it via admin client
    if (!userId && adminClient) {
      const { data: list } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
      userId = list?.users.find((u) => u.email?.toLowerCase() === email)?.id ?? null;
    }
  }

  if (!userId) redirect("/signup?error=signup_failed");

  const { error: profileError } = await supabase.from("customer_profiles").upsert(
    { id: userId, name, email },
    { onConflict: "id" },
  );
  if (profileError)
    redirect(`/signup?error=${encodeURIComponent(profileError.message)}`);

  // If Supabase requires email confirmation the session won't be set yet —
  // redirect to a "check your email" page instead of /account.
  if (!data.session) {
    redirect("/signup?success=check_email");
  }

  redirect(getSafeRedirectPath(formData.get("next"), "/"));
}

export async function customerSignInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = getSafeRedirectPath(formData.get("next"), "/");
  const nextQuery = encodeURIComponent(next);

  if (!email || !password)
    redirect(`/login?error=missing_fields&next=${nextQuery}`);

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error)
    redirect(`/login?error=invalid_credentials&next=${nextQuery}`);

  const userId = data.user?.id;
  if (!userId)
    redirect(`/login?error=invalid_credentials&next=${nextQuery}`);

  const { data: profile } = await supabase
    .from("customer_profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (profile) redirect(next);

  // Check if they're actually a restaurant admin / super admin
  const { data: adminProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (adminProfile) redirect("/login?error=use_dashboard_login");

  redirect(`/login?error=account_not_found&next=${nextQuery}`);
}

export async function customerSignOutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getCustomerSession() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("customer_profiles")
    .select("id, name, email")
    .eq("id", user.id)
    .maybeSingle();

  return profile ?? null;
}

export async function getCustomerAddresses() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("customer_addresses")
    .select("id, label, nickname, latitude, longitude, formatted_address, street, building, apartment, phone, driver_notes, is_default, created_at")
    .eq("customer_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function saveCustomerAddressAction(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const lat = Number(formData.get("latitude"));
  const lng = Number(formData.get("longitude"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng))
    redirect("/account?error=invalid_location");

  const label = String(formData.get("label") ?? "other");
  const isDefault = formData.get("is_default") === "true";

  if (isDefault) {
    await supabase
      .from("customer_addresses")
      .update({ is_default: false })
      .eq("customer_id", user.id);
  }

  const id = String(formData.get("id") ?? "").trim();
  if (id) {
    await supabase
      .from("customer_addresses")
      .update({
        label,
        nickname: String(formData.get("nickname") ?? "").trim() || null,
        latitude: lat,
        longitude: lng,
        formatted_address: String(formData.get("formatted_address") ?? "").trim() || null,
        street: String(formData.get("street") ?? "").trim() || null,
        building: String(formData.get("building") ?? "").trim() || null,
        apartment: String(formData.get("apartment") ?? "").trim() || null,
        phone: String(formData.get("phone") ?? "").trim() || null,
        driver_notes: String(formData.get("driver_notes") ?? "").trim() || null,
        is_default: isDefault,
      })
      .eq("id", id)
      .eq("customer_id", user.id);
  } else {
    await supabase.from("customer_addresses").insert({
      customer_id: user.id,
      label,
      nickname: String(formData.get("nickname") ?? "").trim() || null,
      latitude: lat,
      longitude: lng,
      formatted_address: String(formData.get("formatted_address") ?? "").trim() || null,
      street: String(formData.get("street") ?? "").trim() || null,
      building: String(formData.get("building") ?? "").trim() || null,
      apartment: String(formData.get("apartment") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      driver_notes: String(formData.get("driver_notes") ?? "").trim() || null,
      is_default: isDefault,
    });
  }

  redirect("/account?success=address_saved");
}

export async function deleteCustomerAddressAction(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "").trim();
  if (id) {
    await supabase
      .from("customer_addresses")
      .delete()
      .eq("id", id)
      .eq("customer_id", user.id);
  }
  redirect("/account");
}

export async function setDefaultAddressAction(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  await supabase
    .from("customer_addresses")
    .update({ is_default: false })
    .eq("customer_id", user.id);

  await supabase
    .from("customer_addresses")
    .update({ is_default: true })
    .eq("id", id)
    .eq("customer_id", user.id);

  redirect("/account");
}
