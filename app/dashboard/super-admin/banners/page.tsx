import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  SuperAdminHomeBannersPanel,
  type HomeBannerMenuItemOption,
  type HomeBannerRestaurantOption,
} from "@/components/super-admin-home-banners-panel";
import { SuperAdminHeader, SuperAdminShell } from "@/components/super-admin-chrome";
import { getCurrentUserRole } from "@/lib/data";
import { env } from "@/lib/env";
import { listAllHomeHeroSlides, type HomeHeroSlideRow } from "@/lib/home-hero-slides";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function SuperAdminHomeBannersPage({ searchParams }: Props) {
  const { success, error } = await searchParams;
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "superadmin") {
    redirect("/dashboard/login");
  }

  const supabase = await createServerSupabaseClient();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const dataClient =
    env.supabaseUrl && serviceRoleKey
      ? createClient(env.supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      : supabase;

  const [slides, restaurantsResult, menuItemsResult] = await Promise.all([
    listAllHomeHeroSlides(dataClient),
    dataClient
      .from("restaurants")
      .select("id, name, slug")
      .order("name", { ascending: true }),
    dataClient
      .from("menu_items")
      .select("id, name, restaurant_id")
      .order("name", { ascending: true }),
  ]);

  const restaurants = (restaurantsResult.data ?? []) as HomeBannerRestaurantOption[];
  const menuItems = (menuItemsResult.data ?? []) as HomeBannerMenuItemOption[];

  return (
    <SuperAdminShell>
      <SuperAdminHeader
        title="Home banners"
        subtitle="Control the home-page promo carousel — welcome new stores or promote paid placements."
      />

      <SuperAdminHomeBannersPanel
        slides={slides as HomeHeroSlideRow[]}
        restaurants={restaurants}
        menuItems={menuItems}
        success={success}
        error={error}
      />
    </SuperAdminShell>
  );
}
