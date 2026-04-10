"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { toSlug } from "@/lib/slug";
import { env } from "@/lib/env";

async function requireSuperAdmin() {
  const user = await getCurrentUserRole();
  if (!user || user.role !== "superadmin") {
    redirect("/dashboard/login");
  }
}

async function getUniqueSlug(baseName: string) {
  const supabase = await createServerSupabaseClient();
  const baseSlug = toSlug(baseName);
  let slug = baseSlug;
  let count = 1;

  while (true) {
    const { data } = await supabase
      .from("restaurants")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
    slug = `${baseSlug}-${count++}`;
  }
}

export async function createRestaurantAction(formData: FormData) {
  await requireSuperAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!name || !phone || !email) {
    redirect("/dashboard/super-admin?error=missing_restaurant_fields");
  }

  try {
    const slug = await getUniqueSlug(name);
    const adminClient = getAdminClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const { data: restaurantData, error: restaurantError } = await adminClient
      .from("restaurants")
      .insert({ name, phone, slug, is_active: true })
      .select("id")
      .single();

    if (restaurantError) throw restaurantError;

    const inviteAdminName = `${name} Admin`;
    const { data: invited, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: `${appUrl}/auth/set-password`,
        data: {
          restaurant_slug: slug,
          dashboard_url: `${appUrl}/dashboard/login`,
        },
      },
    );
    if (inviteError) throw inviteError;

    const userId = invited.user?.id;
    if (!userId) throw new Error("Invite created but no user id returned.");

    const { error: upsertError } = await adminClient.from("users").upsert(
      {
        id: userId,
        name: inviteAdminName,
        email,
        role: "restaurant_admin",
        restaurant_id: restaurantData.id,
      },
      { onConflict: "id" },
    );
    if (upsertError) throw upsertError;

    await sendRestaurantOnboardingEmail({
      to: email,
      restaurantName: name,
      menuUrl: `${appUrl}/${slug}`,
      dashboardUrl: `${appUrl}/dashboard/login`,
    });

    revalidatePath("/dashboard/super-admin");
    redirect("/dashboard/super-admin?success=restaurant_created_and_invited");
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    redirect(`/dashboard/super-admin?error=${encodeURIComponent(message)}`);
  }
}

export async function toggleRestaurantActiveAction(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id"));
  const isActive = String(formData.get("is_active")) === "true";
  const supabase = await createServerSupabaseClient();
  await supabase.from("restaurants").update({ is_active: !isActive }).eq("id", id);
  revalidatePath("/dashboard/super-admin");
}

export async function renewSubscriptionAction(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id"));
  const supabase = await createServerSupabaseClient();
  await supabase.from("restaurants").update({ is_active: true }).eq("id", id);
  revalidatePath("/dashboard/super-admin");
  redirect("/dashboard/super-admin?success=subscription_renewed");
}

export async function deleteRestaurantAction(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id"));
  const supabase = await createServerSupabaseClient();
  await supabase.from("restaurants").delete().eq("id", id);
  revalidatePath("/dashboard/super-admin");
  redirect("/dashboard/super-admin?success=restaurant_deleted");
}

function getAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!env.supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or Supabase URL.");
  }

  return createClient(env.supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function sendRestaurantOnboardingEmail(params: {
  to: string;
  restaurantName: string;
  menuUrl: string;
  dashboardUrl: string;
}) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const fromEmail = process.env.SMTP_FROM ?? smtpUser;

  if (!smtpUser || !smtpPass || !fromEmail) {
    return;
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
    to: params.to,
    subject: `Welcome to Zboun - ${params.restaurantName}`,
    text: [
      `Hello,`,
      ``,
      `Your restaurant "${params.restaurantName}" is ready on Zboun.`,
      ``,
      `Menu URL: ${params.menuUrl}`,
      `Dashboard URL: ${params.dashboardUrl}`,
      ``,
      `Please check your Supabase invite email and use its secure set-password link to activate your account.`,
      ``,
      `- Zboun Team`,
    ].join("\n"),
  });
}

