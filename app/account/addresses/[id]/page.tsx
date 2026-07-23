import { redirect } from "next/navigation";
import { getCustomerSession, getCustomerAddresses } from "@/app-actions/customer-auth";
import { AddressForm } from "@/components/address-form";
import { CustomerMobileFooterNav } from "@/components/customer-mobile-footer-nav";
import { CustomerDesktopNav } from "@/components/customer-desktop-nav";
import { CustomerMobileTopBar } from "@/components/customer-mobile-top-bar";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditAddressPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { error } = await searchParams;
  const session = await getCustomerSession();
  if (!session) redirect("/login");

  const addresses = await getCustomerAddresses(session.id);
  const address = addresses.find((a) => a.id === id);
  if (!address) redirect("/account");

  return (
    <div className="min-h-screen bg-white">
      <CustomerDesktopNav title="Edit Address" backHref="/account" />

      <CustomerMobileTopBar title="Edit Address" backHref="/account" />

      <div className="mx-auto max-w-lg px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-5 md:py-10">
        <AddressForm
          address={address}
          duplicateNameError={error === "duplicate_name"}
          missingPhoneError={error === "missing_phone"}
        />
      </div>
      <CustomerMobileFooterNav />
    </div>
  );
}
