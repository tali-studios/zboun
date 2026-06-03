"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  X,
  ChevronRight,
  Home,
  Briefcase,
  Star,
  Navigation,
  Loader2,
} from "lucide-react";
import { useDeliveryLocation } from "@/components/delivery-location-provider";
import { MAX_RADIUS_KM, MIN_RADIUS_KM } from "@/lib/delivery-location";

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

const LABEL_ICONS: Record<string, React.ReactNode> = {
  home: <Home className="h-4 w-4" />,
  work: <Briefcase className="h-4 w-4" />,
  moms: <Star className="h-4 w-4" />,
  other: <MapPin className="h-4 w-4" />,
  custom: <MapPin className="h-4 w-4" />,
};

const LABEL_COLORS: Record<string, string> = {
  home: "bg-violet-100 text-violet-700",
  work: "bg-blue-100 text-blue-700",
  moms: "bg-pink-100 text-pink-700",
  other: "bg-slate-100 text-slate-600",
  custom: "bg-violet-100 text-violet-700",
};

export function DeliveryLocationSheet({ savedAddresses = [], isLoggedIn = false }: Props) {
  const {
    location,
    setLocation,
    closeSheet,
    isSheetOpen,
    radiusKm,
    setRadiusKm,
    isResolvingLocation,
    locateError,
    clearLocation,
  } = useDeliveryLocation();

  const [localAddresses, setLocalAddresses] = useState(savedAddresses);

  useEffect(() => {
    setLocalAddresses(savedAddresses);
  }, [savedAddresses]);

  if (!isSheetOpen) return null;

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

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
        onClick={closeSheet}
        aria-hidden
      />

      <div
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] flex-col overflow-hidden rounded-t-[32px] bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Choose delivery address"
      >
        <div className="flex flex-col overflow-y-auto overscroll-contain">
          <div className="flex items-start justify-between px-5 pb-1 pt-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600">Delivery</p>
              <h2 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900">Saved addresses</h2>
              <p className="mt-1 text-xs text-slate-500">
                {isResolvingLocation
                  ? "Finding your current location…"
                  : location
                    ? `Showing restaurants near ${location.label}`
                    : "Choose a saved address below"}
              </p>
            </div>
            <button
              onClick={closeSheet}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 transition hover:bg-slate-200"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-slate-600" />
            </button>
          </div>

          {location ? (
            <div className="mx-5 mt-3 flex items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50/80 px-4 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white">
                {isResolvingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wide text-violet-600">Active</p>
                <p className="truncate text-sm font-semibold text-slate-800">{location.label}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  clearLocation();
                }}
                className="shrink-0 text-xs font-semibold text-violet-600 hover:text-violet-800"
              >
                Use GPS
              </button>
            </div>
          ) : null}

          {locateError ? (
            <p className="mx-5 mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">{locateError}</p>
          ) : null}

          <div className="mx-5 mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
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
              <div className="flex flex-col gap-2">
                {localAddresses.map((addr) => {
                  const colorClass = LABEL_COLORS[addr.label] ?? LABEL_COLORS.other;
                  const icon = LABEL_ICONS[addr.label] ?? LABEL_ICONS.other;
                  return (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => handleSavedAddress(addr)}
                      className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 text-left shadow-sm transition hover:border-violet-200 hover:bg-violet-50/50"
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${colorClass}`}
                      >
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
          ) : (
            <div className="px-5 py-6 text-center">
              {isLoggedIn ? (
                <>
                  <p className="text-sm font-semibold text-slate-700">No saved addresses yet</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Your current location is used automatically. Add addresses from your account to switch quickly.
                  </p>
                  <Link
                    href="/account/addresses/new"
                    onClick={closeSheet}
                    className="mt-4 inline-flex rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                  >
                    Add address
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-700">Sign in to save addresses</p>
                  <p className="mt-1 text-xs text-slate-500">
                    We use your current location automatically. Sign in to pick from saved addresses next time.
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2">
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
                </>
              )}
            </div>
          )}

          <div className="px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2" />
        </div>
      </div>
    </>
  );
}

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
