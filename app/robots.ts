import type { MetadataRoute } from "next";
import { AI_CRAWLER_USER_AGENTS, CRAWLER_DISALLOW_PREFIXES } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site";

const DISALLOW = [...CRAWLER_DISALLOW_PREFIXES];

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  const rules: MetadataRoute.Robots["rules"] = [
    {
      userAgent: "*",
      allow: "/",
      disallow: DISALLOW,
    },
    ...AI_CRAWLER_USER_AGENTS.map((userAgent) => ({
      userAgent,
      allow: "/",
      disallow: DISALLOW,
    })),
  ];

  return {
    rules,
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
