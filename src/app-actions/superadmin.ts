"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createInitialSubscription, createComplimentarySubscription, applyComplimentaryBilling, removeComplimentaryBilling, renewRestaurantSubscription, getRestaurantAdminEmail, getLatestSubscription } from "@/lib/subscription-billing";
import {
  isComplimentaryGrantRequested,
  parseComplimentaryPeriodFromForm,
  complimentaryPeriodLabel,
} from "@/lib/complimentary-billing";
import { deactivateRestaurantManually } from "@/lib/subscription-lifecycle";
import {
  sendRestaurantOnboardingEmail,
  sendSubscriptionRenewalEmail,
} from "@/lib/subscription-emails";
import {
  formatBrowseSectionsLabel,
  inferBusinessTypeFromBrowseSections,
  normalizeBrowseSections,
  validateBrowseSelectionFromForm,
} from "@/lib/browse-sections";
import {
  hasCatalogDashboard,
} from "@/lib/business-types";
import { parseSubscriptionInterval } from "@/lib/pricing";
import { toSlug } from "@/lib/slug";
import { env } from "@/lib/env";
import { getPublicAppUrl } from "@/lib/public-app-url";

async function requireSuperAdmin() {
  const user = await getCurrentUserRole();
  if (!user || user.role !== "superadmin") {
    redirect("/dashboard/login");
  }
  return user;
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
  return getPublicAppUrl();
}

export async function createRestaurantAction(formData: FormData) {
  await requireSuperAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const browseValidated = validateBrowseSelectionFromForm(formData);
  if (!browseValidated.ok) {
    redirect(`/dashboard/super-admin?error=${encodeURIComponent(browseValidated.error)}`);
  }
  const browseSelection = browseValidated.selection;
  const browseSections = normalizeBrowseSections(browseSelection);
  const complimentaryFree = isComplimentaryGrantRequested(formData);
  const complimentaryPeriod = complimentaryFree
    ? parseComplimentaryPeriodFromForm(formData)
    : null;
  const lifetimeFree = complimentaryPeriod?.kind === "lifetime";
  const subscriptionInterval = complimentaryPeriod
    ? null
    : parseSubscriptionInterval(formData.get("subscription_interval"));

  const adminPassword = String(formData.get("admin_password") ?? "");

  if (!name || !phone || !email) {
    redirect("/dashboard/super-admin?error=missing_restaurant_fields");
  }
  if (!adminPassword) {
    redirect("/dashboard/super-admin?error=missing_password");
  }
  if (adminPassword.length < 8) {
    redirect("/dashboard/super-admin?error=password_too_short");
  }

  const businessType = inferBusinessTypeFromBrowseSections(browseSections);
  const categoryLabel = formatBrowseSectionsLabel(browseSelection);

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
        show_on_home: true,
        business_type: businessType,
        browse_sections: browseSelection,
        billing_exempt: lifetimeFree,
      })
      .select("id")
      .single();

    if (restaurantError) throw restaurantError;

    // Optionally seed the first location
    const initLat = Number(formData.get("init_latitude") ?? "");
    const initLng = Number(formData.get("init_longitude") ?? "");
    const initAddress = String(formData.get("init_address") ?? "").trim() || null;
    if (Number.isFinite(initLat) && Number.isFinite(initLng) && initLat !== 0 && initLng !== 0) {
      await adminClient.from("restaurant_locations").insert({
        restaurant_id: restaurantData.id,
        name: "Main Branch",
        latitude: initLat,
        longitude: initLng,
        address: initAddress,
        is_main: true,
        position: 0,
      });
    }

    const inviteAdminName = `${name} Admin`;
    let userId: string | null = null;

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: adminPassword,
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
        password: adminPassword,
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

    const subscription = complimentaryPeriod
      ? await createComplimentarySubscription(adminClient, restaurantData.id, complimentaryPeriod)
      : await createInitialSubscription(
          adminClient,
          restaurantData.id,
          subscriptionInterval ?? "monthly",
        );

    // Credentials are set by superadmin and shared out-of-band (e.g. WhatsApp).
    // Onboarding email has no password and no magic links (those land in spam).
    let emailSent = false;
    try {
      await sendRestaurantOnboardingEmail({
        to: email,
        businessName: name,
        businessTypeLabel: categoryLabel,
        publicUrl: hasCatalogDashboard(businessType) ? `${appUrl}/${slug}` : null,
        dashboardUrl: `${appUrl}/login`,
        subscriptionEndsAt: subscription.periodEnd,
        monthlyPrice: subscription.billingPrice,
        billingInterval: subscriptionInterval ?? undefined,
        lifetimeFree,
        complimentaryLabel: complimentaryPeriod
          ? complimentaryPeriodLabel(complimentaryPeriod)
          : undefined,
      });
      emailSent = true;
    } catch {
      emailSent = false;
    }

    revalidatePath("/dashboard/super-admin");
    if (!emailSent) {
      redirect("/dashboard/super-admin?success=restaurant_created_email_failed");
    }
    redirect("/dashboard/super-admin?success=restaurant_created");
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
  const browseValidated = validateBrowseSelectionFromForm(formData);
  if (!browseValidated.ok) {
    redirect(`/dashboard/super-admin?error=${encodeURIComponent(browseValidated.error)}`);
  }
  const browseSelection = browseValidated.selection;
  const browseSections = normalizeBrowseSections(browseSelection);
  if (browseSections.length === 0) return;
  const businessType = inferBusinessTypeFromBrowseSections(browseSections);
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("restaurants")
    .update({
      browse_sections: browseSelection,
      business_type: businessType,
      show_on_home: true,
    })
    .eq("id", id);
  revalidatePath("/dashboard/super-admin");
  revalidatePath("/");
}

export async function toggleRestaurantActiveAction(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id"));
  const isActive = String(formData.get("is_active")) === "true";

  if (isActive) {
    try {
      await deactivateRestaurantManually(id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "deactivate_failed";
      redirect(`/dashboard/super-admin?error=${encodeURIComponent(message)}`);
    }
  } else {
    const adminClient = getAdminClient();
    if (!adminClient) {
      redirect("/dashboard/super-admin?error=missing_service_role");
    }

    const sub = await getLatestSubscription(adminClient, id);
    const now = Date.now();
    const isPastDue = !sub?.next_due_at || new Date(sub.next_due_at).getTime() < now;

    if (!sub || isPastDue || sub.status === "overdue") {
      await renewRestaurantSubscription(adminClient, id);
    } else if (sub.status === "paused" || sub.status === "cancelled") {
      await adminClient
        .from("restaurant_subscriptions")
        .update({
          status: "active",
          ended_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sub.id);
    }

    await adminClient.from("restaurants").update({ is_active: true }).eq("id", id);
  }

  revalidatePath("/dashboard/super-admin");
  revalidatePath("/");
  revalidatePath("/dashboard/billing");
}

export async function grantComplimentaryBillingAction(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const removeComplimentary = String(formData.get("remove_complimentary") ?? "") === "true";
  if (!id) {
    redirect("/dashboard/super-admin?error=missing_restaurant_id");
  }

  const adminClient = getAdminClient();
  if (!adminClient) {
    redirect("/dashboard/super-admin?error=missing_service_role");
  }

  try {
    if (removeComplimentary) {
      await removeComplimentaryBilling(adminClient, id);
    } else {
      const period = parseComplimentaryPeriodFromForm(formData);
      await applyComplimentaryBilling(adminClient, id, period);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "complimentary_billing_update_failed";
    redirect(`/dashboard/super-admin?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/dashboard/super-admin");
  revalidatePath("/dashboard/billing");
  revalidatePath("/");
}

/** @deprecated Use grantComplimentaryBillingAction */
export async function toggleRestaurantBillingExemptAction(formData: FormData) {
  const billingExempt = String(formData.get("billing_exempt") ?? "") === "true";
  if (billingExempt) {
    formData.set("complimentary_unit", "lifetime");
    formData.set("complimentary_amount", "1");
    return grantComplimentaryBillingAction(formData);
  }
  formData.set("remove_complimentary", "true");
  return grantComplimentaryBillingAction(formData);
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
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    redirect("/dashboard/super-admin?error=missing_restaurant_id");
  }

  try {
    const adminClient = getAdminClient();
    const { data: restaurant, error: restaurantError } = await adminClient
      .from("restaurants")
      .select("id, name")
      .eq("id", id)
      .single();

    if (restaurantError || !restaurant) {
      redirect("/dashboard/super-admin?error=restaurant_not_found");
    }

    const renewal = await renewRestaurantSubscription(adminClient, id);
    await adminClient.from("restaurants").update({ is_active: true }).eq("id", id);

    const fallbackEmail = String(formData.get("admin_email") ?? "").trim().toLowerCase();
    const adminEmail =
      (await getRestaurantAdminEmail(adminClient, id)) ??
      (fallbackEmail || null);

    if (adminEmail) {
      try {
        await sendSubscriptionRenewalEmail({
          to: adminEmail,
          restaurantName: restaurant.name,
          adminEmail,
          periodStart: renewal.periodStart,
          periodEnd: renewal.periodEnd,
          monthlyPrice: renewal.billingPrice,
          billingInterval: "billingInterval" in renewal ? renewal.billingInterval : undefined,
        });
      } catch {
        revalidatePath("/dashboard/super-admin");
        redirect("/dashboard/super-admin?success=subscription_renewed_email_failed");
      }
    } else {
      revalidatePath("/dashboard/super-admin");
      redirect("/dashboard/super-admin?success=subscription_renewed_email_failed");
    }

    revalidatePath("/dashboard/super-admin");
    revalidatePath("/dashboard/billing");
    redirect("/dashboard/super-admin?success=subscription_renewed");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    const message = error instanceof Error ? error.message : "renew_failed";
    redirect(`/dashboard/super-admin?error=${encodeURIComponent(message)}`);
  }
}

export async function updateSubscriptionStatusAction(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const allowed = new Set(["trial", "active", "overdue", "paused", "cancelled"]);
  if (!id || !allowed.has(status)) {
    redirect("/dashboard/super-admin?error=invalid_subscription_update");
  }

  const supabase = await createServerSupabaseClient();
  const { data: subscription, error: loadError } = await supabase
    .from("restaurant_subscriptions")
    .select("restaurant_id")
    .eq("id", id)
    .maybeSingle();

  if (loadError || !subscription?.restaurant_id) {
    redirect("/dashboard/super-admin?error=invalid_subscription_update");
  }

  const nowIso = new Date().toISOString();
  const endedAt =
    status === "cancelled" || status === "paused" ? nowIso : null;

  const { error } = await supabase
    .from("restaurant_subscriptions")
    .update({ status, ended_at: endedAt, updated_at: nowIso })
    .eq("id", id);
  if (error) {
    redirect(`/dashboard/super-admin?error=${encodeURIComponent(error.message)}`);
  }

  if (status === "paused" || status === "cancelled") {
    const adminClient = getAdminClient();
    if (adminClient) {
      await adminClient
        .from("restaurants")
        .update({ is_active: false })
        .eq("id", subscription.restaurant_id);
    }
  }

  revalidatePath("/dashboard/super-admin");
  revalidatePath("/dashboard/billing");
  revalidatePath("/");
}

export async function setNextDueDateAction(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const nextDueAt = parseIsoDate(formData.get("next_due_at"));
  if (!id || !nextDueAt) {
    redirect("/dashboard/super-admin?error=invalid_due_date");
  }

  const adminClient = getAdminClient();
  if (!adminClient) {
    redirect("/dashboard/super-admin?error=missing_service_role");
  }

  const { data: subscription, error: loadError } = await adminClient
    .from("restaurant_subscriptions")
    .select("restaurant_id")
    .eq("id", id)
    .maybeSingle();

  if (loadError || !subscription?.restaurant_id) {
    redirect("/dashboard/super-admin?error=invalid_subscription_update");
  }

  const nowIso = new Date().toISOString();
  const isFutureDue = new Date(nextDueAt).getTime() >= Date.now();

  const subscriptionUpdate: {
    next_due_at: string;
    updated_at: string;
    status?: string;
    ended_at?: string | null;
  } = {
    next_due_at: nextDueAt,
    updated_at: nowIso,
  };
  if (isFutureDue) {
    subscriptionUpdate.status = "active";
    subscriptionUpdate.ended_at = null;
  }

  const { error } = await adminClient
    .from("restaurant_subscriptions")
    .update(subscriptionUpdate)
    .eq("id", id);
  if (error) {
    redirect(`/dashboard/super-admin?error=${encodeURIComponent(error.message)}`);
  }

  if (isFutureDue) {
    await adminClient
      .from("restaurants")
      .update({ is_active: true })
      .eq("id", subscription.restaurant_id);
  }

  revalidatePath("/dashboard/super-admin");
  revalidatePath("/dashboard/billing");
  revalidatePath("/");
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

export async function enableAddonAction(formData: FormData) {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "superadmin") {
    redirect("/dashboard/login");
  }
  const restaurantId = String(formData.get("restaurant_id") ?? "").trim();
  const addonKey = String(formData.get("addon_key") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;
  if (!restaurantId || !addonKey) {
    redirect("/dashboard/super-admin?error=missing_addon_fields");
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("restaurant_addons").upsert(
    {
      restaurant_id: restaurantId,
      addon_key: addonKey,
      is_enabled: true,
      enabled_at: new Date().toISOString(),
      enabled_by: appUser.id,
      notes,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "restaurant_id,addon_key" },
  );
  if (error) {
    redirect(`/dashboard/super-admin?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/dashboard/super-admin");
}

export async function disableAddonAction(formData: FormData) {
  await requireSuperAdmin();
  const restaurantId = String(formData.get("restaurant_id") ?? "").trim();
  const addonKey = String(formData.get("addon_key") ?? "").trim();
  if (!restaurantId || !addonKey) {
    redirect("/dashboard/super-admin?error=missing_addon_fields");
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("restaurant_addons")
    .update({ is_enabled: false, updated_at: new Date().toISOString() })
    .eq("restaurant_id", restaurantId)
    .eq("addon_key", addonKey);
  if (error) {
    redirect(`/dashboard/super-admin?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/dashboard/super-admin");
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

export async function togglePlatformUserBlockedAction(formData: FormData) {
  const appUser = await requireSuperAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const isBlocked = String(formData.get("is_blocked") ?? "") === "true";
  if (!id) redirect("/dashboard/super-admin?error=missing_user_id");
  if (id === appUser.id) redirect("/dashboard/super-admin?error=cannot_block_self");

  const adminClient = getAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(id, {
    ban_duration: isBlocked ? "none" : "876000h",
  });
  if (error) {
    redirect(`/dashboard/super-admin?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/super-admin");
  redirect(`/dashboard/super-admin?success=${isBlocked ? "user_unblocked" : "user_blocked"}`);
}

export async function deletePlatformUserAction(formData: FormData) {
  const appUser = await requireSuperAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/dashboard/super-admin?error=missing_user_id");
  if (id === appUser.id) redirect("/dashboard/super-admin?error=cannot_delete_self");

  const adminClient = getAdminClient();

  // Cleanup app-layer records first (best effort), then auth user.
  await adminClient.from("users").delete().eq("id", id);
  await adminClient.from("customer_profiles").delete().eq("id", id);
  await adminClient.from("customer_addresses").delete().eq("customer_id", id);

  const { error } = await adminClient.auth.admin.deleteUser(id);
  if (error) {
    redirect(`/dashboard/super-admin?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/super-admin");
  redirect("/dashboard/super-admin?success=user_deleted");
}

export async function setRestaurantAdminPasswordAction(formData: FormData) {
  await requireSuperAdmin();
  const restaurantId = String(formData.get("restaurant_id") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (!restaurantId) redirect("/dashboard/super-admin?error=missing_restaurant_id");
  if (!password) redirect("/dashboard/super-admin?error=missing_password");
  if (password.length < 8) redirect("/dashboard/super-admin?error=password_too_short");
  if (password !== confirmPassword) redirect("/dashboard/super-admin?error=password_mismatch");

  const adminClient = getAdminClient();
  const { data: adminUser } = await adminClient
    .from("users")
    .select("id")
    .eq("restaurant_id", restaurantId)
    .eq("role", "restaurant_admin")
    .maybeSingle();

  if (!adminUser?.id) {
    redirect("/dashboard/super-admin?error=no_restaurant_admin");
  }

  const { error } = await adminClient.auth.admin.updateUserById(adminUser.id, {
    password,
    email_confirm: true,
  });
  if (error) {
    redirect(`/dashboard/super-admin?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/super-admin");
  redirect("/dashboard/super-admin?success=restaurant_password_updated");
}

export async function setPlatformUserPasswordAction(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (!id) redirect("/dashboard/super-admin?error=missing_user_id");
  if (!password) redirect("/dashboard/super-admin?error=missing_password");
  if (password.length < 8) redirect("/dashboard/super-admin?error=password_too_short");
  if (password !== confirmPassword) redirect("/dashboard/super-admin?error=password_mismatch");

  const adminClient = getAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(id, {
    password,
    email_confirm: true,
  });
  if (error) {
    redirect(`/dashboard/super-admin?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/super-admin");
  redirect("/dashboard/super-admin?success=user_password_updated");
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
