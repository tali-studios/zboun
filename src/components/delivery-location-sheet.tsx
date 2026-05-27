"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Navigation,
  X,
  ChevronRight,
  Loader2,
  Home,
  Briefcase,
  Star,
  Plus,
  Bookmark,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useDeliveryLocation } from "@/components/delivery-location-provider";
import { MAX_RADIUS_KM, MIN_RADIUS_KM } from "@/lib/delivery-location";
import {
  addressLabelFromFormatted,
  reverseGeocodeAddress,
} from "@/lib/google-geocode";
import { quickSaveCustomerAddressAction } from "@/app-actions/customer-auth";

const GoogleMapPicker = dynamic(
  () => import("@/components/google-map-picker").then((m) => m.GoogleMapPicker),
  { ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
      </div>
    ),
  },
);

type SavedAddress = {
  id: string;
  label: string;
  nickname: string | null;
  latitude: number;
  longitude: number;
  formatted_address: string | null;
  is_default: boolean;
};

type Props = {
  savedAddresses?: SavedAddress[];
  isLoggedIn?: boolean;
};

type Step = "choose" | "map" | "save";
type MapMode = "use" | "save";

type PendingSave = {
  lat: number;
  lng: number;
  address: string;
};

const LABEL_OPTIONS = [
  { value: "home", label: "Home", icon: Home },
  { value: "work", label: "Work", icon: Briefcase },
  { value: "moms", label: "Mom's", icon: Star },
  { value: "other", label: "Other", icon: MapPin },
] as const;

const LABEL_ICONS: Record<string, React.ReactNode> = {
  home: <Home className="h-4 w-4" />,
  work: <Briefcase className="h-4 w-4" />,
  moms: <Star className="h-4 w-4" />,
  other: <MapPin className="h-4 w-4" />,
  custom: <MapPin className="h-4 w-4" />,
};

const LABEL_COLORS: Record<string, string> = {
  home: "bg-emerald-100 text-emerald-700",
  work: "bg-blue-100 text-blue-700",
  moms: "bg-pink-100 text-pink-700",
  other: "bg-slate-100 text-slate-600",
  custom: "bg-violet-100 text-violet-700",
};

export function DeliveryLocationSheet({ savedAddresses = [], isLoggedIn = false }: Props) {
  const router = useRouter();
  const { location, setLocation, clearLocation, isSheetOpen, closeSheet, radiusKm, setRadiusKm } =
    useDeliveryLocation();

  const [step, setStep] = useState<Step>("choose");
  const [mapMode, setMapMode] = useState<MapMode>("use");
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locateError, setLocateError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [localAddresses, setLocalAddresses] = useState(savedAddresses);
  const [pendingSave, setPendingSave] = useState<PendingSave | null>(null);
  const [saveLabel, setSaveLabel] = useState("home");
  const [saveBuilding, setSaveBuilding] = useState("");
  const [saveApartment, setSaveApartment] = useState("");
  const [savePhone, setSavePhone] = useState("");
  const [saveDriverNotes, setSaveDriverNotes] = useState("");
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalAddresses(savedAddresses);
  }, [savedAddresses]);

  useEffect(() => {
    if (!isSheetOpen) {
      setStep("choose");
      setMapMode("use");
      setLocateError("");
      setSaveError("");
      setPendingSave(null);
      setSaveLabel("home");
      setSaveBuilding("");
      setSaveApartment("");
      setSavePhone("");
      setSaveDriverNotes("");
      setSaveAsDefault(false);
    }
  }, [isSheetOpen]);

  useEffect(() => {
    if (!isSheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (step === "map") setStep(mapMode === "save" && pendingSave ? "save" : "choose");
        else if (step === "save") setStep("choose");
        else closeSheet();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSheetOpen, step, mapMode, pendingSave, closeSheet]);

  async function resolveGpsLocation(): Promise<PendingSave> {
    if (!navigator.geolocation) {
      throw new Error("Geolocation is not supported by your browser.");
    }

    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10_000,
        maximumAge: 60_000,
      });
    });

    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    const geocoded = await reverseGeocodeAddress(lat, lng);
    const address = geocoded ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    return { lat, lng, address };
  }

  function geolocationErrorMessage(err: GeolocationPositionError) {
    const msgs: Record<number, string> = {
      1: "Location access denied. Please allow location in your browser settings.",
      2: "Location unavailable. Try picking on the map.",
      3: "Location request timed out.",
    };
    return msgs[err.code] ?? "Could not get your location.";
  }

  async function useCurrentLocation() {
    setLocating(true);
    setLocateError("");
    try {
      const resolved = await resolveGpsLocation();
      const label = resolved.address
        ? addressLabelFromFormatted(resolved.address)
        : "Near me";

      setLocation({
        lat: resolved.lat,
        lng: resolved.lng,
        address: resolved.address,
        label,
        radiusKm,
      });
      closeSheet();
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        setLocateError(geolocationErrorMessage(err));
      } else {
        setLocateError(err instanceof Error ? err.message : "Could not get your location.");
      }
    } finally {
      setLocating(false);
    }
  }

  async function quickSaveCurrentAs(label: string) {
    if (!isLoggedIn) return;
    setSaving(true);
    setSaveError("");
    setLocateError("");
    try {
      const resolved = await resolveGpsLocation();
      await persistSavedAddress(resolved, label, {}, true);
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        setLocateError(geolocationErrorMessage(err));
      } else {
        setSaveError(err instanceof Error ? err.message : "Could not save address.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function openSaveCurrentLocation() {
    if (!isLoggedIn) return;
    setLocating(true);
    setLocateError("");
    setSaveError("");
    try {
      const resolved = await resolveGpsLocation();
      setPendingSave(resolved);
      setStep("save");
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        setLocateError(geolocationErrorMessage(err));
      } else {
        setLocateError(err instanceof Error ? err.message : "Could not get your location.");
      }
    } finally {
      setLocating(false);
    }
  }

  function handleMapConfirm(result: { lat: number; lng: number; address: string }) {
    if (mapMode === "save") {
      setPendingSave({
        lat: result.lat,
        lng: result.lng,
        address: result.address || `${result.lat.toFixed(6)}, ${result.lng.toFixed(6)}`,
      });
      setStep("save");
      return;
    }

    setLocation({
      ...result,
      label: result.address ? result.address.split(",")[0] : "Custom",
      radiusKm,
    });
    closeSheet();
  }

  async function persistSavedAddress(
    coords: PendingSave,
    label: string,
    extras: {
      building?: string;
      apartment?: string;
      phone?: string;
      driver_notes?: string;
      is_default?: boolean;
    },
    closeAfter = false,
  ) {
    const result = await quickSaveCustomerAddressAction({
      label,
      latitude: coords.lat,
      longitude: coords.lng,
      formatted_address: coords.address,
      building: extras.building,
      apartment: extras.apartment,
      phone: extras.phone,
      driver_notes: extras.driver_notes,
      is_default: extras.is_default,
    });

    if (!result.ok) {
      if (result.error === "not_logged_in") {
        setSaveError("Please sign in to save addresses.");
      } else {
        setSaveError(result.error);
      }
      return;
    }

    setLocalAddresses((prev) => {
      const withoutDefault = extras.is_default
        ? prev.map((a) => ({ ...a, is_default: false }))
        : prev;
      return [result.address, ...withoutDefault];
    });

    const displayLabel =
      result.address.nickname ?? capitalise(result.address.label);

    setLocation({
      lat: coords.lat,
      lng: coords.lng,
      address: coords.address,
      label: displayLabel,
      radiusKm,
    });

    router.refresh();

    if (closeAfter) {
      closeSheet();
    } else {
      setStep("choose");
      setPendingSave(null);
    }
  }

  async function handleSaveFormSubmit() {
    if (!pendingSave) return;
    setSaving(true);
    setSaveError("");
    try {
      await persistSavedAddress(
        pendingSave,
        saveLabel,
        {
          building: saveBuilding,
          apartment: saveApartment,
          phone: savePhone,
          driver_notes: saveDriverNotes,
          is_default: saveAsDefault,
        },
        true,
      );
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save address.");
    } finally {
      setSaving(false);
    }
  }

  function handleSavedAddress(addr: SavedAddress) {
    setLocation({
      lat: addr.latitude,
      lng: addr.longitude,
      address: addr.formatted_address ?? addr.nickname ?? addr.label,
      label: addr.nickname ?? capitalise(addr.label),
      radiusKm,
    });
    closeSheet();
  }

  function openMapForSave() {
    setMapMode("save");
    setStep("map");
  }

  function openMapForUse() {
    setMapMode("use");
    setStep("map");
  }

  if (!isSheetOpen) return null;

  return (
    <>
      <div
        ref={backdropRef}
        className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
        onClick={() => {
          if (step === "map") setStep(mapMode === "save" && pendingSave ? "save" : "choose");
          else if (step === "save") setStep("choose");
          else closeSheet();
        }}
        aria-hidden
      />

      <div
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-[32px] bg-white shadow-2xl"
        style={{ maxHeight: step === "map" ? "100dvh" : "90dvh" }}
        role="dialog"
        aria-modal="true"
        aria-label="Set delivery location"
      >
        {step === "map" ? (
          <div className="flex h-[100dvh] flex-col overflow-hidden rounded-t-[32px]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <button
                onClick={() => setStep(mapMode === "save" && pendingSave ? "save" : "choose")}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                aria-label="Back"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-base font-bold text-slate-900">
                {mapMode === "save" ? "Pin address to save" : "Choose on map"}
              </h2>
              <button
                onClick={closeSheet}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <GoogleMapPicker
                initial={
                  pendingSave
                    ? { lat: pendingSave.lat, lng: pendingSave.lng }
                    : location
                      ? { lat: location.lat, lng: location.lng }
                      : undefined
                }
                onConfirm={handleMapConfirm}
                onClose={() => setStep(mapMode === "save" && pendingSave ? "save" : "choose")}
              />
            </div>
          </div>
        ) : step === "save" && pendingSave ? (
          <div className="flex flex-col overflow-y-auto overscroll-contain">
            <div className="flex justify-center pb-1 pt-3">
              <div className="h-1.5 w-12 rounded-full bg-slate-200" />
            </div>

            <div className="flex items-start justify-between px-5 pb-1 pt-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600">Save address</p>
                <h2 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900">Save this location</h2>
              </div>
              <button
                onClick={() => setStep("choose")}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 transition hover:bg-slate-200"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-slate-600" />
              </button>
            </div>

            <div className="mx-5 mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <p className="text-sm font-semibold text-slate-900">Location pin</p>
                <button
                  type="button"
                  onClick={openMapForSave}
                  className="text-xs font-medium text-teal-600 transition hover:text-teal-700"
                >
                  Refine map
                </button>
              </div>
              <div className="border-t border-slate-100 px-4 py-3">
                <p className="text-xs text-slate-500 line-clamp-2">{pendingSave.address}</p>
              </div>
            </div>

            <div className="px-5 pt-5">
              <p className="mb-2.5 text-[13px] font-semibold text-slate-900">Choose a Nickname</p>
              <div className="grid grid-cols-4 gap-2">
                {LABEL_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSaveLabel(opt.value)}
                      className={`flex flex-col items-center gap-1 border px-2 py-3 text-xs transition ${
                        saveLabel === opt.value
                          ? "border-violet-400 bg-violet-50 text-violet-700"
                          : "border-slate-300 bg-white text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${saveLabel === opt.value ? "text-violet-600" : "text-slate-400"}`} />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2.5 px-5 pt-5">
              <p className="text-lg font-bold tracking-tight text-slate-900">Give us the Details</p>
              <input
                value={saveBuilding}
                onChange={(e) => setSaveBuilding(e.target.value)}
                placeholder="Building"
                className="ui-input rounded-md"
              />
              <input
                value={saveApartment}
                onChange={(e) => setSaveApartment(e.target.value)}
                placeholder="Apartment"
                className="ui-input rounded-md"
              />
              <div className="grid grid-cols-[80px_1fr] gap-2">
                <input
                  type="text"
                  value="LB +961"
                  readOnly
                  className="ui-input rounded-md bg-slate-50 px-3 text-xs font-medium text-slate-600"
                />
                <input
                  value={savePhone}
                  onChange={(e) => setSavePhone(e.target.value)}
                  type="tel"
                  placeholder="Phone Number"
                  className="ui-input rounded-md"
                />
              </div>
              <textarea
                value={saveDriverNotes}
                onChange={(e) => setSaveDriverNotes(e.target.value)}
                placeholder="Instructions For Your Driver? (Optional)"
                rows={2}
                className="ui-input resize-none rounded-md"
              />
            </div>

            <label className="mx-5 mt-4 flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <input
                type="checkbox"
                checked={saveAsDefault}
                onChange={(e) => setSaveAsDefault(e.target.checked)}
                className="h-4 w-4 rounded accent-violet-600"
              />
              <div>
                <p className="text-sm font-semibold text-slate-700">Set as default address</p>
                <p className="text-xs text-slate-400">Pre-selected next time you order</p>
              </div>
            </label>

            {saveError ? (
              <p className="mx-5 mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{saveError}</p>
            ) : null}

            <div className="space-y-2 px-5 pb-8 pt-5">
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleSaveFormSubmit()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-md shadow-violet-400/30 transition hover:brightness-110 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bookmark className="h-4 w-4" />}
                Save address
              </button>
              <button
                type="button"
                onClick={() => setStep("choose")}
                className="w-full py-2 text-sm text-slate-400 transition hover:text-slate-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col overflow-y-auto overscroll-contain">
            <div className="flex justify-center pb-1 pt-3">
              <div className="h-1.5 w-12 rounded-full bg-slate-200" />
            </div>

            <div className="flex items-start justify-between px-5 pb-1 pt-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600">Delivery</p>
                <h2 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900">Where should we deliver?</h2>
              </div>
              <button
                onClick={closeSheet}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 transition hover:bg-slate-200"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-slate-600" />
              </button>
            </div>

            <div className="px-5 pt-4">
              <button
                onClick={() => void useCurrentLocation()}
                disabled={locating || saving}
                className="flex w-full items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-left transition hover:bg-emerald-100 disabled:opacity-60"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
                  {locating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Navigation className="h-5 w-5" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-emerald-700">Use current location</p>
                  <p className="mt-0.5 text-xs text-emerald-600/80">
                    {locating ? "Finding your address…" : "Automatically detect where you are"}
                  </p>
                </div>
              </button>
              {locateError ? (
                <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{locateError}</p>
              ) : null}
            </div>

            <div className="px-5 pt-3">
              <button
                onClick={openMapForUse}
                className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left shadow-sm transition hover:bg-slate-50"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                  <MapPin className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800">Drop a pin on the map</p>
                  <p className="mt-0.5 text-xs text-slate-500">Drag to pinpoint your exact location</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
              </button>
            </div>

            {isLoggedIn ? (
              <div className="mx-5 mt-5 rounded-2xl border border-violet-100 bg-violet-50/50 p-4">
                <p className="text-sm font-bold text-slate-800">Save to my addresses</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Save your current location or a map pin for next time.
                </p>

                <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Save current location as
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {LABEL_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={saving || locating}
                        onClick={() => void quickSaveCurrentAs(opt.value)}
                        className="flex flex-col items-center gap-1 border border-slate-200 bg-white px-1 py-2.5 text-[11px] font-semibold text-slate-600 transition hover:border-violet-300 hover:bg-violet-50 disabled:opacity-50"
                      >
                        <Icon className="h-4 w-4 text-violet-600" />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={saving || locating}
                    onClick={() => void openSaveCurrentLocation()}
                    className="rounded-xl border border-violet-200 bg-white px-3 py-2.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 disabled:opacity-50"
                  >
                    Save with details
                  </button>
                  <button
                    type="button"
                    disabled={saving || locating}
                    onClick={() => {
                      setPendingSave(null);
                      openMapForSave();
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Save from map
                  </button>
                </div>

                {saveError ? (
                  <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{saveError}</p>
                ) : null}
              </div>
            ) : null}

            <div className="mx-5 mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Search radius</p>
                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
                  {radiusKm} km
                </span>
              </div>
              <input
                type="range"
                min={MIN_RADIUS_KM}
                max={MAX_RADIUS_KM}
                step={1}
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full accent-violet-600"
              />
              <div className="mt-1.5 flex justify-between text-[10px] font-medium text-slate-400">
                <span>{MIN_RADIUS_KM} km</span>
                <span>{MAX_RADIUS_KM} km</span>
              </div>
            </div>

            {isLoggedIn && localAddresses.length > 0 ? (
              <div className="px-5 pb-2 pt-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Saved addresses</p>
                <div className="flex flex-col gap-2">
                  {localAddresses.map((addr) => {
                    const colorClass = LABEL_COLORS[addr.label] ?? LABEL_COLORS.other;
                    const icon = LABEL_ICONS[addr.label] ?? LABEL_ICONS.other;
                    return (
                      <button
                        key={addr.id}
                        onClick={() => handleSavedAddress(addr)}
                        className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 text-left shadow-sm transition hover:bg-slate-50"
                      >
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                          {icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {addr.nickname ?? capitalise(addr.label)}
                          </p>
                          {addr.formatted_address ? (
                            <p className="truncate text-xs text-slate-400">{addr.formatted_address}</p>
                          ) : null}
                        </div>
                        {addr.is_default ? (
                          <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-600">
                            Default
                          </span>
                        ) : null}
                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="px-5 pb-6 pt-4">
              {isLoggedIn ? (
                <Link
                  href="/account/addresses/new"
                  onClick={closeSheet}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-violet-300 py-3.5 text-sm font-semibold text-violet-600 transition hover:bg-violet-50"
                >
                  <Plus className="h-4 w-4" />
                  Add address with full form
                </Link>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 py-4 text-center">
                  <p className="text-sm font-semibold text-slate-700">Save your address for next time</p>
                  <p className="mt-1 text-xs text-slate-400">Use your account to reuse locations in one tap.</p>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <Link
                      href="/login?next=/"
                      onClick={closeSheet}
                      className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/signup?next=/"
                      onClick={closeSheet}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Create account
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {location ? (
              <div className="border-t border-slate-100 px-5 pb-6 pt-4">
                <button
                  onClick={() => {
                    clearLocation();
                    closeSheet();
                  }}
                  className="w-full py-2 text-sm text-slate-400 transition hover:text-slate-600"
                >
                  Clear location filter
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
