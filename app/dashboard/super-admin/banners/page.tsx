import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  SuperAdminHomeBannersPanel,
  type HomeBannerMenuItemOption,
  type HomeBannerRestaurantOption,
} from "@/components/super-admin-home-banners-panel";
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
    <main className="min-h-screen overflow-x-hidden bg-[#f8f8ff] px-3 py-4 sm:p-8">
      <div className="mx-auto w-full min-w-0 max-w-5xl space-y-5">
        <header className="panel p-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600">
            Super admin
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Home banners</h1>
          <p className="mt-1 text-sm text-slate-600">
            Control the home-page promo carousel — welcome new stores or promote paid placements.
          </p>
          <Link
            href="/dashboard/super-admin"
            className="mt-3 inline-flex text-sm font-semibold text-violet-700 hover:text-violet-900"
          >
            ← Back to super admin
          </Link>
        </header>

        <SuperAdminHomeBannersPanel
          slides={slides as HomeHeroSlideRow[]}
          restaurants={restaurants}
          menuItems={menuItems}
          success={success}
          error={error}
        />
      </div>
    </main>
  );
}
