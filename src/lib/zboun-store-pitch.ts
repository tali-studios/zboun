import { ZBOUN_PRICING, formatPricingSummary, yearlySavings } from "@/lib/pricing";
import { ZBOUN_PRESENCE } from "@/lib/zboun-presence";

export const ZBOUN_STORE_PITCH_BENEFITS = [
  "Your own website & web app — customized to your brand, no app download needed",
  "Keep 100% of every order — flat subscription, zero commission",
  "Orders arrive on WhatsApp as a clean, complete message",
  "Customers browse, filter, and order from their phone in seconds",
  "Real-time stock tracking — items auto-hide when sold out",
  "Promo codes & coupons to run campaigns and reward loyal customers",
  "QR codes + printable flyer for the counter, door, and bags",
  "Optional listing on the Zboun home page so new customers find you",
] as const;

export const ZBOUN_STORE_PITCH_FEATURES = [
  { title: "Your own website", body: "A branded page at zboun.net/yourstore — works like a web app on any phone." },
  { title: "WhatsApp orders", body: "Structured cart → one message with items, address, and notes." },
  { title: "Stock & alerts", body: "Track inventory per item. Low-stock email alerts. Auto-hide when out." },
  { title: "Promo codes", body: "Create discount codes for campaigns, influencers, or loyal customers." },
  { title: "Delivery zones", body: "Set delivery radius, fees, and offer standard or fast delivery." },
  { title: "Scheduled orders", body: "Customers can schedule delivery for a specific day and time." },
  { title: "Dashboard", body: "Catalog, hours, delivery, sales, coupons, ratings, and share tools." },
  { title: "Customer ratings", body: "Customers rate after delivery — builds trust for new visitors." },
  { title: "QR + flyer", body: "Online-order QR and in-store browse QR, plus an A4 flyer." },
  { title: "Share pack", body: "One tap to copy your link and post on WhatsApp or Instagram." },
  { title: "Custom theme", body: "Pick your brand color — your store page matches your identity." },
  { title: "Support", body: "We set up your catalog for you if you send the list and photos." },
] as const;

export function buildStoreVisitWhatsAppMessage() {
  const p = ZBOUN_PRESENCE;
  const benefits = ZBOUN_STORE_PITCH_BENEFITS.map((line) => `• ${line}`).join("\n");
  const features = ZBOUN_STORE_PITCH_FEATURES.map((item) => `• ${item.title} — ${item.body}`).join("\n");

  return [
    "Hi! This is Zboun — your own website & online store, built for shops in Lebanon.",
    "",
    "You get your own branded website (zboun.net/yourstore) that works like a web app on any phone. Customers browse, add to cart, and send a clean order straight to your WhatsApp. You keep 100% of every sale — zero commission.",
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
