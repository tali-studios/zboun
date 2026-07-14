/**
 * Public site origin for customer-facing / email links.
 * Never returns localhost — emails must always point at production.
 */
export function getPublicAppUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL?.trim(),
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim()}`
      : "",
    "https://zboun.net",
  ];

  for (const raw of candidates) {
    if (!raw) continue;
    const url = raw.replace(/\/+$/, "");
    if (/localhost|127\.0\.0\.1/i.test(url)) continue;
    try {
      // Validate
      new URL(url);
      return url;
    } catch {
      continue;
    }
  }

  return "https://zboun.net";
}

export function getSetPasswordRedirectUrl(): string {
  return `${getPublicAppUrl()}/auth/set-password`;
}

/**
 * Supabase sometimes embeds Site URL (often localhost) into action_link redirect_to.
 * Force the production set-password URL onto the recovery/invite link.
 */
export function withProductionSetPasswordRedirect(actionLink: string): string {
  const redirectTo = getSetPasswordRedirectUrl();
  try {
    const url = new URL(actionLink);
    url.searchParams.set("redirect_to", redirectTo);
    return url.toString();
  } catch {
    return actionLink;
  }
}
