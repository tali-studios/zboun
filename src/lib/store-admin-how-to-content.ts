/**
 * Store admin “How To” guide — video + per-page explanations.
 * Copy is written for merchant-facing English UI (no i18n framework in this app).
 */

export const STORE_ADMIN_HOW_TO_VIDEO = {
  youtubeId: "Be8LUhoQrW4",
  title: "Store Owner Admin Portal – Complete Guide & Feature Walkthrough",
  watchUrl: "https://youtu.be/Be8LUhoQrW4",
  embedUrl: "https://www.youtube.com/embed/Be8LUhoQrW4",
} as const;

export type StoreAdminHowToSection = {
  id: string;
  href: string;
  title: string;
  summary: string;
  benefits: string[];
};

type HowToCopyOptions = {
  /** “Menu” for food-like businesses, “Catalog” for retail-style stores. */
  itemsNav: string;
  /** Lowercase noun used in sentences: “menu” | “store”. */
  storefrontNoun: "menu" | "store";
};

export function getStoreAdminHowToSections({
  itemsNav,
  storefrontNoun,
}: HowToCopyOptions): StoreAdminHowToSection[] {
  const noun = storefrontNoun;
  const itemsLabel = itemsNav;

  return [
    {
      id: "settings",
      href: "/dashboard/business",
      title: "Settings",
      summary: `Your store identity hub — name, logo, theme, locations, delivery fees, and social links that appear on your public ${noun}.`,
      benefits: [
        "Keep brand details accurate so customers trust what they see before ordering",
        "Set delivery fees and locations once; they apply across checkout and order flow",
        "Match your online look to your brand with themes and profile images",
      ],
    },
    {
      id: "orders",
      href: "/dashboard/business/orders",
      title: "Orders",
      summary:
        "Live order board where new WhatsApp-ready orders land — review items, status, delivery details, and keep fulfilment moving.",
      benefits: [
        "See every order in one place instead of hunting through chat threads",
        "Update status and ETAs so your team and customers stay aligned",
        "Reduce mistakes with structured carts, notes, and delivery information",
      ],
    },
    {
      id: "drivers",
      href: "/dashboard/business/drivers",
      title: "Drivers",
      summary:
        "Optional delivery roster: create drivers, assign orders, and track who is handling each drop-off.",
      benefits: [
        "Assign orders clearly when you run your own delivery fleet",
        "Track delivery counts and workload across your drivers",
        "Keep fulfilment accountability without leaving the dashboard",
      ],
    },
    {
      id: "menu-items",
      href: "/dashboard/business/menu-items",
      title: itemsLabel,
      summary: `Build and maintain what customers browse — sections, brands, photos, prices, stock, and item details for your live ${noun}.`,
      benefits: [
        "Publish updates instantly without reprinting paper menus or PDFs",
        "Control availability and stock so customers only order what you can fulfil",
        "Organize by section and brand for faster browsing on mobile",
      ],
    },
    {
      id: "sales",
      href: "/dashboard/business/sales",
      title: "Sales",
      summary:
        "Run percentage-off promotions on the whole store, a section, a brand, or selected items — visible on your storefront.",
      benefits: [
        "Move inventory or highlight bestsellers with timed discounts",
        "Target promotions precisely instead of discounting everything",
        "Drive urgency and repeat visits with clear sale pricing",
      ],
    },
    {
      id: "coupons",
      href: "/dashboard/business/coupons",
      title: "Coupons",
      summary:
        "Create shareable promo codes customers enter at checkout — ideal for campaigns, influencers, and loyalty rewards.",
      benefits: [
        "Reward returning customers and track campaign-specific codes",
        "Share codes on WhatsApp, Instagram, or in-store without changing base prices",
        "Control validity and usage so promotions stay profitable",
      ],
    },
    {
      id: "hours",
      href: "/dashboard/business/hours",
      title: "Hours",
      summary:
        "Define when customers can schedule delivery, and mark emergency closed days when you need to pause ordering.",
      benefits: [
        "Prevent orders outside the hours your kitchen or shop can fulfil",
        "Communicate temporary closures without taking your whole page offline",
        "Set expectations clearly before checkout",
      ],
    },
    {
      id: "share",
      href: "/dashboard/business/share",
      title: "Share",
      summary: `Ready-to-paste links and captions for WhatsApp, Instagram, and your public ${noun} URL.`,
      benefits: [
        "Promote your store in seconds with copy that already includes your link",
        "Keep messaging consistent across social channels",
        "Turn one share into more orders without designing creatives from scratch",
      ],
    },
    {
      id: "qr",
      href: "/dashboard/business/qr",
      title: "QR",
      summary: `Generate QR codes that open your ${noun} — for tables, counters, packaging, or storefront windows.`,
      benefits: [
        "Let guests open your live catalog with a camera scan — no app install",
        "Bridge offline spaces (tables, bags, posters) to online ordering",
        "Update products digitally while the same QR keeps working",
      ],
    },
    {
      id: "flyer",
      href: "/dashboard/business/flyer",
      title: "Flyer",
      summary: "Download or print an A4 flyer with your store QR so you can promote offline with a professional handout.",
      benefits: [
        "Leave print-ready material with partners, buildings, and events",
        "Pair your brand name with a scannable path to order",
        "Scale local discovery beyond social media alone",
      ],
    },
    {
      id: "billing",
      href: "/dashboard/billing",
      title: "Billing",
      summary: "Manage your Zboun subscription and invoices for the store account.",
      benefits: [
        "See plan status and keep your storefront active",
        "Access invoices when you need them for accounting",
        "Resolve billing questions from one place in the portal",
      ],
    },
    {
      id: "password",
      href: "/dashboard/change-password",
      title: "Password",
      summary: "Update the password used to sign in to your store admin dashboard.",
      benefits: [
        "Protect orders, pricing, and customer data with a strong login",
        "Rotate credentials if a device is lost or staff changes",
        "Keep access limited to people you trust",
      ],
    },
  ];
}
