"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Home, Briefcase, Star } from "lucide-react";
import dynamic from "next/dynamic";
import { saveCustomerAddressAction } from "@/app-actions/customer-auth";
import { PhoneNumberField } from "@/components/phone-number-field";
import { Loader2 } from "lucide-react";

const GoogleMapPicker = dynamic(
  () => import("@/components/google-map-picker").then((m) => m.GoogleMapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[22rem] items-center justify-center sm:h-80 md:h-[26rem]">
        <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
      </div>
    ),
  },
);

const BEIRUT = { lat: 33.8938, lng: 35.5018 };

type AddressData = {
  id: string;
  label: string;
  nickname: string | null;
  latitude: number;
  longitude: number;
  formatted_address: string | null;
  street: string | null;
  building: string | null;
  apartment: string | null;
  phone: string | null;
  country_code?: string | null;
  driver_notes: string | null;
  is_default: boolean;
};

type Props = {
  address?: AddressData;
  duplicateNameError?: boolean;
  missingPhoneError?: boolean;
};

const LABEL_OPTIONS = [
  { value: "home", label: "Home", icon: <Home className="h-4 w-4" /> },
  { value: "work", label: "Work", icon: <Briefcase className="h-4 w-4" /> },
  { value: "moms", label: "Mom's", icon: <Star className="h-4 w-4" /> },
  { value: "other", label: "Other", icon: <MapPin className="h-4 w-4" /> },
];

export function AddressForm({ address, duplicateNameError = false, missingPhoneError = false }: Props) {
  const isNew = !address;
  const [label, setLabel] = useState(address?.label ?? "home");
  const [nickname, setNickname] = useState(() => {
    if (!address) return "";
    if (address.label === "other") return address.nickname?.trim() ?? "";
    return "";
  });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    address ? { lat: address.latitude, lng: address.longitude } : null,
  );
  const mapInitialRef = useRef<{ lat: number; lng: number } | null>(
    address ? { lat: address.latitude, lng: address.longitude } : null,
  );
  const [locating, setLocating] = useState(isNew);
  const [formattedAddress, setFormattedAddress] = useState(address?.formatted_address ?? "");
  const [showMap, setShowMap] = useState(isNew);
  const [isDefault, setIsDefault] = useState(address?.is_default ?? false);

  useEffect(() => {
    if (!isNew) return;

    if (!navigator.geolocation) {
      mapInitialRef.current = BEIRUT;
      setCoords(BEIRUT);
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        mapInitialRef.current = next;
        setCoords(next);
        setLocating(false);
      },
      () => {
        mapInitialRef.current = BEIRUT;
        setCoords(BEIRUT);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60_000 },
    );
  }, [isNew]);

  const lat = coords?.lat ?? BEIRUT.lat;
  const lng = coords?.lng ?? BEIRUT.lng;

  return (
    <div className="space-y-6">
      {duplicateNameError ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          You already have an address with this name. Choose a different nickname or category.
        </p>
      ) : null}
      {missingPhoneError ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          Please enter your phone number before saving.
        </p>
      ) : null}
      {/* Form */}
      <form action={saveCustomerAddressAction} className="space-y-5">
        {address ? <input type="hidden" name="id" value={address.id} /> : null}
        <input type="hidden" name="label" value={label} />
        <input type="hidden" name="latitude" value={lat} />
        <input type="hidden" name="longitude" value={lng} />
        <input type="hidden" name="formatted_address" value={formattedAddress} />
        <input type="hidden" name="is_default" value={String(isDefault)} />
        {label !== "other" ? (
          <input
            type="hidden"
            name="nickname"
            value={LABEL_OPTIONS.find((o) => o.value === label)?.label ?? ""}
          />
        ) : null}

        {/* Map location picker — full width on phone */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white max-sm:-mx-2 max-sm:rounded-none max-sm:border-x-0">
          <div className="flex items-center justify-between px-3.5 py-2.5">
            <p className="text-sm font-semibold text-slate-900">Location pin</p>
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className="text-xs font-medium text-teal-600 transition hover:text-teal-700"
            >
              {showMap ? "Hide map" : "Show map"}
            </button>
          </div>

          {showMap ? (
            <div className="h-[22rem] border-t border-slate-100 sm:h-80 md:h-[26rem]">
              {locating ? (
                <div className="flex h-full items-center justify-center bg-slate-50">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-7 w-7 animate-spin text-violet-500" />
                    <p className="mt-2 text-sm font-medium text-slate-600">Finding your location…</p>
                  </div>
                </div>
              ) : (
                <GoogleMapPicker
                  inline
                  initial={coords ?? mapInitialRef.current ?? BEIRUT}
                  onLocationChange={(result) => {
                    setCoords({ lat: result.lat, lng: result.lng });
                    setFormattedAddress(result.address);
                  }}
                />
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowMap(true)}
              className="block w-full border-t border-slate-100 text-left transition hover:bg-slate-50"
            >
              <div className="flex h-32 items-center justify-center bg-slate-100">
                <div className="text-center">
                  <MapPin className="mx-auto h-6 w-6 text-violet-600" />
                  <p className="mt-1 text-xs font-medium text-slate-600">
                    {formattedAddress || `${lat.toFixed(5)}, ${lng.toFixed(5)}`}
                  </p>
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Label selector */}
        <div>
          <p className="mb-2.5 text-[13px] font-semibold text-slate-900">Choose a Nickname</p>
          <div className="grid grid-cols-4 gap-2">
            {LABEL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setLabel(opt.value);
                  if (opt.value === "other") {
                    if (label !== "other") setNickname("");
                  } else {
                    setNickname("");
                  }
                }}
                className={`flex flex-col items-center gap-1 rounded-none border px-2 py-3 text-xs transition ${
                  label === opt.value
                    ? "border-violet-400 bg-violet-50 text-violet-700"
                    : "border-slate-300 bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                <span className={label === opt.value ? "text-violet-600" : "text-slate-400"}>
                  {opt.icon}
                </span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
          {label === "other" ? (
            <div className="mt-3">
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Location name</label>
              <input
                name="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Second Home"
                required
                className="ui-input rounded-md"
              />
            </div>
          ) : null}
        </div>

        <div>
          <p className="mb-2.5 text-[22px] font-bold tracking-tight text-slate-900">Delivery details</p>
          <p className="mb-3 text-sm text-slate-500">
            Your map pin sets the address. Add building or floor info only if it helps the driver.
          </p>
        </div>

        {formattedAddress && !showMap ? (
          <div className="rounded-xl border border-violet-100 bg-violet-50/60 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600">From map</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{formattedAddress}</p>
          </div>
        ) : null}

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Building or block <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            name="building"
            type="text"
            defaultValue={address?.building ?? ""}
            placeholder="e.g. Al-Nakheel Tower, Block C"
            className="ui-input rounded-md"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Floor, apartment, or door <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            name="apartment"
            type="text"
            defaultValue={address?.apartment ?? ""}
            placeholder="e.g. 4th floor, Apt 12B"
            className="ui-input rounded-md"
          />
        </div>

        <PhoneNumberField
          required
          defaultPhone={address?.phone ?? ""}
          defaultCountryCode={address?.country_code ?? undefined}
        />

        {/* Default toggle */}
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="h-4 w-4 rounded accent-violet-600"
          />
          <div>
            <p className="text-sm font-semibold text-slate-700">Set as default address</p>
            <p className="text-xs text-slate-400">This will be pre-selected when ordering</p>
          </div>
        </label>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-md shadow-violet-400/30 transition hover:brightness-110 active:scale-[0.99]"
        >
          <MapPin className="h-4 w-4" />
          {address ? "Save changes" : "Save address"}
        </button>
      </form>
    </div>
  );
}
