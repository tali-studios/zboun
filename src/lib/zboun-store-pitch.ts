import { ZBOUN_PRICING, formatPricingSummary, yearlySavings } from "@/lib/pricing";
import { ZBOUN_PRESENCE } from "@/lib/zboun-presence";

export const ZBOUN_STORE_PITCH_BENEFITS = [
  "Keep 100% of every order — flat subscription, zero commission",
  "Your own branded page at zboun.net/yourstore",
  "Customers browse on their phone — no extra app to download",
  "Orders arrive on WhatsApp as a clean, complete message",
  "Update prices, photos, stock, and hours anytime",
  "QR codes + printable flyer for the counter, door, and bags",
  "Optional listing on the Zboun home page so new customers find you",
] as const;

export const ZBOUN_STORE_PITCH_FEATURES = [
  { title: "Digital storefront", body: "Sections, photos, prices, sizes, brands, and stock." },
  { title: "WhatsApp orders", body: "Structured cart → one message with items, address, and notes." },
  { title: "QR + flyer", body: "Online-order QR and in-store browse QR, plus an A4 flyer." },
  { title: "Dashboard", body: "Catalog, hours, delivery, sales, coupons, and share tools." },
  { title: "Share pack", body: "One tap to copy your link and post on WhatsApp or Instagram." },
  { title: "Support", body: "We can set up your catalog for you if you send the list and photos." },
] as const;

export function buildStoreVisitWhatsAppMessage() {
  const p = ZBOUN_PRESENCE;
  const benefits = ZBOUN_STORE_PITCH_BENEFITS.map((line) => `• ${line}`).join("\n");
  const features = ZBOUN_STORE_PITCH_FEATURES.map((item) => `• ${item.title} — ${item.body}`).join("\n");

  return [
    "Hi! This is Zboun — digital storefronts & WhatsApp ordering for shops in Lebanon.",
    "",
    "You get your own page (zboun.net/yourstore). Customers browse on their phone and send a clean order to your WhatsApp. You keep 100% of every sale.",
    "",
    `Plans: ${formatPricingSummary()} (save $${yearlySavings()} on yearly). Optional catalog setup: $${ZBOUN_PRICING.oneTimeDataEntry} one-time.`,
    "",
    "Why stores join",
    benefits,
    "",
    "What's included",
    features,
    "",
    "Talk to us",
    `🌍 Website: ${p.siteHost}`,
    `📱 Phone: ${p.phoneDisplay}`,
    `💬 WhatsApp: ${p.whatsappQrHost}`,
    `📷 Instagram: ${p.instagramHost}`,
    `🎵 TikTok: ${p.tiktokHost}`,
    `▶️ YouTube: ${p.youtubeHost}`,
    "",
    `Plans & details: ${p.plansUrl}`,
  ].join("\n");
}

export function buildStoreVisitWhatsAppHref() {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(buildStoreVisitWhatsAppMessage())}`;
}
