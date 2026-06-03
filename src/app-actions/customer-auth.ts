"use server";

import crypto from "node:crypto";
import nodemailer from "nodemailer";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getSafeRedirectPath } from "@/lib/auth-redirect";
import {
  customerAddressDisplayName,
  duplicateAddressNameMessage,
  normalizeAddressNameKey,
} from "@/lib/customer-address";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

type AddressNameRow = { id: string; label: string; nickname: string | null };

async function findDuplicateAddressName(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  customerId: string,
  label: string,
  nickname: string | null,
  excludeId?: string | null,
): Promise<string | null> {
  const displayName = customerAddressDisplayName(label, nickname);
  const key = normalizeAddressNameKey(displayName);

  const { data: existing } = await supabase
    .from("customer_addresses")
    .select("id, label, nickname")
    .eq("customer_id", customerId);

  for (const row of (existing ?? []) as AddressNameRow[]) {
    if (excludeId && row.id === excludeId) continue;
    const other = customerAddressDisplayName(row.label, row.nickname);
    if (normalizeAddressNameKey(other) === key) return displayName;
  }
  return null;
}

function getAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!env.supabaseUrl || !key) return null;
  return createClient(env.supabaseUrl, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function hashOtp(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendCustomerSignupOtpEmail(to: string, code: string) {
  const smtpUser = String(process.env.SMTP_USER ?? "").trim();
  const smtpPass = String(process.env.SMTP_PASS ?? "").replace(/\s+/g, "");
  const fromEmail = String(process.env.SMTP_FROM ?? smtpUser).trim();
  if (!smtpUser || !smtpPass || !fromEmail) {
    throw new Error("Email server is not configured.");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: smtpUser, pass: smtpPass },
  });

  await transporter.sendMail({
    from: fromEmail,
    to,
    subject: "Your Zboun verification code",
    text: [
      "Welcome to Zboun,",
      "",
      `Your 6-digit verification code is: ${code}`,
      "This code expires in 10 minutes.",
      "",
      "If you did not request this, you can ignore this email.",
      "",
      "- Zboun Team",
    ].join("\n"),
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
  if (!adminClient) {
    redirect(`/signup?error=signup_unavailable&next=${encodeURIComponent(next)}`);
  }

  // Create unconfirmed user (no Supabase SMTP involved).
  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: { name },
  });
  if (createError) {
    redirect(`/signup?error=${encodeURIComponent(createError.message)}&next=${encodeURIComponent(next)}`);
  }

  const userId = created.user?.id;
  if (!userId) redirect(`/signup?error=signup_failed&next=${encodeURIComponent(next)}`);

  await ensureCustomerProfile(userId, name, email, adminClient, supabase);

  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const nowIso = new Date().toISOString();

  await adminClient
    .from("customer_signup_otps")
    .update({ used_at: nowIso })
    .eq("user_id", userId)
    .is("used_at", null);

  const { error: otpInsertError } = await adminClient.from("customer_signup_otps").insert({
    user_id: userId,
    otp_hash: otpHash,
    expires_at: expiresAt,
  });
  if (otpInsertError) {
    redirect(`/signup?error=${encodeURIComponent(otpInsertError.message)}&next=${encodeURIComponent(next)}`);
  }

  try {
    await sendCustomerSignupOtpEmail(email, otp);
  } catch (error) {
    const message = error instanceof Error ? error.message : "otp_send_failed";
    redirect(`/signup?error=${encodeURIComponent(message)}&next=${encodeURIComponent(next)}`);
  }

  redirect(`/signup/verify?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`);
}

export async function resendCustomerSignupOtpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const next = getSafeRedirectPath(formData.get("next"), "/");
  if (!email) redirect(`/signup/verify?error=missing_email&next=${encodeURIComponent(next)}`);

  const adminClient = getAdminClient();
  if (!adminClient) redirect(`/signup/verify?error=signup_unavailable&next=${encodeURIComponent(next)}`);

  const { data: profile } = await adminClient
    .from("customer_profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  const userId = profile?.id;
  if (!userId) redirect(`/signup/verify?error=account_not_found&next=${encodeURIComponent(next)}`);

  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const nowIso = new Date().toISOString();

  await adminClient
    .from("customer_signup_otps")
    .update({ used_at: nowIso })
    .eq("user_id", userId)
    .is("used_at", null);

  const { error: otpInsertError } = await adminClient.from("customer_signup_otps").insert({
    user_id: userId,
    otp_hash: otpHash,
    expires_at: expiresAt,
  });
  if (otpInsertError) {
    redirect(`/signup/verify?error=${encodeURIComponent(otpInsertError.message)}&email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`);
  }

  try {
    await sendCustomerSignupOtpEmail(email, otp);
  } catch (error) {
    const message = error instanceof Error ? error.message : "otp_send_failed";
    redirect(`/signup/verify?error=${encodeURIComponent(message)}&email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`);
  }

  redirect(`/signup/verify?success=otp_sent&email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`);
}

export async function verifyCustomerSignupOtpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const otp = String(formData.get("otp") ?? "").trim();
  const next = getSafeRedirectPath(formData.get("next"), "/");

  if (!email) redirect(`/signup/verify?error=missing_email&next=${encodeURIComponent(next)}`);
  if (!otp || otp.length !== 6) {
    redirect(`/signup/verify?error=invalid_otp&email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`);
  }

  const adminClient = getAdminClient();
  if (!adminClient) redirect(`/signup/verify?error=signup_unavailable&next=${encodeURIComponent(next)}`);

  const { data: profile } = await adminClient
    .from("customer_profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  const userId = profile?.id;
  if (!userId) redirect(`/signup/verify?error=account_not_found&next=${encodeURIComponent(next)}`);

  const nowIso = new Date().toISOString();
  const { data: otpRow } = await adminClient
    .from("customer_signup_otps")
    .select("id, otp_hash, expires_at")
    .eq("user_id", userId)
    .is("used_at", null)
    .gte("expires_at", nowIso)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!otpRow) {
    redirect(`/signup/verify?error=otp_not_found_or_expired&email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`);
  }
  if (hashOtp(otp) !== otpRow.otp_hash) {
    redirect(`/signup/verify?error=invalid_otp&email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`);
  }

  const { error: confirmError } = await adminClient.auth.admin.updateUserById(userId, {
    email_confirm: true,
  });
  if (confirmError) {
    redirect(`/signup/verify?error=${encodeURIComponent(confirmError.message)}&email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`);
  }

  await adminClient
    .from("customer_signup_otps")
    .update({ used_at: nowIso })
    .eq("id", otpRow.id)
    .eq("user_id", userId);

  redirect(`/login?success=email_verified&next=${encodeURIComponent(next)}`);
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
  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("email not confirmed")) {
      redirect(`/login?error=email_not_verified&next=${nextQuery}`);
    }
    redirect(`/login?error=invalid_credentials&next=${nextQuery}`);
  }

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
    .select(
      "id, label, nickname, latitude, longitude, formatted_address, street, building, apartment, phone, country_code, driver_notes, voice_directions_url, address_photo_urls, is_default, created_at",
    )
    .eq("customer_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  return data ?? [];
}

export type CheckoutAddressInput = {
  id?: string | null;
  label: string;
  nickname: string;
  latitude: number;
  longitude: number;
  formatted_address?: string | null;
  street?: string | null;
  building?: string | null;
  apartment?: string | null;
  phone?: string | null;
  country_code?: string | null;
  driver_notes?: string | null;
  voice_directions_url?: string | null;
  address_photo_urls?: string[];
  is_default?: boolean;
};

export type CheckoutAddressResult =
  | {
      ok: true;
      address: {
        id: string;
        label: string;
        nickname: string | null;
        latitude: number;
        longitude: number;
        formatted_address: string | null;
        street: string | null;
        building: string | null;
        apartment: string | null;
        phone: string | null;
        country_code: string | null;
        driver_notes: string | null;
        voice_directions_url: string | null;
        address_photo_urls: string[];
        is_default: boolean;
      };
    }
  | { ok: false; error: string };

async function ensureAddressMediaBucket(admin: ReturnType<typeof getAdminClient>) {
  if (!admin) throw new Error("Storage unavailable");
  const bucket = "customer-address-media";
  const { data: buckets } = await admin.storage.listBuckets();
  if (!(buckets ?? []).some((b) => b.name === bucket)) {
    await admin.storage.createBucket(bucket, { public: true, fileSizeLimit: 10 * 1024 * 1024 });
  }
  return bucket;
}

export async function uploadCustomerAddressMediaAction(
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not_logged_in" };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "no_file" };
  if (file.size > 10 * 1024 * 1024) return { ok: false, error: "file_too_large" };

  const admin = getAdminClient();
  if (!admin) return { ok: false, error: "storage_unavailable" };

  try {
    const bucket = await ensureAddressMediaBucket(admin);
    const kind = String(formData.get("kind") ?? "file");
    const ext =
      file.name.includes(".") ? file.name.split(".").pop() : kind === "voice" ? "webm" : "jpg";
    const filePath = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const { error } = await admin.storage.from(bucket).upload(filePath, file, {
      contentType: file.type || (kind === "voice" ? "audio/webm" : "image/jpeg"),
      upsert: false,
    });
    if (error) return { ok: false, error: error.message };
    const { data } = admin.storage.from(bucket).getPublicUrl(filePath);
    return { ok: true, url: data.publicUrl };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "upload_failed" };
  }
}

export async function saveCheckoutAddressAction(
  input: CheckoutAddressInput,
): Promise<CheckoutAddressResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not_logged_in" };

  const lat = Number(input.latitude);
  const lng = Number(input.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return { ok: false, error: "invalid_location" };

  const label = String(input.label ?? "other").trim() || "other";
  const isDefault = Boolean(input.is_default);
  const row = {
    label,
    nickname: String(input.nickname ?? "").trim() || null,
    latitude: lat,
    longitude: lng,
    formatted_address: String(input.formatted_address ?? "").trim() || null,
    street: String(input.street ?? "").trim() || null,
    building: String(input.building ?? "").trim() || null,
    apartment: String(input.apartment ?? "").trim() || null,
    phone: String(input.phone ?? "").trim() || null,
    country_code: String(input.country_code ?? "+961").trim() || "+961",
    driver_notes: String(input.driver_notes ?? "").trim() || null,
    voice_directions_url: String(input.voice_directions_url ?? "").trim() || null,
    address_photo_urls: Array.isArray(input.address_photo_urls) ? input.address_photo_urls : [],
    is_default: isDefault,
  };

  if (isDefault) {
    await supabase.from("customer_addresses").update({ is_default: false }).eq("customer_id", user.id);
  }

  const id = String(input.id ?? "").trim();
  const duplicate = await findDuplicateAddressName(supabase, user.id, label, row.nickname, id || null);
  if (duplicate) return { ok: false, error: duplicateAddressNameMessage(duplicate) };

  if (id) {
    const { data, error } = await supabase
      .from("customer_addresses")
      .update(row)
      .eq("id", id)
      .eq("customer_id", user.id)
      .select(
        "id, label, nickname, latitude, longitude, formatted_address, street, building, apartment, phone, country_code, driver_notes, voice_directions_url, address_photo_urls, is_default",
      )
      .single();
    if (error || !data) return { ok: false, error: error?.message ?? "update_failed" };
    revalidatePath("/");
    revalidatePath("/account");
    return { ok: true, address: { ...data, address_photo_urls: data.address_photo_urls ?? [] } };
  }

  const { data, error } = await supabase
    .from("customer_addresses")
    .insert({ ...row, customer_id: user.id })
    .select(
      "id, label, nickname, latitude, longitude, formatted_address, street, building, apartment, phone, country_code, driver_notes, voice_directions_url, address_photo_urls, is_default",
    )
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "save_failed" };
  revalidatePath("/");
  revalidatePath("/account");
  return { ok: true, address: { ...data, address_photo_urls: data.address_photo_urls ?? [] } };
}

export async function deleteCheckoutAddressAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not_logged_in" };
  const trimmed = id.trim();
  if (!trimmed) return { ok: false, error: "missing_id" };
  const { error } = await supabase
    .from("customer_addresses")
    .delete()
    .eq("id", trimmed)
    .eq("customer_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/account");
  return { ok: true };
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

  const duplicate = await findDuplicateAddressName(supabase, user.id, label, nickname, null);
  if (duplicate) return { ok: false, error: duplicateAddressNameMessage(duplicate) };

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
  const nickname = String(formData.get("nickname") ?? "").trim() || null;
  const countryCode = String(formData.get("country_code") ?? "+961").trim() || "+961";
  const isDefault = formData.get("is_default") === "true";

  if (isDefault) {
    await supabase
      .from("customer_addresses")
      .update({ is_default: false })
      .eq("customer_id", user.id);
  }

  const id = String(formData.get("id") ?? "").trim();
  const duplicate = await findDuplicateAddressName(supabase, user.id, label, nickname, id || null);
  if (duplicate) {
    if (id) redirect(`/account/addresses/${id}?error=duplicate_name`);
    redirect("/account/addresses/new?error=duplicate_name");
  }

  if (id) {
    await supabase
      .from("customer_addresses")
      .update({
        label,
        nickname,
        latitude: lat,
        longitude: lng,
        formatted_address: String(formData.get("formatted_address") ?? "").trim() || null,
        street: String(formData.get("street") ?? "").trim() || null,
        building: String(formData.get("building") ?? "").trim() || null,
        apartment: String(formData.get("apartment") ?? "").trim() || null,
        phone: String(formData.get("phone") ?? "").trim() || null,
        country_code: countryCode,
        driver_notes: String(formData.get("driver_notes") ?? "").trim() || null,
        is_default: isDefault,
      })
      .eq("id", id)
      .eq("customer_id", user.id);
  } else {
    await supabase.from("customer_addresses").insert({
      customer_id: user.id,
      label,
      nickname,
      latitude: lat,
      longitude: lng,
      formatted_address: String(formData.get("formatted_address") ?? "").trim() || null,
      street: String(formData.get("street") ?? "").trim() || null,
      building: String(formData.get("building") ?? "").trim() || null,
      apartment: String(formData.get("apartment") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      country_code: countryCode,
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

export async function changePasswordAction(formData: FormData) {
  const current   = String(formData.get("current_password")  ?? "");
  const newPass   = String(formData.get("new_password")      ?? "");
  const confirm   = String(formData.get("confirm_password")  ?? "");

  if (!current || !newPass || !confirm)
    redirect("/account/change-password?error=missing_fields");
  if (newPass.length < 8)
    redirect("/account/change-password?error=too_short");
  if (newPass !== confirm)
    redirect("/account/change-password?error=mismatch");

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect("/login");

  // Re-authenticate with current password first
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: current,
  });
  if (signInError) redirect("/account/change-password?error=wrong_current");

  // Update to new password
  const { error } = await supabase.auth.updateUser({ password: newPass });
  if (error) redirect(`/account/change-password?error=update_failed`);

  redirect("/account?success=password_changed");
}
