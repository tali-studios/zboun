export type SocialPlatform = "instagram" | "tiktok" | "facebook" | "twitter" | "youtube";

export type SocialLinks = {
  instagram_url: string | null;
  tiktok_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
};

export const SOCIAL_PLATFORMS: {
  id: SocialPlatform;
  field: keyof SocialLinks;
  label: string;
  placeholder: string;
}[] = [
  {
    id: "instagram",
    field: "instagram_url",
    label: "Instagram",
    placeholder: "https://instagram.com/yourstore or @yourstore",
  },
  {
    id: "tiktok",
    field: "tiktok_url",
    label: "TikTok",
    placeholder: "https://tiktok.com/@yourstore or @yourstore",
  },
  {
    id: "facebook",
    field: "facebook_url",
    label: "Facebook",
    placeholder: "https://facebook.com/yourstore",
  },
  {
    id: "twitter",
    field: "twitter_url",
    label: "X (Twitter)",
    placeholder: "https://x.com/yourstore or @yourstore",
  },
  {
    id: "youtube",
    field: "youtube_url",
    label: "YouTube",
    placeholder: "https://youtube.com/@yourstore or @yourstore",
  },
];

const HOSTS: Record<SocialPlatform, string[]> = {
  instagram: ["instagram.com", "www.instagram.com", "m.instagram.com", "instagr.am"],
  tiktok: ["tiktok.com", "www.tiktok.com", "m.tiktok.com", "vm.tiktok.com"],
  facebook: ["facebook.com", "www.facebook.com", "m.facebook.com", "fb.com", "www.fb.com", "fb.me"],
  twitter: ["twitter.com", "www.twitter.com", "mobile.twitter.com", "x.com", "www.x.com"],
  youtube: ["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be"],
};

function isLikelyHandle(raw: string): boolean {
  const handle = raw.trim().replace(/^@/, "");
  return /^[a-zA-Z0-9._]{2,64}$/.test(handle) && !handle.includes("..");
}

function tryParseHttpUrl(raw: string): URL | null {
  let value = raw.trim();
  if (!value) return null;
  if (!/^https?:\/\//i.test(value)) {
    value = `https://${value}`;
  }
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url;
  } catch {
    return null;
  }
}

function hostMatches(hostname: string, allowed: string[]): boolean {
  const host = hostname.toLowerCase();
  return allowed.some((allowedHost) => host === allowedHost || host.endsWith(`.${allowedHost}`));
}

function normalizeHttps(url: URL): string {
  url.protocol = "https:";
  // Drop tracking noise commonly pasted from shares.
  url.hash = "";
  ["fbclid", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((key) => {
    url.searchParams.delete(key);
  });
  const href = url.toString();
  return href.endsWith("/") && url.pathname === "/" ? href.slice(0, -1) : href.replace(/\/$/, "");
}

function urlFromHandle(platform: SocialPlatform, raw: string): string {
  const handle = raw.trim().replace(/^@/, "");
  switch (platform) {
    case "instagram":
      return `https://www.instagram.com/${handle}`;
    case "tiktok":
      return `https://www.tiktok.com/@${handle}`;
    case "twitter":
      return `https://x.com/${handle}`;
    case "youtube":
      return `https://www.youtube.com/@${handle}`;
    case "facebook":
      return `https://www.facebook.com/${handle}`;
  }
}

/**
 * Empty → null. Otherwise normalize to an HTTPS URL for the given platform, or error.
 */
export function parseSocialLink(
  platform: SocialPlatform,
  raw: unknown,
): { ok: true; url: string | null } | { ok: false; message: string } {
  const input = String(raw ?? "").trim();
  if (!input) return { ok: true, url: null };

  const label = SOCIAL_PLATFORMS.find((p) => p.id === platform)?.label ?? platform;

  if (isLikelyHandle(input) && !input.includes("/") && !/\s/.test(input)) {
    // Facebook pages are often multi-word brand URLs — still allow simple page slugs as handles.
    return { ok: true, url: urlFromHandle(platform, input) };
  }

  const parsed = tryParseHttpUrl(input);
  if (!parsed) {
    return {
      ok: false,
      message: `${label}: enter a full ${label} link, or an @username.`,
    };
  }

  if (!hostMatches(parsed.hostname, HOSTS[platform])) {
    return {
      ok: false,
      message: `${label}: that doesn’t look like the right platform. Paste a ${label} URL or @username.`,
    };
  }

  if (parsed.pathname === "/" && !parsed.search) {
    return {
      ok: false,
      message: `${label}: include your profile or page path (or paste @username).`,
    };
  }

  return { ok: true, url: normalizeHttps(parsed) };
}

export function parseSocialLinksFromForm(formData: FormData):
  | { ok: true; links: SocialLinks }
  | { ok: false; message: string } {
  const links = emptySocialLinks();
  for (const platform of SOCIAL_PLATFORMS) {
    const parsed = parseSocialLink(platform.id, formData.get(platform.field));
    if (!parsed.ok) return parsed;
    links[platform.field] = parsed.url;
  }
  return { ok: true, links };
}

export function emptySocialLinks(): SocialLinks {
  return {
    instagram_url: null,
    tiktok_url: null,
    facebook_url: null,
    twitter_url: null,
    youtube_url: null,
  };
}

export function pickSocialLinks(row: Partial<SocialLinks> | null | undefined): SocialLinks {
  return {
    instagram_url: row?.instagram_url?.trim() || null,
    tiktok_url: row?.tiktok_url?.trim() || null,
    facebook_url: row?.facebook_url?.trim() || null,
    twitter_url: row?.twitter_url?.trim() || null,
    youtube_url: row?.youtube_url?.trim() || null,
  };
}

/** Configured links only — for public UI / JSON-LD. */
export function listConfiguredSocialLinks(links: Partial<SocialLinks> | null | undefined): {
  id: SocialPlatform;
  label: string;
  url: string;
}[] {
  const picked = pickSocialLinks(links);
  return SOCIAL_PLATFORMS.flatMap((platform) => {
    const url = picked[platform.field];
    return url ? [{ id: platform.id, label: platform.label, url }] : [];
  });
}

export const SOCIAL_SELECT_COLUMNS =
  "instagram_url, tiktok_url, facebook_url, twitter_url, youtube_url";

export function socialColumnsMissing(message: string | null | undefined): boolean {
  return /(instagram_url|tiktok_url|facebook_url|twitter_url|youtube_url)/i.test(message ?? "");
}
