import { NextResponse } from "next/server";
import { contractPdfFilename, generateContractPdfBuffer } from "@/lib/contract-pdf";
import { getCurrentUserRole } from "@/lib/data";
import { inferSubscriptionInterval } from "@/lib/pricing";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServerSupabaseClient();
  const [{ data: restaurant }, { data: subscription }] = await Promise.all([
    supabase.from("restaurants").select("name").eq("id", appUser.restaurant_id).single(),
    supabase
      .from("restaurant_subscriptions")
      .select("start_at, next_due_at, billing_cycle_price")
      .eq("restaurant_id", appUser.restaurant_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const restaurantName = restaurant?.name?.trim() || "Restaurant";
  const effectiveDate = subscription?.start_at
    ? new Date(subscription.start_at)
    : new Date();
  const subscriptionEndDate = subscription?.next_due_at
    ? new Date(subscription.next_due_at)
    : new Date(effectiveDate.getTime() + 30 * 24 * 60 * 60 * 1000);

  const billingPrice = subscription?.billing_cycle_price
    ? Number(subscription.billing_cycle_price)
    : undefined;

  const pdf = await generateContractPdfBuffer({
    restaurantName,
    adminEmail: appUser.email ?? "",
    effectiveDate,
    subscriptionEndDate,
    monthlyPrice: billingPrice,
    billingInterval: billingPrice !== undefined
      ? inferSubscriptionInterval(billingPrice)
      : undefined,
  });

  const filename = contractPdfFilename(restaurantName);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
