import { env } from "@/lib/env";

/** Canonical origin for links and metadata (no trailing slash). */
export function getSiteUrl(): string {
  return env.appUrl;
}

export function getMetadataBase(): URL {
  return new URL(`${getSiteUrl()}/`);
}
