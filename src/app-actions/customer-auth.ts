"use server";

import { revalidatePath } from "next/cache";
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

function logSignupEmailDiagnostics(params: {
  email: string;
  errorMessage: string;
  hasUserInResponse: boolean;
  adminFallbackAvailable: boolean;
}) {
  const { email, errorMessage, hasUserInResponse, adminFallbackAvailable } = params;
  const domain = email.includes("@") ? email.split("@")[1] : "unknown";

  const verdict = hasUserInResponse
    ? "Account was created; only the confirmation email failed. User can try signing in or check spam."
    : adminFallbackAvailable
      ? "Account was NOT created (SMTP failed before signup). Attempting admin createUser fallback."
      : "Account was NOT created (SMTP failed before signup). Fix Supabase SMTP or disable Confirm email.";

  console.error("[signup][email-confirmation] Supabase could not send confirmation email", {
    email,
    domain,
    hasUserInResponse,
    adminFallbackAvailable,
    errorMessage,
    verdict,
    smtpChecks: {
      senderMismatch:
        "Supabase SMTP username and sender email must be the same mailbox (e.g. wissam8802@gmail.com).",
      appPasswordRevokedOrExpired:
        "Use a fresh Gmail App Password in Supabase SMTP — not your normal Gmail password.",
      gmailDailyLimitReached:
        "Gmail may block sends after quota; check Google Account → Security for alerts.",
      spamOrPromotions:
        "Only relevant if account exists and email was sent — check Spam/Promotions.",
    },
  });
}

async function ensureCustomerProfile(
  userId: string,
  name: string,
  email: string,
  adminClient: ReturnType<typeof getAdminClient>,
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
) {
  const client = adminClient ?? supabase;
  await client.from("customer_profiles").upsert({ id: userId, name, email }, { onConflict: "id" });
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
  const next = getSafeRedirectPath(formData.get("next"), "/");

  const { data, error } = await supabase.auth.signUp({ email, password });
  const userIdFromSignUp = data.user?.id ?? null;
  const hasUserInResponse = Boolean(userIdFromSignUp);

  if (error) {
    console.error("[signup] supabase.auth.signUp returned error", {
      email,
      errorMessage: error.message,
      hasUserInResponse,
    });

    if (!isEmailSendError(error.message)) {
      // Real error (e.g. email already in use) — bail out
      redirect(`/signup?error=${encodeURIComponent(error.message)}`);
    }

    logSignupEmailDiagnostics({
      email,
      errorMessage: error.message,
      hasUserInResponse,
      adminFallbackAvailable: Boolean(adminClient),
    });

    if (hasUserInResponse && userIdFromSignUp) {
      await ensureCustomerProfile(userIdFromSignUp, name, email, adminClient, supabase);
      redirect(`/signup?success=check_email&next=${encodeURIComponent(next)}`);
    }

    // SMTP failed before Supabase created the user — try admin API to bypass broken email.
    if (adminClient) {
      const { data: created, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
      });

      if (createError) {
        console.error("[signup][admin-fallback] createUser failed", {
          email,
          errorMessage: createError.message,
        });
        redirect(`/signup?error=smtp_failed&next=${encodeURIComponent(next)}`);
      }

      const fallbackUserId = created.user?.id;
      if (!fallbackUserId) redirect(`/signup?error=smtp_failed&next=${encodeURIComponent(next)}`);

      console.info("[signup][admin-fallback] User created without confirmation email", {
        email,
        userId: fallbackUserId,
      });

      await ensureCustomerProfile(fallbackUserId, name, email, adminClient, supabase);

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        redirect(`/signup?success=check_email&next=${encodeURIComponent(next)}`);
      }

      redirect(next);
    }

    redirect(`/signup?error=smtp_failed&next=${encodeURIComponent(next)}`);
  }

  const userId = userIdFromSignUp;
  if (!userId) redirect("/signup?error=signup_failed");

  await ensureCustomerProfile(userId, name, email, adminClient, supabase);

  // If Supabase requires email confirmation the session won't be set yet —
  // redirect to a "check your email" page instead of /account.
  if (!data.session) {
    redirect(`/signup?success=check_email&next=${encodeURIComponent(next)}`);
  }

  redirect(next);
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

  // Self-heal legacy/customer rows if profile wasn't created at signup time.
  const fallbackName =
    String(data.user?.user_metadata?.name ?? "").trim() ||
    email.split("@")[0] ||
    "Customer";
  const { error: ensureProfileError } = await supabase.from("customer_profiles").upsert(
    { id: userId, name: fallbackName, email },
    { onConflict: "id" },
  );
  if (!ensureProfileError) redirect(next);

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

export type QuickSaveAddressInput = {
  label: string;
  latitude: number;
  longitude: number;
  formatted_address?: string | null;
  building?: string | null;
  apartment?: string | null;
  phone?: string | null;
  driver_notes?: string | null;
  is_default?: boolean;
};

export type QuickSaveAddressResult =
  | {
      ok: true;
      address: {
        id: string;
        label: string;
        nickname: string | null;
        latitude: number;
        longitude: number;
        formatted_address: string | null;
        is_default: boolean;
      };
    }
  | { ok: false; error: string };

/** Save an address from the delivery sheet without redirecting. */
export async function quickSaveCustomerAddressAction(
  input: QuickSaveAddressInput,
): Promise<QuickSaveAddressResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not_logged_in" };

  const lat = Number(input.latitude);
  const lng = Number(input.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng))
    return { ok: false, error: "invalid_location" };

  const label = String(input.label ?? "other").trim() || "other";
  const isDefault = Boolean(input.is_default);
  const nickname =
    label === "home"
      ? "Home"
      : label === "work"
        ? "Work"
        : label === "moms"
          ? "Mom's"
          : label === "other"
            ? "Other"
            : capitaliseLabel(label);

  if (isDefault) {
    await supabase
      .from("customer_addresses")
      .update({ is_default: false })
      .eq("customer_id", user.id);
  }

  const row = {
    customer_id: user.id,
    label,
    nickname,
    latitude: lat,
    longitude: lng,
    formatted_address: String(input.formatted_address ?? "").trim() || null,
    street: null,
    building: String(input.building ?? "").trim() || null,
    apartment: String(input.apartment ?? "").trim() || null,
    phone: String(input.phone ?? "").trim() || null,
    driver_notes: String(input.driver_notes ?? "").trim() || null,
    is_default: isDefault,
  };

  const { data, error } = await supabase
    .from("customer_addresses")
    .insert(row)
    .select("id, label, nickname, latitude, longitude, formatted_address, is_default")
    .single();

  if (error || !data) return { ok: false, error: error?.message ?? "save_failed" };

  revalidatePath("/");
  revalidatePath("/account");

  return { ok: true, address: data };
}

function capitaliseLabel(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
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
