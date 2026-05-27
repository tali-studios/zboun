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
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="outline-none transition-opacity hover:opacity-80">
            <Image
              src="/Logo.svg"
              alt="Zboun"
              width={120}
              height={36}
              className="h-8 w-auto object-contain"
              unoptimized
            />
          </Link>
          <form action={customerSignOutAction}>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="container py-8 md:py-12">
        {/* Profile card */}
        <div className="mb-8 flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xl font-bold text-white shadow-md shadow-violet-300/40">
            {session.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{session.name}</p>
            <p className="text-sm text-slate-500">{session.email}</p>
          </div>
          <div className="ml-auto">
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
              <User className="mr-1 inline h-3 w-3" />
              Customer
            </span>
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
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Saved addresses</h2>
            <p className="text-sm text-slate-500">Quickly pick your delivery location when ordering.</p>
          </div>
          <Link
            href="/account/addresses/new"
            className="flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-400/30 transition hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" />
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
                  className={`relative flex gap-4 rounded-2xl border bg-white p-5 shadow-sm transition ${
                    addr.is_default ? "border-violet-200 ring-2 ring-violet-100" : "border-slate-100"
                  }`}
                >
                  {/* Icon */}
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta.colorClass}`}
                  >
                    {meta.icon}
                  </span>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
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
                      <p className="mt-0.5 text-sm text-slate-500 line-clamp-2">{addr.formatted_address}</p>
                    ) : (
                      <p className="mt-0.5 text-xs text-slate-400">
                        {addr.latitude.toFixed(5)}, {addr.longitude.toFixed(5)}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <Link
                      href={`/account/addresses/${addr.id}`}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
                    >
                      Edit
                    </Link>
                    {!addr.is_default ? (
                      <form action={setDefaultAddressAction}>
                        <input type="hidden" name="id" value={addr.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 transition hover:border-violet-300 hover:text-violet-700"
                        >
                          Set default
                        </button>
                      </form>
                    ) : null}
                    <form action={deleteCustomerAddressAction}>
                      <input type="hidden" name="id" value={addr.id} />
                      <button
                        type="submit"
                        className="flex items-center gap-1 rounded-lg border border-transparent px-3 py-1 text-xs font-medium text-slate-400 transition hover:border-red-100 hover:bg-red-50 hover:text-red-500"
                        onClick={(e) => {
                          if (!confirm("Delete this address?")) e.preventDefault();
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Browse link */}
        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-violet-200 bg-white px-6 py-3 text-sm font-semibold text-violet-700 shadow-sm transition hover:bg-violet-50"
          >
            ← Back to restaurants
          </Link>
        </div>
      </main>
    </div>
  );
}
