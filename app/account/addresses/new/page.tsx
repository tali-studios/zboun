import { redirect } from "next/navigation";
import Link from "next/link";
import { getCustomerSession } from "@/app-actions/customer-auth";
import { AddressForm } from "@/components/address-form";
import { CustomerMobileFooterNav } from "@/components/customer-mobile-footer-nav";
import { CustomerDesktopNav } from "@/components/customer-desktop-nav";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function NewAddressPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const session = await getCustomerSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-[#f2f2f7]">
      {/* Desktop nav */}
      <CustomerDesktopNav title="New Address" backHref="/account" />

      {/* Mobile-style top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200/60 bg-white/95 px-4 backdrop-blur md:hidden">
        <Link
          href="/account"
          className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-slate-100"
          aria-label="Back"
        >
          <svg className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </Link>
        <p className="text-[15px] font-semibold text-slate-900">New Address</p>
        <div className="w-9" aria-hidden />
      </header>

      <div className="mx-auto max-w-lg px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-5 md:py-10">
        <AddressForm duplicateNameError={error === "duplicate_name"} />
      </div>
      <CustomerMobileFooterNav />
    </div>
  );
}
