import { ZBOUN_OPS_EMAIL, ZBOUN_WHATSAPP_DIGITS } from "@/lib/zboun-contact";

/** Public Zboun presence — used on visit kits, WhatsApp pitches, and contact. */
export const ZBOUN_PRESENCE = {
  siteHost: "zboun.net",
  siteUrl: "https://zboun.net",
  plansUrl: "https://zboun.net/for-restaurants",
  phoneDisplay: "+961 79 036 602",
  phoneTel: `+${ZBOUN_WHATSAPP_DIGITS}`,
  email: ZBOUN_OPS_EMAIL,
  whatsappQrUrl: "https://wa.me/96171212734",
  whatsappQrHost: "+961 79 036 602",
  instagramHost: "zbounnet",
  instagramUrl: "https://instagram.com/zbounnet",
  tiktokHost: "zbounnet",
  tiktokUrl: "https://tiktok.com/@zbounnet",
  youtubeHost: "zbounnet",
  youtubeUrl: "https://youtube.com/@zbounnet",
} as const;
