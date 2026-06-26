import type { MetadataRoute } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/for-restaurants`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/install`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];

  try {
    const supabase = await createServerSupabaseClient();
    const { data: restaurants } = await supabase
      .from("restaurants")
      .select("slug, created_at")
      .eq("is_active", true);

    const menuUrls: MetadataRoute.Sitemap =
      restaurants?.flatMap((r) => [
        {
          url: `${base}/${r.slug}`,
          lastModified: r.created_at ? new Date(r.created_at) : now,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        },
        {
          url: `${base}/${r.slug}/menu`,
          lastModified: r.created_at ? new Date(r.created_at) : now,
          changeFrequency: "weekly" as const,
          priority: 0.75,
        },
      ]) ?? [];

    return [...staticEntries, ...menuUrls];
  } catch {
    return staticEntries;
  }
}
