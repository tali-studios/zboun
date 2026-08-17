import {
  getRestaurantSubdomainStoreUrl,
  toAbsoluteStoreUrl,
} from "@/lib/restaurant-menu-urls";

export function getStoreShareLinks(appUrl: string, slug: string) {
  const host = getRestaurantSubdomainStoreUrl(appUrl, slug);
  const absoluteUrl = toAbsoluteStoreUrl(host);
  const displayUrl = host.replace(/^https?:\/\//i, "");
  return { displayUrl, absoluteUrl };
}

export function buildWhatsAppStoreShareText(storeName: string, url: string) {
  const name = storeName.trim() || "our store";
  return `Order from ${name} on Zboun\n${url}`;
}

export function buildInstagramStoreShareCaption(storeName: string, url: string) {
  const name = storeName.trim() || "our store";
  return `${name}\nOrder on Zboun — paste this link in your bio or story\n${url}`;
}

export function buildWhatsAppStoreShareHref(storeName: string, url: string) {
  const text = buildWhatsAppStoreShareText(storeName, url);
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}
