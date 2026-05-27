"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, ChevronDown, Home, Briefcase, Star, Navigation } from "lucide-react";
import { useDeliveryLocation } from "@/components/delivery-location-provider";
import { DeliveryLocationSheet } from "@/components/delivery-location-sheet";
import { loadDeliveryLocation } from "@/lib/delivery-location";
import { formatSavedAddressLine } from "@/lib/format-address";

export type SavedAddressOption = {
  id: string;
  label: string;
  nickname: string | null;
  latitude: number;
  longitude: number;
  formatted_address: string | null;
  street: string | null;
  building: string | null;
  apartment: string | null;
  driver_notes: string | null;
  phone: string | null;
  is_default: boolean;
};

type Props = {
  customerName: string;
  onCustomerNameChange: (value: string) => void;
  address: string;
  onAddressChange: (value: string) => void;
  savedAddresses?: SavedAddressOption[];
  isLoggedIn?: boolean;
};

const LABEL_ICONS: Record<string, React.ReactNode> = {
  home: <Home className="h-3.5 w-3.5" />,
  work: <Briefcase className="h-3.5 w-3.5" />,
  moms: <Star className="h-3.5 w-3.5" />,
};

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function OrderDeliveryFields({
  customerName,
  onCustomerNameChange,
  address,
  onAddressChange,
  savedAddresses = [],
  isLoggedIn = false,
}: Props) {
  const { location, openSheet, setLocation } = useDeliveryLocation();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  // Pre-fill from localStorage once (e.g. location picked on home page)
  useEffect(() => {
    const saved = loadDeliveryLocation();
    if (saved?.address) {
      onAddressChange(saved.address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  // When delivery context updates (sheet confirm), sync into order address
  useEffect(() => {
    if (!location?.address) return;
    onAddressChange(location.address);
    setSelectedAddressId(null);
  }, [location, onAddressChange]);

  function pickSavedAddress(addr: SavedAddressOption) {
    const line = formatSavedAddressLine(addr);
    onAddressChange(line);
    setSelectedAddressId(addr.id);
    setLocation({
      lat: addr.latitude,
      lng: addr.longitude,
      address: line,
      label: addr.nickname ?? capitalise(addr.label),
      radiusKm: location?.radiusKm ?? 10,
    });
  }

  const deliveryLabel = location?.label ?? (address.trim() ? "Custom address" : null);

  return (
    <>
      <DeliveryLocationSheet savedAddresses={savedAddresses} isLoggedIn={isLoggedIn} />

      <div className="space-y-2.5">
        <input
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
          placeholder="Your name"
          className="ui-input"
          autoComplete="name"
        />

        {/* Active delivery location from home / map */}
        <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600">
                Delivery location
              </p>
              {deliveryLabel || address.trim() ? (
                <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-slate-800">
                  {deliveryLabel || address.trim()}
                </p>
              ) : (
                <p className="mt-0.5 text-sm text-slate-500">No location set yet</p>
              )}
            </div>
            <button
              type="button"
              onClick={openSheet}
              className="flex shrink-0 items-center gap-1 rounded-lg border border-violet-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
            >
              <MapPin className="h-3.5 w-3.5" />
              {address.trim() ? "Change" : "Set"}
            </button>
          </div>

          {!isLoggedIn ? (
            <p className="mt-2 text-[11px] text-slate-500">
              <Link href="/login" className="font-semibold text-violet-600 hover:underline">
                Sign in
              </Link>{" "}
              to pick from saved addresses.
            </p>
          ) : null}
        </div>

        {/* Saved addresses (logged in) */}
        {isLoggedIn && savedAddresses.length > 0 ? (
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Saved addresses
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {savedAddresses.map((addr) => {
                const selected = selectedAddressId === addr.id;
                const icon = LABEL_ICONS[addr.label];
                return (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => pickSavedAddress(addr)}
                    className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs transition ${
                      selected
                        ? "border-violet-400 bg-violet-100 text-violet-900"
                        : "border-slate-200 bg-white text-slate-700 hover:border-violet-200"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                        selected ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {icon ?? <Navigation className="h-3.5 w-3.5" />}
                    </span>
                    <span className="max-w-[140px]">
                      <span className="block font-semibold">
                        {addr.nickname ?? capitalise(addr.label)}
                        {addr.is_default ? " · Default" : ""}
                      </span>
                      <span className="block truncate text-[10px] opacity-70">
                        {addr.formatted_address ?? formatSavedAddressLine(addr)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Editable full address line (sent on WhatsApp) */}
        <div>
          <label className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Address for this order
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedAddressId(null);
                onAddressChange("");
              }}
              className="text-[10px] font-medium text-slate-400 hover:text-violet-600"
            >
              Clear
            </button>
          </label>
          <textarea
            value={address}
            onChange={(e) => {
              setSelectedAddressId(null);
              onAddressChange(e.target.value);
            }}
            placeholder="Street, building, floor — pre-filled from your delivery location"
            rows={2}
            className="ui-textarea text-sm"
          />
          <p className="mt-1 text-[10px] text-slate-400">
            You can add floor or door details here without changing your saved location.
          </p>
        </div>
      </div>
    </>
  );
}
