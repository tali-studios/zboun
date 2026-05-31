"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BellOff,
  Camera,
  ChevronRight,
  DoorOpen,
  Home,
  Info,
  Pencil,
  Phone,
  UserRound,
} from "lucide-react";
import { useDeliveryLocation } from "@/components/delivery-location-provider";
import { CheckoutAddressSheet } from "@/components/checkout-address-sheet";
import { loadDeliveryLocation } from "@/lib/delivery-location";
import { formatSavedAddressLine } from "@/lib/format-address";
import { env } from "@/lib/env";
import {
  isPlaceholderLocationText,
  reverseGeocodeAddress,
} from "@/lib/google-geocode";
import type { SavedAddressOption } from "@/components/order-delivery-fields";
import {
  DeliveryTimeSheet,
  type DeliveryTimeChoice,
} from "@/components/delivery-time-sheet";
import {
  formatDeliveryTimeLabel,
  type DayHours,
} from "@/lib/opening-hours";

type Props = {
  customerName: string;
  onCustomerNameChange: (value: string) => void;
  address: string;
  onAddressChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  savedAddresses?: SavedAddressOption[];
  isLoggedIn?: boolean;
  openingHours: DayHours[];
  etaLabel?: string | null;
  deliveryTime: DeliveryTimeChoice;
  onDeliveryTimeChange: (value: DeliveryTimeChoice) => void;
};

const CHECKOUT_CHANGE =
  "shrink-0 rounded-lg border border-emerald-500 px-4 py-1.5 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50";

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

function staticMapUrl(lat: number, lng: number): string | null {
  const key = env.googleMapsApiKey;
  if (!key) return null;
  const params = new URLSearchParams({
    center: `${lat},${lng}`,
    zoom: "16",
    size: "96x96",
    scale: "2",
    markers: `color:red|${lat},${lng}`,
    key,
  });
  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
}

const INSTRUCTION_OPTIONS = [
  { id: "write", label: "Write instructions", icon: Pencil, phrase: null as string | null },
  { id: "door", label: "Leave at door", icon: DoorOpen, phrase: "Leave at door", disabled: true },
  { id: "call", label: "Call me on arrival", icon: Phone, phrase: "Call me on arrival" },
  {
    id: "bell",
    label: "Don't ring the door bell",
    icon: BellOff,
    phrase: "Don't ring the door bell",
  },
  {
    id: "doorman",
    label: "Leave with Doorman",
    icon: UserRound,
    phrase: "Leave with Doorman",
    disabled: true,
  },
] as const;

function CheckoutCard({
  title,
  onChange,
  children,
}: {
  title: string;
  onChange?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-bold text-slate-900">{title}</p>
        {onChange ? (
          <button type="button" onClick={onChange} className={CHECKOUT_CHANGE}>
            Change
          </button>
        ) : null}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function CheckoutDeliverySections({
  customerName,
  onCustomerNameChange,
  address,
  onAddressChange,
  notes,
  onNotesChange,
  savedAddresses = [],
  isLoggedIn = false,
  openingHours,
  etaLabel,
  deliveryTime,
  onDeliveryTimeChange,
}: Props) {
  const { location, setLocation, radiusKm } = useDeliveryLocation();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [baseAddress, setBaseAddress] = useState("");
  const [extraDetails, setExtraDetails] = useState("");
  const [showCustomInstructions, setShowCustomInstructions] = useState(false);
  const [saveInstructionsDefault, setSaveInstructionsDefault] = useState(false);
  const [showDeliveryTimeSheet, setShowDeliveryTimeSheet] = useState(false);
  const [showAddressSheet, setShowAddressSheet] = useState(false);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  function buildFullAddress(base: string, extra: string) {
    const b = base.trim();
    const e = extra.trim();
    if (!b) return e;
    if (!e) return b;
    return `${b}, ${e}`;
  }

  useEffect(() => {
    const saved = loadDeliveryLocation();
    if (!saved) return;

    if (isPlaceholderLocationText(saved.address) || isPlaceholderLocationText(saved.label)) {
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
      const match = findMatchingSavedAddress(savedAddresses, saved.lat, saved.lng, saved.address);
      if (match) setSelectedAddressId(match.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once
  }, []);

  useEffect(() => {
    if (!location?.address || isPlaceholderLocationText(location.address)) return;
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

  const matchedSaved = selectedAddressId
    ? savedAddresses.find((a) => a.id === selectedAddressId) ?? null
    : location
      ? findMatchingSavedAddress(savedAddresses, location.lat, location.lng, address)
      : null;

  const addressTitle =
    matchedSaved?.nickname ??
    (matchedSaved ? capitalise(matchedSaved.label) : null) ??
    location?.label ??
    "Delivery address";

  const addressLine = address.trim() || baseAddress.trim() || "Set your delivery address";
  const mapUrl =
    location?.lat != null && location?.lng != null
      ? staticMapUrl(location.lat, location.lng)
      : null;

  function toggleInstructionPhrase(phrase: string) {
    const trimmed = notes.trim();
    if (trimmed.includes(phrase)) {
      onNotesChange(
        trimmed
          .replace(phrase, "")
          .replace(/\.\s*\./g, ".")
          .replace(/^\.\s*|\s*\.$/g, "")
          .trim(),
      );
      return;
    }
    onNotesChange(trimmed ? `${trimmed}. ${phrase}` : phrase);
  }

  function isPhraseActive(phrase: string | null) {
    return phrase ? notes.includes(phrase) : showCustomInstructions;
  }

  function pickSavedAddress(addr: SavedAddressOption) {
    const line = formatSavedAddressLine(addr);
    setBaseAddress(addr.formatted_address?.trim() || line);
    setExtraDetails("");
    onAddressChange(line);
    setSelectedAddressId(addr.id);
    setLocation({
      lat: addr.latitude,
      lng: addr.longitude,
      address: line,
      label: addr.nickname ?? capitalise(addr.label),
      radiusKm,
    });
  }

  function pickMapLocation(result: { lat: number; lng: number; address: string }) {
    setSelectedAddressId(null);
    setBaseAddress(result.address);
    setExtraDetails("");
    onAddressChange(result.address);
    setLocation({
      lat: result.lat,
      lng: result.lng,
      address: result.address,
      label: result.address.split(",")[0]?.trim() || "Delivery address",
      radiusKm,
    });
  }

  return (
    <>
      <CheckoutAddressSheet
        open={showAddressSheet}
        onClose={() => setShowAddressSheet(false)}
        savedAddresses={savedAddresses}
        isLoggedIn={isLoggedIn}
        selectedAddressId={selectedAddressId}
        onSelectAddress={pickSavedAddress}
        onSelectMapLocation={pickMapLocation}
      />
      <DeliveryTimeSheet
        open={showDeliveryTimeSheet}
        onClose={() => setShowDeliveryTimeSheet(false)}
        value={deliveryTime}
        onChange={onDeliveryTimeChange}
        openingHours={openingHours}
        etaLabel={etaLabel}
      />

      <div className="space-y-3">
        {/* Delivery time */}
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-900">Delivery time</p>
              <p className="mt-1 text-sm text-slate-600">
                {formatDeliveryTimeLabel(deliveryTime, etaLabel)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeliveryTimeSheet(true)}
              className={CHECKOUT_CHANGE}
            >
              Change
            </button>
          </div>
        </section>

        {/* Delivery address */}
        <CheckoutCard title="Delivery Address" onChange={() => setShowAddressSheet(true)}>
          <div className="flex gap-3">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
              {mapUrl ? (
                <Image
                  src={mapUrl}
                  alt=""
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-300">
                  <Home className="h-8 w-8" strokeWidth={1.5} aria-hidden />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900">{addressTitle}</p>
              <p className="mt-0.5 text-sm leading-snug text-slate-500">{addressLine}</p>
              {!isLoggedIn ? (
                <p className="mt-2 text-[11px] text-slate-500">
                  <Link href="/login" className="font-semibold text-emerald-600 hover:underline">
                    Sign in
                  </Link>{" "}
                  to use saved addresses.
                </p>
              ) : null}
            </div>
          </div>

          <input
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            placeholder="Your name"
            className="ui-input mt-3 text-sm"
            autoComplete="name"
          />

          <textarea
            value={extraDetails}
            onChange={(e) => {
              setSelectedAddressId(null);
              const nextExtra = e.target.value;
              setExtraDetails(nextExtra);
              onAddressChange(buildFullAddress(baseAddress, nextExtra));
            }}
            placeholder="Apartment, floor, building… (optional)"
            rows={2}
            className="ui-textarea mt-2 text-sm"
          />

          <button
            type="button"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
            onClick={() => setShowAddressSheet(true)}
          >
            <Camera className="h-3.5 w-3.5" aria-hidden />
            Take address photo
            <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden />
          </button>
        </CheckoutCard>

        {/* Delivery instructions */}
        <CheckoutCard title="Delivery Instructions">
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {INSTRUCTION_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = isPhraseActive(opt.phrase);
              const disabled = "disabled" in opt && opt.disabled;
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    if (opt.id === "write") {
                      setShowCustomInstructions(true);
                      notesRef.current?.focus();
                      return;
                    }
                    if (opt.phrase) toggleInstructionPhrase(opt.phrase);
                  }}
                  className={`flex w-[88px] shrink-0 flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center transition ${
                    disabled
                      ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-50"
                      : active
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
                  <span className="text-[10px] font-medium leading-tight">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {showCustomInstructions || notes.trim() ? (
            <textarea
              ref={notesRef}
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Add delivery instructions…"
              rows={2}
              className="ui-textarea mt-3 text-sm"
            />
          ) : null}

          {isLoggedIn && matchedSaved ? (
            <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={saveInstructionsDefault}
                onChange={(e) => setSaveInstructionsDefault(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-emerald-600"
              />
              Save as my default for this address
            </label>
          ) : null}

          <div className="mt-3 flex gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-xs leading-relaxed text-slate-600">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
            <p>Some instructions have been disabled as they are unavailable for cash payments.</p>
          </div>
        </CheckoutCard>
      </div>
    </>
  );
}
