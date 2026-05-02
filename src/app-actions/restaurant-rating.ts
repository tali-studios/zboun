"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { env } from "@/lib/env";

function getServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!env.supabaseUrl || !key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or Supabase URL.");
  }
  return createClient(env.supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function submitRestaurantRatingAction(formData: FormData) {
  const restaurantId = String(formData.get("restaurant_id") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const raterId = String(formData.get("rater_id") ?? "").trim();
  const ratingRaw = Number(formData.get("rating"));

  if (!UUID_RE.test(restaurantId) || !UUID_RE.test(raterId)) {
    return { ok: false as const, error: "invalid_ids" };
  }
  if (!Number.isFinite(ratingRaw) || ratingRaw < 1 || ratingRaw > 5) {
    return { ok: false as const, error: "invalid_rating" };
  }
  const rating = Math.round(ratingRaw);

  try {
    const supabase = getServiceClient();
    const { error } = await supabase.from("restaurant_ratings").upsert(
      {
        restaurant_id: restaurantId,
        rater_id: raterId,
        rating,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "restaurant_id,rater_id" },
    );
    if (error) {
      return { ok: false as const, error: error.message };
    }
  } catch {
    return { ok: false as const, error: "server_error" };
  }

  revalidatePath("/");
  if (slug) {
    revalidatePath(`/${slug}`);
  }
  return { ok: true as const };
}

export async function getMyRestaurantRatingAction(restaurantId: string, raterId: string) {
  if (!UUID_RE.test(restaurantId) || !UUID_RE.test(raterId)) {
    return null;
  }
  try {
    const supabase = getServiceClient();
    const { data } = await supabase
      .from("restaurant_ratings")
      .select("rating")
      .eq("restaurant_id", restaurantId)
      .eq("rater_id", raterId)
      .maybeSingle();
    const n = data?.rating != null ? Number(data.rating) : null;
    return n != null && Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}
