import Link from "next/link";
import { signOutAction } from "@/app-actions/auth";
import { CopyMenuLinkButton } from "@/components/copy-menu-link-button";
import { getStorefrontActionLabels, STORE_ADMIN_LABEL } from "@/lib/browse-sections";

export type StoreAdminNavPage =
  | "dashboard"
  | "orders"
  | "drivers"
  | "qr"
  | "flyer"
  | "menu-items"
  | "sales"
  | "billing"
  | "password";

type Props = {
  restaurantName: string;
  categoryLabel?: string;
  slug?: string;
  browseSections?: unknown;
  menuUrl?: string;
  isMenuBusiness?: boolean;
  driverManagementEnabled?: boolean;
  currentPage?: StoreAdminNavPage;
  title?: string;
  subtitle?: string;
};

function navClass(current: boolean) {
  return current
    ? "shrink-0 rounded-full bg-white px-2.5 py-1.5 text-xs font-semibold text-violet-700 shadow-sm hover:bg-violet-50"
    : "shrink-0 rounded-full border border-white/30 bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-white/20";
}

function actionClass(tone: "green" | "red") {
  if (tone === "green") {
    return "shrink-0 rounded-full border border-emerald-300/60 bg-emerald-500 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-400";
  }
  return "shrink-0 rounded-full border border-rose-400/50 bg-rose-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-500";
}

export function StoreAdminHeader({
  restaurantName,
  categoryLabel,
  slug,
  browseSections,
  menuUrl,
  isMenuBusiness = true,
  driverManagementEnabled = false,
  currentPage = "dashboard",
  title,
  subtitle,
}: Props) {
  const storefrontLabels = getStorefrontActionLabels(browseSections);
  const displayTitle = title ?? restaurantName;
  const displaySubtitle =
    subtitle ??
    (categoryLabel && slug
      ? `${categoryLabel} · ${storefrontLabels.slugLabel}: /${slug}`
      : categoryLabel);
  const openStoreHref =
    menuUrl && !/^https?:\/\//i.test(menuUrl) ? `https://${menuUrl}` : menuUrl;

  return (
    <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 via-violet-600 to-fuchsia-600 p-4 text-white shadow-lg shadow-violet-600/30 md:p-5">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl"
      />

      <div className="relative">
        <p className="text-[11px] font-bold uppercase tracking-widest text-violet-200">{STORE_ADMIN_LABEL}</p>
        <h1 className="mt-1 text-xl font-bold md:text-2xl">{displayTitle}</h1>
        {displaySubtitle ? (
          <p className="mt-0.5 text-xs text-violet-200 md:text-sm">{displaySubtitle}</p>
        ) : null}

        <nav
          aria-label="Store admin"
          className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {isMenuBusiness && menuUrl ? (
            <>
              <a
                href={openStoreHref}
                target="_blank"
                rel="noreferrer"
                className={actionClass("green")}
              >
                Open
              </a>
              <CopyMenuLinkButton
                url={menuUrl}
                label="Copy link"
                className="shrink-0 rounded-full border px-2.5 py-1.5 text-xs font-semibold shadow-sm transition"
              />
              <Link href="/dashboard/business" className={navClass(currentPage === "dashboard")}>
                Settings
              </Link>
              <Link href="/dashboard/business/orders" className={navClass(currentPage === "orders")}>
                Orders
              </Link>
              {driverManagementEnabled ? (
                <Link href="/dashboard/business/drivers" className={navClass(currentPage === "drivers")}>
                  Drivers
                </Link>
              ) : null}
              <Link href="/dashboard/business/menu-items" className={navClass(currentPage === "menu-items")}>
                Menu
              </Link>
              <Link href="/dashboard/business/sales" className={navClass(currentPage === "sales")}>
                Sales
              </Link>
              <Link href="/dashboard/business/qr" className={navClass(currentPage === "qr")}>
                QR
              </Link>
              <Link href="/dashboard/business/flyer" className={navClass(currentPage === "flyer")}>
                Flyer
              </Link>
            </>
          ) : null}
          <Link href="/dashboard/billing" className={navClass(currentPage === "billing")}>
            Billing
          </Link>
          <Link href="/dashboard/change-password" className={navClass(currentPage === "password")}>
            Password
          </Link>
          <form action={signOutAction} className="shrink-0">
            <button type="submit" className={actionClass("red")}>
              Sign out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
