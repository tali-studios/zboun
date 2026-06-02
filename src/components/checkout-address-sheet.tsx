"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ChevronRight,
  Home,
  Briefcase,
  Loader2,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Star,
  X,
} from "lucide-react";
import { useDeliveryLocation } from "@/components/delivery-location-provider";
import { formatSavedAddressLine } from "@/lib/format-address";
import type { SavedAddressOption } from "@/components/order-delivery-fields";
import { BRAND_HEX, BRAND_HEX_DEEP } from "@/lib/brand";

const GoogleMapPicker = dynamic(
  () => import("@/components/google-map-picker").then((m) => m.GoogleMapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
      </div>
    ),
  },
);

type Props = {
  open: boolean;
  onClose: () => void;
  savedAddresses?: SavedAddressOption[];
  isLoggedIn?: boolean;
  selectedAddressId?: string | null;
  onSelectAddress: (addr: SavedAddressOption) => void;
  onSelectMapLocation: (result: { lat: number; lng: number; address: string }) => void;
  onEditAddress: (addr: SavedAddressOption) => void;
};

const LABEL_ICONS: Record<string, typeof Home> = {
  home: Home,
  work: Briefcase,
  moms: Star,
};

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function displayName(addr: SavedAddressOption) {
  return addr.nickname?.trim() || capitalise(addr.label);
}

function addressLine(addr: SavedAddressOption) {
  return formatSavedAddressLine(addr) || addr.formatted_address?.trim() || "Address";
}

export function CheckoutAddressSheet({
  open,
  onClose,
  savedAddresses = [],
  isLoggedIn = false,
  selectedAddressId = null,
  onSelectAddress,
  onSelectMapLocation,
  onEditAddress,
}: Props) {
  const { location } = useDeliveryLocation();
  const [search, setSearch] = useState("");
  const [step, setStep] = useState<"list" | "map">("list");

  useEffect(() => {
    if (!open) {
      setSearch("");
      setStep("list");
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return savedAddresses;
    return savedAddresses.filter((addr) => {
      const name = displayName(addr).toLowerCase();
      const line = addressLine(addr).toLowerCase();
      return name.includes(q) || line.includes(q);
    });
  }, [savedAddresses, search]);

  if (!open) return null;

  function handleMapConfirm(result: { lat: number; lng: number; address: string }) {
    onSelectMapLocation(result);
    onClose();
  }

  const sheet = (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative z-10 flex w-full flex-col overflow-hidden bg-white shadow-2xl ${
          step === "map"
            ? "h-[100dvh] max-h-[100dvh] rounded-none sm:h-[min(90dvh,720px)] sm:max-w-2xl sm:rounded-3xl"
            : "max-h-[min(92dvh,680px)] max-w-md rounded-t-[28px] sm:rounded-3xl"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Where should we deliver to?"
      >
        {step === "map" ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3">
              <button
                type="button"
                onClick={() => setStep("list")}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700"
                aria-label="Back"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </button>
              <h2 className="text-sm font-bold text-slate-900">Search for an address</h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <GoogleMapPicker
                initial={
                  location ? { lat: location.lat, lng: location.lng } : undefined
                }
                onConfirm={handleMapConfirm}
                onClose={() => setStep("list")}
              />
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 px-5 pb-2 pt-5">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Where should we deliver to?
              </h2>
            </div>

            <div className="shrink-0 px-5 pb-3">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for an address"
                  className="ui-input ui-input-search w-full rounded-xl border-slate-200 py-3 pr-4 text-sm shadow-sm"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => setStep("map")}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white px-3 py-3.5 text-left shadow-sm transition hover:bg-slate-50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <Plus className="h-5 w-5" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900">Add new address</p>
                  <p className="text-xs text-slate-500">Save a new delivery address</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              </button>

              {isLoggedIn && savedAddresses.length > 0 ? (
                <div className="mt-5">
                  <p className="mb-2.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Saved addresses
                  </p>
                  <div className="space-y-2.5">
                    {filtered.map((addr) => {
                      const selected = selectedAddressId === addr.id;
                      const Icon = LABEL_ICONS[addr.label] ?? MapPin;
                      return (
                        <div
                          key={addr.id}
                          className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
                            selected
                              ? "border-violet-500 ring-1 ring-violet-500/30"
                              : "border-slate-100"
                          }`}
                        >
                          <div className="flex items-center gap-1 pr-1">
                            <button
                              type="button"
                              onClick={() => {
                                onSelectAddress(addr);
                                onClose();
                              }}
                              className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3.5 text-left"
                            >
                              <span
                                className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                  selected ? "bg-violet-50 text-violet-600" : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                                {selected ? (
                                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-violet-500" />
                                ) : null}
                              </span>
                              <div className="min-w-0 flex-1 overflow-hidden">
                                <p className="truncate text-sm font-bold text-slate-900">{displayName(addr)}</p>
                                <p className="mt-0.5 truncate text-xs text-slate-500">{addressLine(addr)}</p>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onEditAddress(addr);
                                onClose();
                              }}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                              aria-label={`Edit ${displayName(addr)}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {filtered.length === 0 ? (
                      <p className="py-4 text-center text-sm text-slate-500">No addresses match your search.</p>
                    ) : null}
                  </div>
                </div>
              ) : !isLoggedIn ? (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-center">
                  <p className="text-sm font-semibold text-slate-700">Save addresses for faster checkout</p>
                  <p className="mt-1 text-xs text-slate-500">Sign in to reuse your delivery locations.</p>
                  <div className="mt-3 flex justify-center gap-2">
                    <Link
                      href="/login"
                      onClick={onClose}
                      className="rounded-full px-4 py-2 text-xs font-bold text-white shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${BRAND_HEX} 0%, ${BRAND_HEX_DEEP} 100%)` }}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/signup"
                      onClick={onClose}
                      className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
                    >
                      Create account
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(sheet, document.body);
}
