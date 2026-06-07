"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Banknote,
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
  Zap,
} from "lucide-react";
import type { DeliverySpeed } from "@/app-actions/orders";
import {
  computeChangeDue,
  formatChangeDue,
  formatOrderDue,
  type PaymentCurrency,
} from "@/lib/payment-note";
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
  fastDeliveryEnabled?: boolean;
  freeDelivery?: boolean;
  standardDeliveryFeeUsd?: number;
  fastDeliveryFeeUsd?: number;
  deliverySpeed?: DeliverySpeed;
  onDeliverySpeedChange?: (value: DeliverySpeed) => void;
  formatPrice?: (amountUsd: number) => string;
  orderTotalUsd?: number;
  orderTotalLbp?: number;
  paymentCurrency?: PaymentCurrency;
  onPaymentCurrencyChange?: (value: PaymentCurrency) => void;
  payingExact?: boolean;
  onPayingExactChange?: (value: boolean) => void;
  payingWith?: number | null;
  onPayingWithChange?: (value: number | null) => void;
};

const CASH_QUICK_USD = [5, 10, 20, 50, 100] as const;
const CASH_QUICK_LBP = [100_000, 200_000, 500_000, 1_000_000] as const;

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
  fastDeliveryEnabled = false,
  freeDelivery = false,
  standardDeliveryFeeUsd = 0,
  fastDeliveryFeeUsd = 0,
  deliverySpeed = "standard",
  onDeliverySpeedChange,
  formatPrice,
  orderTotalUsd = 0,
  orderTotalLbp = 0,
  paymentCurrency = "usd",
  onPaymentCurrencyChange,
  payingExact = false,
  onPayingExactChange,
  payingWith = null,
  onPayingWithChange,
}: Props) {
  const orderTotals = { usd: orderTotalUsd, lbp: orderTotalLbp };
  const changeDue = computeChangeDue(
    { exactAmount: payingExact, currency: paymentCurrency, payingWith },
    orderTotals,
  );
  const quickAmounts = paymentCurrency === "usd" ? CASH_QUICK_USD : CASH_QUICK_LBP;
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
        {fastDeliveryEnabled && onDeliverySpeedChange ? (
          <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
            <p className="text-sm font-bold text-slate-900">Delivery option</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {(
                [
                  {
                    id: "standard" as const,
                    title: "Standard delivery",
                    description: "Regular delivery at the usual pace.",
                    feeUsd: freeDelivery ? 0 : Math.max(0, standardDeliveryFeeUsd),
                  },
                  {
                    id: "fast" as const,
                    title: "Fast delivery",
                    description: "A dedicated driver delivers your order as soon as it is ready.",
                    feeUsd: Math.max(0, fastDeliveryFeeUsd),
                  },
                ] as const
              ).map((option) => {
                const selected = deliverySpeed === option.id;
                const feeLabel =
                  option.feeUsd === 0
                    ? "Free"
                    : formatPrice
                      ? formatPrice(option.feeUsd)
                      : `$${option.feeUsd.toFixed(2)}`;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onDeliverySpeedChange(option.id)}
                    className={`rounded-xl border px-3.5 py-3 text-left transition ${
                      selected
                        ? option.id === "fast"
                          ? "border-amber-400 bg-amber-50 ring-1 ring-amber-200"
                          : "border-violet-400 bg-violet-50 ring-1 ring-violet-200"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {option.id === "fast" ? (
                          <span className="inline-flex items-center gap-1">
                            <Zap className="h-3.5 w-3.5 text-amber-500" strokeWidth={2} aria-hidden />
                            {option.title}
                          </span>
                        ) : (
                          option.title
                        )}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          selected
                            ? option.id === "fast"
                              ? "bg-amber-200 text-amber-900"
                              : "bg-violet-200 text-violet-900"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {feeLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{option.description}</p>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

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

        {onPayingExactChange && onPayingWithChange && onPaymentCurrencyChange ? (
          <CheckoutCard title="Paying with cash?">
            <p className="text-sm leading-relaxed text-slate-600">
              Optional — tell the driver how much you will hand them so they can bring the right change.
            </p>

            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Amount due</p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {formatOrderDue(paymentCurrency, orderTotals)}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {paymentCurrency === "usd"
                  ? `≈ L.L ${Math.round(orderTotalLbp).toLocaleString()} in Lebanese pounds`
                  : `≈ $${orderTotalUsd.toFixed(2)} in US dollars`}
              </p>
            </div>

            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-600">Currency you are paying in</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(
                  [
                    { id: "usd" as const, label: "US Dollars", hint: "$" },
                    { id: "lbp" as const, label: "Lebanese Lira", hint: "L.L" },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      onPaymentCurrencyChange(option.id);
                      onPayingWithChange(null);
                    }}
                    className={`rounded-xl border px-3 py-2.5 text-left transition ${
                      paymentCurrency === option.id
                        ? "border-violet-400 bg-violet-50 ring-1 ring-violet-200"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                    <p className="text-xs text-slate-500">{option.hint}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <button
                type="button"
                onClick={() => {
                  onPayingExactChange(true);
                  onPayingWithChange(null);
                }}
                className={`flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left text-sm transition ${
                  payingExact
                    ? "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <Banknote className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2} aria-hidden />
                <span>
                  <span className="block font-semibold text-slate-900">I have exact change</span>
                  <span className="block text-xs text-slate-500">No change needed from the driver</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => onPayingExactChange(false)}
                className={`flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left text-sm transition ${
                  !payingExact
                    ? "border-violet-400 bg-violet-50 ring-1 ring-violet-200"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-violet-500 text-[10px] font-bold text-violet-600">
                  ¢
                </span>
                <span>
                  <span className="block font-semibold text-slate-900">I need change back</span>
                  <span className="block text-xs text-slate-500">Tell us what bill you are handing over</span>
                </span>
              </button>
            </div>

            {!payingExact ? (
              <div className="mt-3 space-y-2.5">
                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-slate-800">
                    I will hand the driver
                  </span>
                  <div className="flex min-h-[2.75rem] items-center overflow-hidden rounded-[0.85rem] border-[1.5px] border-[#e2e5f5] bg-white focus-within:border-[var(--brand)] focus-within:shadow-[0_0_0_4px_rgba(120,84,255,0.14)]">
                    <span className="shrink-0 pl-3.5 text-sm font-semibold text-slate-400">
                      {paymentCurrency === "usd" ? "$" : "L.L"}
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={paymentCurrency === "usd" ? 0.01 : 1000}
                      value={payingWith ?? ""}
                      onChange={(e) => {
                        const raw = e.target.value.trim();
                        if (!raw) {
                          onPayingWithChange(null);
                          return;
                        }
                        const next = Number(raw);
                        if (!Number.isFinite(next) || next <= 0) {
                          onPayingWithChange(null);
                          return;
                        }
                        onPayingWithChange(
                          paymentCurrency === "usd" ? Math.round(next * 100) / 100 : Math.round(next),
                        );
                      }}
                      placeholder={paymentCurrency === "usd" ? "e.g. 20" : "e.g. 200000"}
                      className="min-w-0 flex-1 border-0 bg-transparent py-3 pl-1.5 pr-3.5 text-sm text-slate-900 outline-none placeholder:text-[#a0a8c4]"
                      inputMode="decimal"
                    />
                  </div>
                </label>

                <div>
                  <p className="mb-1.5 text-xs text-slate-500">Quick amounts</p>
                  <div className="flex flex-wrap gap-2">
                    {quickAmounts.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => onPayingWithChange(amount)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                          payingWith === amount
                            ? "border-violet-400 bg-violet-50 text-violet-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"
                        }`}
                      >
                        {paymentCurrency === "usd"
                          ? `$${amount}`
                          : amount >= 1_000_000
                            ? `${amount / 1_000_000}M`
                            : `${amount / 1000}k`}
                      </button>
                    ))}
                  </div>
                </div>

                {changeDue != null ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                      Change to bring back
                    </p>
                    <p className="mt-1 text-base font-bold text-emerald-900">
                      {formatChangeDue(paymentCurrency, changeDue)}
                    </p>
                  </div>
                ) : payingWith != null ? (
                  <p className="text-xs font-medium text-slate-500">
                    {paymentCurrency === "usd"
                      ? payingWith >= orderTotalUsd
                        ? "No change needed — you have exact or more than the total."
                        : "Enter an amount at or above the order total to see change due."
                      : payingWith >= orderTotalLbp
                        ? "No change needed — you have exact or more than the total."
                        : "Enter an amount at or above the order total to see change due."}
                  </p>
                ) : null}
              </div>
            ) : null}
          </CheckoutCard>
        ) : null}

        {/* Delivery instructions */}
        <CheckoutCard title="Delivery Instructions">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
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
                      setShowInstructionsSheet(true);
                      return;
                    }
                    if (opt.phrase) toggleInstructionPhrase(opt.phrase);
                  }}
                  className={`flex min-h-[4.5rem] w-full flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-center transition ${
                    disabled
                      ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400"
                      : active
                        ? "border-[var(--brand)] bg-white text-[var(--brand)]"
                        : "border-slate-200 bg-white text-slate-700 hover:border-violet-300"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
                  <span className="text-[10px] font-medium leading-tight">{opt.label}</span>
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
