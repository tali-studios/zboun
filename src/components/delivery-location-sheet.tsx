"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, X, ChevronRight, Loader2, Home, Briefcase, Star, Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { useDeliveryLocation } from "@/components/delivery-location-provider";
import { DEFAULT_RADIUS_KM, MAX_RADIUS_KM, MIN_RADIUS_KM } from "@/lib/delivery-location";
import {
  addressLabelFromFormatted,
  reverseGeocodeAddress,
} from "@/lib/google-geocode";

const GoogleMapPicker = dynamic(
  () => import("@/components/google-map-picker").then((m) => m.GoogleMapPicker),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-violet-500" /></div> },
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

type Step = "choose" | "map";

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
  const { location, setLocation, clearLocation, isSheetOpen, closeSheet, radiusKm, setRadiusKm } =
    useDeliveryLocation();

  const [step, setStep] = useState<Step>("choose");
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState("");
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSheetOpen) {
      setStep("choose");
      setLocateError("");
    }
  }, [isSheetOpen]);

  useEffect(() => {
    if (!isSheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (step === "map") setStep("choose");
        else closeSheet();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSheetOpen, step, closeSheet]);

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocateError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setLocateError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const geocoded = await reverseGeocodeAddress(lat, lng);
        const address =
          geocoded ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        const label = geocoded
          ? addressLabelFromFormatted(geocoded)
          : "Near me";

        setLocation({
          lat,
          lng,
          address,
          label,
          radiusKm,
        });
        setLocating(false);
        closeSheet();
      },
      (err) => {
        setLocating(false);
        const msgs: Record<number, string> = {
          1: "Location access denied. Please allow location in your browser settings.",
          2: "Location unavailable. Try picking on the map.",
          3: "Location request timed out.",
        };
        setLocateError(msgs[err.code] ?? "Could not get your location.");
      },
      { timeout: 10_000, maximumAge: 60_000 },
    );
  }

  function handleMapConfirm(result: { lat: number; lng: number; address: string }) {
    setLocation({
      ...result,
      label: result.address ? result.address.split(",")[0] : "Custom",
      radiusKm,
    });
    closeSheet();
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

  if (!isSheetOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
        onClick={() => {
          if (step === "map") setStep("choose");
          else closeSheet();
        }}
        aria-hidden
      />

      {/* Sheet */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-[32px] bg-white shadow-2xl"
        style={{ maxHeight: step === "map" ? "100dvh" : "90dvh" }}
        role="dialog"
        aria-modal="true"
        aria-label="Set delivery location"
      >
        {step === "map" ? (
          /* ── Full-map step ── */
          <div className="flex h-[100dvh] flex-col overflow-hidden rounded-t-[32px]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <button
                onClick={() => setStep("choose")}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                aria-label="Back"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-base font-bold text-slate-900">Choose on map</h2>
              <button
                onClick={closeSheet}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Map fills remaining space */}
            <div className="flex-1 overflow-hidden">
              <GoogleMapPicker
                initial={location ? { lat: location.lat, lng: location.lng } : undefined}
                onConfirm={handleMapConfirm}
                onClose={() => setStep("choose")}
              />
            </div>
          </div>
        ) : (
          /* ── Choose method step ── */
          <div className="flex flex-col overflow-y-auto overscroll-contain">
            {/* Drag pill */}
            <div className="flex justify-center pb-1 pt-3">
              <div className="h-1.5 w-12 rounded-full bg-slate-200" />
            </div>

            {/* Header */}
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

            {/* Current location */}
            <div className="px-5 pt-4">
              <button
                onClick={useCurrentLocation}
                disabled={locating}
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

            {/* Choose on map */}
            <div className="px-5 pt-3">
              <button
                onClick={() => setStep("map")}
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

            {/* Radius slider */}
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

            {/* Saved addresses (if logged in) */}
            {isLoggedIn && savedAddresses.length > 0 ? (
              <div className="px-5 pb-2 pt-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Saved addresses</p>
                <div className="flex flex-col gap-2">
                  {savedAddresses.map((addr) => {
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

            {/* Sign in prompt / add address */}
            <div className="px-5 pb-6 pt-4">
              {isLoggedIn ? (
                <a
                  href="/account"
                  onClick={closeSheet}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-violet-300 py-3.5 text-sm font-semibold text-violet-600 transition hover:bg-violet-50"
                >
                  <Plus className="h-4 w-4" />
                  Manage saved addresses
                </a>
              ) : (
                <a
                  href="/login"
                  onClick={closeSheet}
                  className="flex w-full flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-slate-200 py-4 text-center transition hover:bg-slate-50"
                >
                  <p className="text-sm font-semibold text-slate-700">Save your address for next time</p>
                  <p className="text-xs text-slate-400">
                    <span className="font-medium text-violet-600">Sign in</span> or{" "}
                    <span className="font-medium text-violet-600">create a free account</span>
                  </p>
                </a>
              )}
            </div>

            {/* Clear location */}
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
