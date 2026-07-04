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
    ? "btn rounded-full bg-white text-violet-700 shadow-sm hover:bg-violet-50"
    : "btn rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20";
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

  return (
    <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 via-violet-600 to-fuchsia-600 p-5 text-white shadow-lg shadow-violet-600/30 md:p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl"
      />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-violet-200">{STORE_ADMIN_LABEL}</p>
          <h1 className="mt-1 text-xl font-bold md:text-2xl">{displayTitle}</h1>
          {displaySubtitle ? (
            <p className="mt-0.5 text-xs text-violet-200 md:text-sm">{displaySubtitle}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {isMenuBusiness && menuUrl ? (
            <>
              <Link
                href={menuUrl}
                target="_blank"
                rel="noreferrer"
                className="btn rounded-full border border-emerald-300/60 bg-emerald-500 text-white shadow-sm hover:bg-emerald-400"
              >
                {storefrontLabels.open}
              </Link>
              <CopyMenuLinkButton url={menuUrl} label={storefrontLabels.copyLink} />
              <Link href="/dashboard/business" className={navClass(currentPage === "dashboard")}>
                Store settings
              </Link>
              <Link href="/dashboard/business/orders" className={navClass(currentPage === "orders")}>
                Orders
              </Link>
              {driverManagementEnabled ? (
                <Link href="/dashboard/business/drivers" className={navClass(currentPage === "drivers")}>
                  Drivers
                </Link>
              ) : null}
              <Link href="/dashboard/business/qr" className={navClass(currentPage === "qr")}>
                QR codes
              </Link>
              <Link href="/dashboard/business/flyer" className={navClass(currentPage === "flyer")}>
                Print flyer
              </Link>
              <Link href="/dashboard/business/menu-items" className={navClass(currentPage === "menu-items")}>
                Menu items
              </Link>
            </>
          ) : null}
          <Link href="/dashboard/billing" className={navClass(currentPage === "billing")}>
            Billing
          </Link>
          <Link href="/dashboard/change-password" className={navClass(currentPage === "password")}>
            Password
          </Link>
          <form action={signOutAction} className="w-full sm:w-auto">
            <button
              type="submit"
              className="btn w-full rounded-full border border-rose-400/50 bg-rose-600 text-white shadow-sm hover:border-rose-300/60 hover:bg-rose-500 sm:w-auto"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
