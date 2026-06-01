"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, ChevronDown, Home, Briefcase, Star, Navigation } from "lucide-react";
import { useDeliveryLocation } from "@/components/delivery-location-provider";
import { DeliveryLocationSheet } from "@/components/delivery-location-sheet";
import { loadDeliveryLocation } from "@/lib/delivery-location";
import { formatSavedAddressLine } from "@/lib/format-address";
import {
  isPlaceholderLocationText,
  reverseGeocodeAddress,
} from "@/lib/google-geocode";

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
  country_code?: string | null;
  voice_directions_url?: string | null;
  address_photo_urls?: string[] | null;
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

function findMatchingSavedAddress(
  addresses: SavedAddressOption[],
  lat: number,
  lng: number,
  addressLine: string,
): SavedAddressOption | null {
  const normalized = addressLine.trim().toLowerCase();
  for (const addr of addresses) {
    const line = formatSavedAddressLine(addr).trim().toLowerCase();
    const formatted = addr.formatted_address?.trim().toLowerCase() ?? "";
    const sameCoords =
      Math.abs(addr.latitude - lat) < 0.0002 && Math.abs(addr.longitude - lng) < 0.0002;
    if (
      sameCoords ||
      (line.length > 0 && line === normalized) ||
      (formatted.length > 0 && formatted === normalized)
    ) {
      return addr;
    }
  }
  return null;
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

  // base delivery address (comes from GPS / saved address); we hide it from UI.
  const [baseAddress, setBaseAddress] = useState<string>("");
  // extra user details (door / floor / gate) shown in UI; appended to baseAddress for WhatsApp.
  const [extraDetails, setExtraDetails] = useState<string>("");

  function buildFullAddress(base: string, extra: string) {
    const b = base.trim();
    const e = extra.trim();
    if (!b) return e;
    if (!e) return b;
    return `${b}, ${e}`;
  }

  // Pre-fill from localStorage once (e.g. location picked on home page)
  useEffect(() => {
    const saved = loadDeliveryLocation();
    if (!saved) return;

    if (
      isPlaceholderLocationText(saved.address) ||
      isPlaceholderLocationText(saved.label)
    ) {
      void reverseGeocodeAddress(saved.lat, saved.lng).then((geocoded) => {
        const resolved = geocoded ?? `${saved.lat.toFixed(6)}, ${saved.lng.toFixed(6)}`;
        setBaseAddress(resolved);
        setExtraDetails("");
        onAddressChange(resolved);
      });
      return;
    }

    if (saved.address) {
      setBaseAddress(saved.address);
      setExtraDetails("");
      onAddressChange(saved.address);
      const match = findMatchingSavedAddress(
        savedAddresses,
        saved.lat,
        saved.lng,
        saved.address,
      );
      if (match) setSelectedAddressId(match.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  // When delivery context updates (sheet / GPS), sync into order address
  useEffect(() => {
    if (!location?.address) return;
    if (isPlaceholderLocationText(location.address)) return;
    setBaseAddress(location.address);
    setExtraDetails("");
    onAddressChange(location.address);
    const match = findMatchingSavedAddress(
      savedAddresses,
      location.lat,
      location.lng,
      location.address,
    );
    setSelectedAddressId(match?.id ?? null);
  }, [location, onAddressChange, savedAddresses]);

  function pickSavedAddress(addr: SavedAddressOption) {
    const line = formatSavedAddressLine(addr);
    setBaseAddress(line);
    setExtraDetails("");
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
        <div
          className={`rounded-xl border p-3 transition-colors ${
            baseAddress.trim()
              ? "border-violet-400 bg-violet-50 shadow-sm ring-1 ring-violet-200"
              : "border-violet-100 bg-violet-50/60"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600">
                Delivery location
              </p>
              {baseAddress.trim() ? (
                <p className="mt-0.5 text-sm font-semibold text-violet-800">Location selected ✓</p>
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
              {baseAddress.trim() ? "Change" : "Set"}
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
            <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {savedAddresses.map((addr) => {
                const selected = selectedAddressId === addr.id;
                const icon = LABEL_ICONS[addr.label];
                return (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => pickSavedAddress(addr)}
                    aria-pressed={selected}
                    className={`flex shrink-0 items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-left text-xs transition-all ${
                      selected
                        ? "border-violet-600 bg-violet-600 text-white shadow-md shadow-violet-500/30 ring-2 ring-violet-300 ring-offset-1"
                        : "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        selected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {icon ?? <Navigation className="h-3.5 w-3.5" />}
                    </span>
                    <span className="max-w-[130px] min-w-0">
                      <span className="block truncate font-semibold">
                        {addr.nickname ?? capitalise(addr.label)}
                      </span>
                      <span
                        className={`block truncate text-[10px] ${
                          selected ? "text-violet-100" : "text-slate-400"
                        }`}
                      >
                        {selected ? "Selected" : addr.is_default ? "Default" : "Tap to use"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Delivery details only (base address hidden; appended to WhatsApp behind the scenes) */}
        <div>
          <label className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Delivery details (optional)
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedAddressId(null);
                setBaseAddress("");
                setExtraDetails("");
                onAddressChange("");
              }}
              className="text-[10px] font-medium text-slate-400 hover:text-violet-600"
            >
              Clear
            </button>
          </label>
          <textarea
            value={extraDetails}
            onChange={(e) => {
              setSelectedAddressId(null);
              const nextExtra = e.target.value;
              setExtraDetails(nextExtra);
              onAddressChange(buildFullAddress(baseAddress, nextExtra));
            }}
            placeholder="Door, floor, gate…"
            rows={2}
            className="ui-textarea text-sm"
          />
          <p className="mt-1 text-[10px] text-slate-400">
            Base address is selected automatically from your GPS / saved location.
          </p>
        </div>
      </div>
    </>
  );
}
