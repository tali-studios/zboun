import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/** Redirect restaurant admins when their business subscription is deactivated. */
export async function requireActiveRestaurant(restaurantId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("is_active, name")
    .eq("id", restaurantId)
    .maybeSingle();

  if (restaurant && !restaurant.is_active) {
    redirect("/dashboard/login?error=account_deactivated");
  }
}
