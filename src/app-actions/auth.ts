"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
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
    redirect("/dashboard/restaurant");
  }
  redirect("/dashboard/login?error=missing_profile");
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/dashboard/login");
}

function hashOtp(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendOtpEmail(to: string, code: string) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const fromEmail = process.env.SMTP_FROM ?? smtpUser;
  if (!smtpUser || !smtpPass || !fromEmail) {
    throw new Error("Email server is not configured.");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from: fromEmail,
    to,
    subject: "Your Zboun password reset OTP",
    text: [
      "Hello,",
      "",
      `Your one-time verification code is: ${code}`,
      "This code expires in 10 minutes.",
      "",
      "If you didn't request this, you can ignore this email.",
      "",
      "- Zboun Team",
    ].join("\n"),
  });
}

export async function requestPasswordChangeOtpAction() {
  const appUser = await getCurrentUserRole();
  if (!appUser) {
    redirect("/dashboard/login");
  }

  const supabase = await createServerSupabaseClient();
  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await supabase
    .from("password_change_otps")
    .update({ used_at: new Date().toISOString() })
    .eq("user_id", appUser.id)
    .is("used_at", null);

  const { error: insertError } = await supabase.from("password_change_otps").insert({
    user_id: appUser.id,
    otp_hash: otpHash,
    expires_at: expiresAt,
  });

  if (insertError) {
    redirect(`/dashboard/change-password?error=${encodeURIComponent(insertError.message)}`);
  }

  try {
    await sendOtpEmail(appUser.email, otp);
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed_to_send_otp";
    redirect(`/dashboard/change-password?error=${encodeURIComponent(message)}`);
  }

  redirect("/dashboard/change-password?success=otp_sent");
}

export async function verifyOtpAndChangePasswordAction(formData: FormData) {
  const appUser = await getCurrentUserRole();
  if (!appUser) {
    redirect("/dashboard/login");
  }

  const otp = String(formData.get("otp") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (!otp || otp.length !== 6) {
    redirect("/dashboard/change-password?error=invalid_otp");
  }
  if (password.length < 8) {
    redirect("/dashboard/change-password?error=password_too_short");
  }
  if (password !== confirmPassword) {
    redirect("/dashboard/change-password?error=password_mismatch");
  }

  const supabase = await createServerSupabaseClient();
  const nowIso = new Date().toISOString();
  const { data: otpRow, error: otpError } = await supabase
    .from("password_change_otps")
    .select("id, otp_hash, expires_at")
    .eq("user_id", appUser.id)
    .is("used_at", null)
    .gte("expires_at", nowIso)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (otpError || !otpRow) {
    redirect("/dashboard/change-password?error=otp_not_found_or_expired");
  }

  if (hashOtp(otp) !== otpRow.otp_hash) {
    redirect("/dashboard/change-password?error=invalid_otp");
  }

  const { error: updatePasswordError } = await supabase.auth.updateUser({
    password,
  });
  if (updatePasswordError) {
    redirect(
      `/dashboard/change-password?error=${encodeURIComponent(updatePasswordError.message)}`,
    );
  }

  await supabase
    .from("password_change_otps")
    .update({ used_at: nowIso })
    .eq("id", otpRow.id)
    .eq("user_id", appUser.id);

  redirect("/dashboard/change-password?success=password_changed");
}
