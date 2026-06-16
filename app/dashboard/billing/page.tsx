import { redirect } from "next/navigation";
import { BusinessBillingPanel } from "@/components/business-billing-panel";
import { getCurrentUserRole } from "@/lib/data";
import { getOpsEmail } from "@/lib/mail";
import { enforceSubscriptionExpiryForRestaurant } from "@/lib/subscription-lifecycle";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Billing is outside the business layout so deactivated admins can still view status. */
export default async function RestaurantBillingPage() {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) {
    redirect("/dashboard/login");
  }

  const restaurantId = appUser.restaurant_id;
  await enforceSubscriptionExpiryForRestaurant(restaurantId);

  const supabase = await createServerSupabaseClient();

  const [{ data: restaurant }, { data: subscription }, { data: invoices }] = await Promise.all([
    supabase.from("restaurants").select("name, is_active, billing_exempt").eq("id", restaurantId).single(),
    supabase
      .from("restaurant_subscriptions")
      .select("status, next_due_at, billing_cycle_price, start_at, ended_at, created_at")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("invoices")
      .select(
        "id, period_start, period_end, amount_due, amount_paid, status, due_at, created_at",
      )
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })
      .limit(24),
  ]);

  return (
    <main className="min-h-screen bg-[#f8f8ff] px-3 py-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <BusinessBillingPanel
          restaurantName={restaurant?.name ?? "Your business"}
          isActive={restaurant?.is_active ?? false}
          billingExempt={restaurant?.billing_exempt ?? false}
          subscription={subscription ?? null}
          invoices={invoices ?? []}
          opsEmail={getOpsEmail()}
        />
      </div>
    </main>
  );
}
