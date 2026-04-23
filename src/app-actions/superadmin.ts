"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { parseBrowseSectionsFromForm } from "@/lib/browse-sections";
import { toSlug } from "@/lib/slug";
import { env } from "@/lib/env";

async function requireSuperAdmin() {
  const user = await getCurrentUserRole();
  if (!user || user.role !== "superadmin") {
    redirect("/dashboard/login");
  }
}

function toPositiveMoney(raw: FormDataEntryValue | null): number {
  const value = Number(String(raw ?? "").trim());
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Amount must be a positive number.");
  }
  return Math.round(value * 100) / 100;
}

function parseIsoDate(raw: FormDataEntryValue | null): string | null {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid date value.");
  }
  return parsed.toISOString();
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

function getAppBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const isVercel = process.env.VERCEL === "1" || Boolean(process.env.VERCEL_URL);
  const looksLocalhost =
    envUrl?.includes("localhost") || envUrl?.includes("127.0.0.1");

  if (envUrl && (!isVercel || !looksLocalhost)) {
    return envUrl.replace(/\/+$/, "");
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/+$/, "")}`;
  }

  return "http://localhost:3000";
}

export async function createRestaurantAction(formData: FormData) {
  await requireSuperAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const browseSections = parseBrowseSectionsFromForm(formData);

  if (!name || !phone || !email) {
    redirect("/dashboard/super-admin?error=missing_restaurant_fields");
  }

  try {
    const slug = await getUniqueSlug(name);
    const adminClient = getAdminClient();
    const appUrl = getAppBaseUrl();

    const { data: restaurantData, error: restaurantError } = await adminClient
      .from("restaurants")
      .insert({
        name,
        phone,
        slug,
        is_active: true,
        browse_sections: browseSections.length > 0 ? browseSections : ["Lunch"],
      })
      .select("id")
      .single();

    if (restaurantError) throw restaurantError;

    const inviteAdminName = `${name} Admin`;
    let userId: string | null = null;
    const initialPassword = `Zboun@${Math.random().toString(36).slice(-8)}A1`;

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: initialPassword,
      email_confirm: true,
    });

    if (createError) {
      const { data: usersList, error: listError } = await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      if (listError) throw listError;
      userId = usersList.users.find((user) => user.email?.toLowerCase() === email)?.id ?? null;
      if (!userId) throw new Error("Could not create or locate restaurant admin user.");

      const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, {
        password: initialPassword,
        email_confirm: true,
      });
      if (updateError) throw updateError;
    } else {
      userId = created.user?.id ?? null;
    }

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

    let emailSent = false;
    try {
      await sendRestaurantOnboardingEmail({
        to: email,
        restaurantName: name,
        menuUrl: `${appUrl}/${slug}`,
        dashboardUrl: `${appUrl}/dashboard/login`,
        initialPassword,
      });
      emailSent = true;
    } catch {
      emailSent = false;
    }

    revalidatePath("/dashboard/super-admin");
    if (!emailSent) {
      redirect("/dashboard/super-admin?success=restaurant_created_email_failed");
    }
    redirect("/dashboard/super-admin?success=restaurant_created_with_fallback");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    const message = error instanceof Error ? error.message : "unknown_error";
    redirect(`/dashboard/super-admin?error=${encodeURIComponent(message)}`);
  }
}

export async function updateRestaurantBrowseSectionsAction(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const browseSections = parseBrowseSectionsFromForm(formData);
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("restaurants")
    .update({ browse_sections: browseSections.length > 0 ? browseSections : ["Lunch"] })
    .eq("id", id);
  revalidatePath("/dashboard/super-admin");
  revalidatePath("/");
}

export async function toggleRestaurantActiveAction(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id"));
  const isActive = String(formData.get("is_active")) === "true";
  const supabase = await createServerSupabaseClient();
  await supabase.from("restaurants").update({ is_active: !isActive }).eq("id", id);
  revalidatePath("/dashboard/super-admin");
  revalidatePath("/");
}

export async function toggleRestaurantHomeVisibilityAction(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id"));
  const showOnHome = String(formData.get("show_on_home")) === "true";
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("restaurants")
    .update({ show_on_home: !showOnHome })
    .eq("id", id);
  revalidatePath("/dashboard/super-admin");
  revalidatePath("/");
}

export async function renewSubscriptionAction(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id"));
  const supabase = await createServerSupabaseClient();
  await supabase.from("restaurants").update({ is_active: true }).eq("id", id);
  revalidatePath("/dashboard/super-admin");
  redirect("/dashboard/super-admin?success=subscription_renewed");
}

export async function updateSubscriptionStatusAction(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const allowed = new Set(["trial", "active", "overdue", "paused", "cancelled"]);
  if (!id || !allowed.has(status)) {
    redirect("/dashboard/super-admin?error=invalid_subscription_update");
  }

  const endedAt = status === "cancelled" ? new Date().toISOString() : null;
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("restaurant_subscriptions")
    .update({ status, ended_at: endedAt, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) {
    redirect(`/dashboard/super-admin?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/dashboard/super-admin");
}

export async function setNextDueDateAction(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const nextDueAt = parseIsoDate(formData.get("next_due_at"));
  if (!id || !nextDueAt) {
    redirect("/dashboard/super-admin?error=invalid_due_date");
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("restaurant_subscriptions")
    .update({ next_due_at: nextDueAt, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) {
    redirect(`/dashboard/super-admin?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/dashboard/super-admin");
}

export async function createInvoiceAction(formData: FormData) {
  await requireSuperAdmin();
  const restaurantId = String(formData.get("restaurant_id") ?? "").trim();
  const subscriptionId = String(formData.get("subscription_id") ?? "").trim();
  const dueAt = parseIsoDate(formData.get("due_at"));
  const periodStart = String(formData.get("period_start") ?? "").trim() || null;
  const periodEnd = String(formData.get("period_end") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const amountDue = toPositiveMoney(formData.get("amount_due"));

  if (!restaurantId || !dueAt) {
    redirect("/dashboard/super-admin?error=missing_invoice_fields");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("invoices").insert({
    restaurant_id: restaurantId,
    subscription_id: subscriptionId || null,
    period_start: periodStart,
    period_end: periodEnd,
    amount_due: amountDue,
    due_at: dueAt,
    notes,
    status: "unpaid",
    amount_paid: 0,
  });

  if (error) {
    redirect(`/dashboard/super-admin?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/super-admin");
  redirect("/dashboard/super-admin?success=invoice_created");
}

export async function recordCashPaymentAction(formData: FormData) {
  await requireSuperAdmin();
  const invoiceId = String(formData.get("invoice_id") ?? "").trim();
  const referenceNote = String(formData.get("reference_note") ?? "").trim() || null;
  const paidAt = parseIsoDate(formData.get("paid_at")) ?? new Date().toISOString();
  const amountPaid = toPositiveMoney(formData.get("amount_paid"));

  if (!invoiceId) {
    redirect("/dashboard/super-admin?error=missing_invoice_id");
  }

  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "superadmin") {
    redirect("/dashboard/login");
  }

  const supabase = await createServerSupabaseClient();
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("id, restaurant_id, amount_due, amount_paid, status")
    .eq("id", invoiceId)
    .single();
  if (invoiceError || !invoice) {
    redirect("/dashboard/super-admin?error=invoice_not_found");
  }
  if (invoice.status === "void") {
    redirect("/dashboard/super-admin?error=cannot_pay_void_invoice");
  }

  const nextAmountPaid = Math.round((Number(invoice.amount_paid ?? 0) + amountPaid) * 100) / 100;
  if (nextAmountPaid - Number(invoice.amount_due) > 0.0001) {
    redirect("/dashboard/super-admin?error=payment_exceeds_invoice_due");
  }

  const nextStatus =
    nextAmountPaid <= 0
      ? "unpaid"
      : nextAmountPaid + 0.0001 >= Number(invoice.amount_due)
        ? "paid"
        : "partial";
  const paidAtWhenClosed = nextStatus === "paid" ? paidAt : null;

  const { error: paymentError } = await supabase.from("payments").insert({
    invoice_id: invoiceId,
    restaurant_id: invoice.restaurant_id,
    amount_paid: amountPaid,
    paid_at: paidAt,
    method: "cash",
    reference_note: referenceNote,
    recorded_by: appUser.id,
  });
  if (paymentError) {
    redirect(`/dashboard/super-admin?error=${encodeURIComponent(paymentError.message)}`);
  }

  const { error: invoiceUpdateError } = await supabase
    .from("invoices")
    .update({
      amount_paid: nextAmountPaid,
      status: nextStatus,
      paid_at: paidAtWhenClosed,
    })
    .eq("id", invoiceId);
  if (invoiceUpdateError) {
    redirect(`/dashboard/super-admin?error=${encodeURIComponent(invoiceUpdateError.message)}`);
  }

  revalidatePath("/dashboard/super-admin");
  redirect("/dashboard/super-admin?success=payment_recorded");
}

export async function deleteRestaurantAction(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id"));
  const adminClient = getAdminClient();

  const { data: linkedUsers } = await adminClient
    .from("users")
    .select("id")
    .eq("restaurant_id", id)
    .eq("role", "restaurant_admin");

  for (const user of linkedUsers ?? []) {
    await adminClient.auth.admin.deleteUser(user.id);
  }

  await adminClient.from("restaurants").delete().eq("id", id);
  revalidatePath("/dashboard/super-admin");
  revalidatePath("/");
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
  initialPassword: string;
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
      `Password: ${params.initialPassword}`,
      ``,
      `Use this password to sign in. The restaurant admin can change it later from the dashboard.`,
      ``,
      `- Zboun Team`,
    ].join("\n"),
  });
}

