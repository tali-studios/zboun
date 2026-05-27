import { redirect } from "next/navigation";
import Link from "next/link";
import { getCustomerSession } from "@/app-actions/customer-auth";
import { AddressForm } from "@/components/address-form";

export const dynamic = "force-dynamic";

export default async function NewAddressPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      <div className="container max-w-lg py-8 md:py-12">
        <Link
          href="/account"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-violet-700"
        >
          ← Back to addresses
        </Link>
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">Add new address</h1>
        <AddressForm />
      </div>
    </div>
  );
}
