import { redirect } from "next/navigation";
import Link from "next/link";
import { getCustomerSession, getCustomerAddresses } from "@/app-actions/customer-auth";
import { AddressForm } from "@/components/address-form";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditAddressPage({ params }: Props) {
  const { id } = await params;
  const session = await getCustomerSession();
  if (!session) redirect("/login");

  const addresses = await getCustomerAddresses();
  const address = addresses.find((a) => a.id === id);
  if (!address) redirect("/account");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      <div className="container max-w-lg py-8 md:py-12">
        <Link
          href="/account"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-violet-700"
        >
          ← Back to addresses
        </Link>
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">Edit address</h1>
        <AddressForm address={address} />
      </div>
    </div>
  );
}
