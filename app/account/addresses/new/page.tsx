import { redirect } from "next/navigation";
import { getCustomerSession } from "@/app-actions/customer-auth";
import { AddressForm } from "@/components/address-form";
import { CustomerMobileFooterNav } from "@/components/customer-mobile-footer-nav";
import { CustomerDesktopNav } from "@/components/customer-desktop-nav";
import { CustomerMobileTopBar } from "@/components/customer-mobile-top-bar";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function NewAddressPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const session = await getCustomerSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-[#f2f2f7]">
      <CustomerDesktopNav title="New Address" backHref="/account" />

      <CustomerMobileTopBar title="New Address" backHref="/account" />

      <div className="mx-auto w-full max-w-none px-2 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-3 sm:max-w-2xl sm:px-4 sm:pt-5 md:max-w-3xl md:py-10">
        <AddressForm
          duplicateNameError={error === "duplicate_name"}
          missingPhoneError={error === "missing_phone"}
        />
      </div>
      <CustomerMobileFooterNav />
    </div>
  );
}
