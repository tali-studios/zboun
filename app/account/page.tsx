import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Home, Briefcase, Star, MapPin, Plus, Trash2, ChevronRight, Lock, Trash } from "lucide-react";
import {
  getCustomerSession,
  getCustomerAddresses,
  customerSignOutAction,
  deleteCustomerAddressAction,
  setDefaultAddressAction,
} from "@/app-actions/customer-auth";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { CustomerMobileFooterNav } from "@/components/customer-mobile-footer-nav";
import { BackToTopButton } from "@/components/back-to-top-button";
import { CustomerDesktopNav } from "@/components/customer-desktop-nav";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ success?: string; error?: string }>;
};

const LABEL_META: Record<string, { label: string; colorClass: string; icon: React.ReactNode }> = {
  home: { label: "Home", colorClass: "bg-emerald-50 text-emerald-600", icon: <Home className="h-4 w-4" /> },
  work: { label: "Work", colorClass: "bg-blue-50 text-blue-600", icon: <Briefcase className="h-4 w-4" /> },
  moms: { label: "Mom's", colorClass: "bg-pink-50 text-pink-600", icon: <Star className="h-4 w-4" /> },
  other: { label: "Other", colorClass: "bg-slate-100 text-slate-500", icon: <MapPin className="h-4 w-4" /> },
  custom: { label: "Custom", colorClass: "bg-violet-50 text-violet-600", icon: <MapPin className="h-4 w-4" /> },
};

function SettingsRow({
  icon,
  label,
  children,
  border = true,
}: {
  icon: React.ReactNode;
  label: string;
  children?: React.ReactNode;
  border?: boolean;
}) {
  return (
    <div className={`flex items-center gap-4 px-4 py-3.5 ${border ? "border-b border-slate-100" : ""}`}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        {icon}
      </span>
      <span className="flex-1 text-sm font-medium text-slate-800">{label}</span>
      {children}
    </div>
  );
}

export default async function AccountPage({ searchParams }: Props) {
  const session = await getCustomerSession();
  if (!session) redirect("/login");

  const addresses = await getCustomerAddresses();
  const { success, error } = await searchParams;

  return (
    <div className="min-h-screen bg-[#f2f2f7]">
      {/* ── Mobile-style top bar ── */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200/60 bg-white/95 px-4 backdrop-blur sm:hidden">
        <div className="w-9" aria-hidden />
        <p className="text-[15px] font-semibold text-slate-900">Account</p>
        <div className="w-9" aria-hidden />
      </header>

      <CustomerDesktopNav title="Account Settings" />

      <main className="mx-auto max-w-lg px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-6 sm:max-w-2xl sm:pb-16 sm:pt-10">

        {/* Toasts */}
        {success === "address_saved" ? (
          <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            Address saved successfully.
          </div>
        ) : null}
        {success === "password_changed" ? (
          <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            Password updated successfully.
          </div>
        ) : null}
        {error ? (
          <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {decodeURIComponent(error)}
          </div>
        ) : null}

        {/* ── Profile info card ── */}
        <div className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Profile</p>
          </div>
          <div className="px-4 py-3">
            <p className="mb-1 text-xs text-slate-400">Full name</p>
            <p className="text-sm font-semibold text-slate-900">{session.name}</p>
          </div>
          <div className="border-t border-slate-100 px-4 py-3">
            <p className="mb-1 text-xs text-slate-400">Email address</p>
            <p className="text-sm font-semibold text-slate-900">{session.email}</p>
          </div>
        </div>

        {/* ── Saved addresses ── */}
        <div className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Saved addresses</p>
            <Link
              href="/account/addresses/new"
              className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-3 py-1 text-[11px] font-semibold text-white transition hover:bg-violet-700"
            >
              <Plus className="h-3 w-3" />
              Add
            </Link>
          </div>

          {addresses.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <MapPin className="mx-auto mb-2 h-8 w-8 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">No saved addresses</p>
              <p className="mt-0.5 text-xs text-slate-400">Tap "Add" to save your home or work location.</p>
            </div>
          ) : (
            <div>
              {addresses.map((addr, i) => {
                const meta = LABEL_META[addr.label] ?? LABEL_META.other;
                return (
                  <div
                    key={addr.id}
                    className={`flex items-center gap-3 px-4 py-3.5 ${i < addresses.length - 1 ? "border-b border-slate-100" : ""}`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${meta.colorClass}`}>
                      {meta.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">{addr.nickname ?? meta.label}</p>
                        {addr.is_default ? (
                          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-600">Default</span>
                        ) : null}
                      </div>
                      {addr.formatted_address ? (
                        <p className="mt-0.5 truncate text-xs text-slate-400">{addr.formatted_address}</p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {!addr.is_default ? (
                        <form action={setDefaultAddressAction}>
                          <input type="hidden" name="id" value={addr.id} />
                          <button type="submit" className="rounded-lg px-2.5 py-1 text-[11px] font-semibold text-violet-600 transition hover:bg-violet-50">
                            Default
                          </button>
                        </form>
                      ) : null}
                      <Link
                        href={`/account/addresses/${addr.id}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-slate-100"
                      >
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </Link>
                      <form action={deleteCustomerAddressAction}>
                        <input type="hidden" name="id" value={addr.id} />
                        <ConfirmSubmitButton
                          message="Delete this address?"
                          className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 text-slate-300 hover:text-red-400" />
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Account actions ── */}
        <div className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <Link href="/account/orders" className="flex items-center gap-4 border-b border-slate-100 px-4 py-3.5 transition hover:bg-slate-50">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </span>
            <span className="flex-1 text-sm font-medium text-slate-800">My orders</span>
            <ChevronRight className="h-4 w-4 text-slate-300" />
          </Link>
          <Link href="/account/addresses/new" className="flex items-center gap-4 px-4 py-3.5 transition hover:bg-slate-50">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <MapPin className="h-4 w-4" />
            </span>
            <span className="flex-1 text-sm font-medium text-slate-800">Add new address</span>
            <ChevronRight className="h-4 w-4 text-slate-300" />
          </Link>
        </div>

        {/* ── Security ── */}
        <div className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <Link href="/account/change-password" className="flex items-center gap-4 border-b border-slate-100 px-4 py-3.5 transition hover:bg-slate-50">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <Lock className="h-4 w-4" />
            </span>
            <span className="flex-1 text-sm font-medium text-slate-800">Change password</span>
            <ChevronRight className="h-4 w-4 text-slate-300" />
          </Link>
          <div className="flex items-center gap-4 px-4 py-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-400">
              <Trash className="h-4 w-4" />
            </span>
            <span className="flex-1 text-sm font-medium text-slate-800">Delete account</span>
            <ChevronRight className="h-4 w-4 text-slate-300" />
          </div>
        </div>

        {/* ── Sign out ── */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <form action={customerSignOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-4 px-4 py-3.5 transition hover:bg-red-50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </span>
              <span className="flex-1 text-left text-sm font-semibold text-red-500">Sign out</span>
            </button>
          </form>
        </div>

      </main>

      <CustomerMobileFooterNav />
      <BackToTopButton />
    </div>
  );
}
