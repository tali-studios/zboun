import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Plus,
  Star,
  Home,
  Briefcase,
  Trash2,
  LogOut,
  User,
} from "lucide-react";
import {
  getCustomerSession,
  getCustomerAddresses,
  customerSignOutAction,
  deleteCustomerAddressAction,
  setDefaultAddressAction,
} from "@/app-actions/customer-auth";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ success?: string; error?: string }>;
};

const LABEL_META: Record<string, { label: string; colorClass: string; icon: React.ReactNode }> = {
  home: { label: "Home", colorClass: "bg-emerald-100 text-emerald-700", icon: <Home className="h-4 w-4" /> },
  work: { label: "Work", colorClass: "bg-blue-100 text-blue-700", icon: <Briefcase className="h-4 w-4" /> },
  moms: { label: "Mom's", colorClass: "bg-pink-100 text-pink-700", icon: <Star className="h-4 w-4" /> },
  other: { label: "Other", colorClass: "bg-slate-100 text-slate-600", icon: <MapPin className="h-4 w-4" /> },
  custom: { label: "Custom", colorClass: "bg-violet-100 text-violet-700", icon: <MapPin className="h-4 w-4" /> },
};

export default async function AccountPage({ searchParams }: Props) {
  const session = await getCustomerSession();
  if (!session) redirect("/login");

  const addresses = await getCustomerAddresses();
  const { success, error } = await searchParams;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <Link href="/" className="shrink-0 outline-none transition-opacity hover:opacity-80">
            <Image
              src="/Logo.svg"
              alt="Zboun"
              width={120}
              height={36}
              className="h-7 w-auto object-contain sm:h-8"
              unoptimized
            />
          </Link>
          <form action={customerSignOutAction}>
            <button
              type="submit"
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:text-red-600 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
            >
              <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="container px-4 py-6 sm:px-6 sm:py-12">
        {/* Profile card */}
        <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:mb-8 sm:rounded-3xl sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-lg font-bold text-white shadow-md shadow-violet-300/40 sm:h-14 sm:w-14 sm:rounded-2xl sm:text-xl">
              {session.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="truncate text-base font-bold text-slate-900 sm:text-lg">{session.name}</p>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700 sm:px-3 sm:text-xs">
                  <User className="h-3 w-3" />
                  Customer
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm">{session.email}</p>
            </div>
          </div>
        </div>

        {/* Toast messages */}
        {success === "address_saved" ? (
          <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            Address saved successfully.
          </div>
        ) : null}
        {error ? (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {decodeURIComponent(error)}
          </div>
        ) : null}

        {/* Addresses section */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900">Saved addresses</h2>
            <p className="mt-0.5 text-sm text-slate-500">Quickly pick your delivery location when ordering.</p>
          </div>
          <Link
            href="/account/addresses/new"
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-400/30 transition hover:bg-violet-700 sm:w-auto"
          >
            <Plus className="h-4 w-4 shrink-0" />
            Add address
          </Link>
        </div>

        {addresses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-14 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <MapPin className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">No saved addresses yet</p>
            <p className="mt-1 text-sm text-slate-400">Add your home, work or any other address.</p>
            <Link
              href="/account/addresses/new"
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-400/30 transition hover:bg-violet-700"
            >
              <Plus className="h-4 w-4" />
              Add first address
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {addresses.map((addr) => {
              const meta = LABEL_META[addr.label] ?? LABEL_META.other;
              return (
                <div
                  key={addr.id}
                  className={`rounded-2xl border bg-white p-4 shadow-sm transition sm:p-5 ${
                    addr.is_default ? "border-violet-200 ring-2 ring-violet-100" : "border-slate-100"
                  }`}
                >
                  <div className="flex gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${meta.colorClass}`}
                    >
                      {meta.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="font-semibold text-slate-800">
                          {addr.nickname ?? meta.label}
                        </p>
                        {addr.is_default ? (
                          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-600">
                            Default
                          </span>
                        ) : null}
                      </div>
                      {addr.formatted_address ? (
                        <p className="mt-1 text-sm leading-snug text-slate-500 line-clamp-2">
                          {addr.formatted_address}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-slate-400">
                          {addr.latitude.toFixed(5)}, {addr.longitude.toFixed(5)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                    <Link
                      href={`/account/addresses/${addr.id}`}
                      className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
                    >
                      Edit
                    </Link>
                    {!addr.is_default ? (
                      <form action={setDefaultAddressAction} className="inline">
                        <input type="hidden" name="id" value={addr.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-violet-300 hover:text-violet-700"
                        >
                          Set default
                        </button>
                      </form>
                    ) : null}
                    <form action={deleteCustomerAddressAction} className="inline">
                      <input type="hidden" name="id" value={addr.id} />
                      <ConfirmSubmitButton
                        message="Delete this address?"
                        className="inline-flex items-center gap-1 rounded-lg border border-transparent px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-red-100 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Browse link */}
        <div className="mt-8 text-center sm:mt-10">
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-violet-200 bg-white px-6 py-3 text-sm font-semibold text-violet-700 shadow-sm transition hover:bg-violet-50 sm:w-auto"
          >
            ← Back to restaurants
          </Link>
        </div>
      </main>
    </div>
  );
}
