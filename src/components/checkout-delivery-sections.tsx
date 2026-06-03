"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  BellOff,
  Camera,
  ChevronRight,
  DoorOpen,
  Home,
  Info,
  Mic,
  Pencil,
  Phone,
  UserRound,
} from "lucide-react";
import { useDeliveryLocation } from "@/components/delivery-location-provider";
import { CheckoutAddressSheet } from "@/components/checkout-address-sheet";
import {
  CheckoutAddressDetailsSheet,
  type AddressDetailsAction,
} from "@/components/checkout-address-details-sheet";
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
import { CheckoutDeliveryInstructionsSheet } from "@/components/checkout-delivery-instructions-sheet";
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
  "shrink-0 rounded-lg border border-violet-500 px-4 py-1.5 text-xs font-semibold text-violet-600 transition hover:bg-violet-50";

const ADDRESS_ACTIONS: Array<{
  label: string;
  icon: typeof Camera;
  action: AddressDetailsAction;
}> = [
  { label: "Take address photo", icon: Camera, action: "photo" },
  { label: "Add address by voice", icon: Mic, action: "voice" },
  { label: "Add more details", icon: Pencil, action: "details" },
];

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
  const [addressBook, setAddressBook] = useState<SavedAddressOption[]>(savedAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [baseAddress, setBaseAddress] = useState("");
  const [extraDetails, setExtraDetails] = useState("");
  const [showInstructionsSheet, setShowInstructionsSheet] = useState(false);
  const [customInstructionsSet, setCustomInstructionsSet] = useState(() => notes.trim().length > 0);
  const [saveInstructionsDefault, setSaveInstructionsDefault] = useState(false);
  const [showDeliveryTimeSheet, setShowDeliveryTimeSheet] = useState(false);
  const [showAddressSheet, setShowAddressSheet] = useState(false);
  const [showAddressDetailsSheet, setShowAddressDetailsSheet] = useState(false);
  const [detailsInitialAction, setDetailsInitialAction] = useState<AddressDetailsAction>("details");
  const [addressActionIndex, setAddressActionIndex] = useState(0);

  useEffect(() => {
    setAddressBook(savedAddresses);
  }, [savedAddresses]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setAddressActionIndex((i) => (i + 1) % ADDRESS_ACTIONS.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, []);

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
      const match = findMatchingSavedAddress(addressBook, saved.lat, saved.lng, saved.address);
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
      addressBook,
      location.lat,
      location.lng,
      location.address,
    );
    setSelectedAddressId((current) => current ?? match?.id ?? null);
  }, [location, onAddressChange, addressBook]);

  const activeSaved = selectedAddressId
    ? addressBook.find((a) => a.id === selectedAddressId) ?? null
    : location
      ? findMatchingSavedAddress(addressBook, location.lat, location.lng, address)
      : null;

  const matchedSaved = activeSaved;

  const addressTitle =
    matchedSaved?.nickname ??
    (matchedSaved ? capitalise(matchedSaved.label) : null) ??
    location?.label ??
    "Delivery address";

  const addressSummary =
    matchedSaved
      ? [matchedSaved.street, matchedSaved.building, matchedSaved.apartment]
          .filter(Boolean)
          .join(", ") ||
        matchedSaved.formatted_address?.trim() ||
        formatSavedAddressLine(matchedSaved)
      : address.trim() || baseAddress.trim() || "";

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
    return phrase ? notes.includes(phrase) : customInstructionsSet;
  }

  function handleSaveInstructions(next: string) {
    onNotesChange(next);
    setCustomInstructionsSet(next.trim().length > 0);
  }

  function applySavedAddress(addr: SavedAddressOption) {
    const line =
      [addr.street, addr.building, addr.apartment].filter(Boolean).join(", ") ||
      addr.formatted_address?.trim() ||
      formatSavedAddressLine(addr);

    setAddressBook((prev) => {
      const index = prev.findIndex((a) => a.id === addr.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = addr;
        return next;
      }
      return [...prev, addr];
    });

    setBaseAddress(addr.formatted_address?.trim() || line);
    setExtraDetails("");
    onAddressChange(line);
    setSelectedAddressId(addr.id === "local-draft" ? null : addr.id);
    setLocation({
      lat: addr.latitude,
      lng: addr.longitude,
      address: line,
      label: addr.nickname ?? capitalise(addr.label),
      radiusKm,
    });
  }

  function openAddressDetails(action: AddressDetailsAction, addr?: SavedAddressOption) {
    if (addr) setSelectedAddressId(addr.id);
    setDetailsInitialAction(action);
    setShowAddressDetailsSheet(true);
  }

  function handleEditSavedAddress(addr: SavedAddressOption) {
    setShowAddressSheet(false);
    openAddressDetails("details", addr);
  }

  const detailsInitial = useMemo(
    () =>
      matchedSaved
        ? {
            label: matchedSaved.label,
            nickname: matchedSaved.nickname,
            latitude: matchedSaved.latitude,
            longitude: matchedSaved.longitude,
            formatted_address: matchedSaved.formatted_address,
            street: matchedSaved.street,
            building: matchedSaved.building,
            apartment: matchedSaved.apartment,
            phone: matchedSaved.phone,
            country_code: matchedSaved.country_code,
            driver_notes: matchedSaved.driver_notes,
            voice_directions_url: matchedSaved.voice_directions_url,
            address_photo_urls: matchedSaved.address_photo_urls,
          }
        : location
          ? {
              label: "other",
              nickname: location.label ?? "Home",
              latitude: location.lat,
              longitude: location.lng,
              formatted_address: baseAddress || location.address,
              street: "",
              building: "",
              apartment: extraDetails,
              phone: null,
              driver_notes: null,
            }
          : undefined,
    [matchedSaved, location, baseAddress, extraDetails],
  );

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
      <CheckoutAddressDetailsSheet
        open={showAddressDetailsSheet}
        onClose={() => setShowAddressDetailsSheet(false)}
        initialAction={detailsInitialAction}
        isLoggedIn={isLoggedIn}
        addressId={selectedAddressId ?? matchedSaved?.id ?? null}
        initial={detailsInitial}
        onSaved={applySavedAddress}
        onDeleted={() => {
          setAddressBook((prev) => prev.filter((a) => a.id !== selectedAddressId));
          setSelectedAddressId(null);
          setBaseAddress("");
          setExtraDetails("");
          onAddressChange("");
        }}
      />
      <CheckoutAddressSheet
        open={showAddressSheet}
        onClose={() => setShowAddressSheet(false)}
        savedAddresses={addressBook}
        isLoggedIn={isLoggedIn}
        selectedAddressId={selectedAddressId}
        onSelectAddress={applySavedAddress}
        onSelectMapLocation={pickMapLocation}
        onEditAddress={handleEditSavedAddress}
      />
      <DeliveryTimeSheet
        open={showDeliveryTimeSheet}
        onClose={() => setShowDeliveryTimeSheet(false)}
        value={deliveryTime}
        onChange={onDeliveryTimeChange}
        openingHours={openingHours}
        etaLabel={etaLabel}
      />
      <CheckoutDeliveryInstructionsSheet
        open={showInstructionsSheet}
        onClose={() => setShowInstructionsSheet(false)}
        value={notes}
        onSave={handleSaveInstructions}
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
            <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
              {mapUrl ? (
                <Image
                  src={mapUrl}
                  alt=""
                  width={72}
                  height={72}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-300">
                  <Home className="h-8 w-8" strokeWidth={1.5} aria-hidden />
                </div>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{addressTitle}</p>
                {addressSummary ? (
                  <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-slate-500">{addressSummary}</p>
                ) : null}
              </div>
              {(() => {
                const action = ADDRESS_ACTIONS[addressActionIndex];
                const ActionIcon = action.icon;
                return (
                  <button
                    type="button"
                    key={action.label}
                    className="inline-flex w-full items-center gap-2 rounded-full border border-violet-300/70 bg-[color-mix(in_srgb,var(--brand)_20%,white)] px-3 py-2 text-left text-xs font-semibold text-violet-900 transition hover:border-violet-400 hover:bg-[color-mix(in_srgb,var(--brand)_28%,white)]"
                    onClick={() => openAddressDetails(action.action)}
                  >
                    <ActionIcon className="h-3.5 w-3.5 shrink-0 text-violet-700" strokeWidth={2} aria-hidden />
                    <span className="min-w-0 flex-1 truncate">{action.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-violet-600" aria-hidden />
                  </button>
                );
              })()}
            </div>
          </div>

          {!customerName.trim() ? (
            <input
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              placeholder="Your name (required for delivery)"
              className="ui-input mt-3 text-sm"
              autoComplete="name"
            />
          ) : null}
        </CheckoutCard>

        {/* Delivery instructions */}
        <CheckoutCard title="Delivery Instructions">
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {INSTRUCTION_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = isPhraseActive(opt.phrase);
              const disabled = "disabled" in opt && opt.disabled;
              const phraseChip = opt.id === "call" || opt.id === "bell";
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    if (opt.id === "write") {
                      setShowInstructionsSheet(true);
                      return;
                    }
                    if (opt.phrase) toggleInstructionPhrase(opt.phrase);
                  }}
                  className={`flex w-[88px] shrink-0 flex-col rounded-xl border px-2 py-2.5 transition ${
                    phraseChip ? "justify-between text-left" : "items-center gap-1.5 text-center"
                  } ${
                    disabled
                      ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-50 text-slate-400"
                      : active
                        ? "border-[var(--brand)] bg-white text-[var(--brand)]"
                        : phraseChip
                          ? "border-slate-200 bg-white text-slate-600 hover:border-violet-300"
                          : "border-slate-200 bg-white text-slate-700 hover:border-violet-300"
                  }`}
                >
                  <Icon
                    className={`shrink-0 ${phraseChip ? "h-4 w-4" : "h-5 w-5"}`}
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <span className="text-[10px] font-medium leading-tight">
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>

          {isLoggedIn && matchedSaved ? (
            <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={saveInstructionsDefault}
                onChange={(e) => setSaveInstructionsDefault(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-violet-600"
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
