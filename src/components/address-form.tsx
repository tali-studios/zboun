"use client";

import { useState } from "react";
import { MapPin, Map, Home, Briefcase, Star, ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import { saveCustomerAddressAction } from "@/app-actions/customer-auth";
import { Loader2 } from "lucide-react";

const GoogleMapPicker = dynamic(
  () => import("@/components/google-map-picker").then((m) => m.GoogleMapPicker),
  { ssr: false, loading: () => <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-violet-500" /></div> },
);

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
  driver_notes: string | null;
  is_default: boolean;
};

type Props = {
  address?: AddressData;
};

const LABEL_OPTIONS = [
  { value: "home", label: "Home", icon: <Home className="h-4 w-4" />, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "work", label: "Work", icon: <Briefcase className="h-4 w-4" />, color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "moms", label: "Mom's", icon: <Star className="h-4 w-4" />, color: "bg-pink-100 text-pink-700 border-pink-200" },
  { value: "other", label: "Other", icon: <MapPin className="h-4 w-4" />, color: "bg-slate-100 text-slate-600 border-slate-200" },
];

export function AddressForm({ address }: Props) {
  const [label, setLabel] = useState(address?.label ?? "home");
  const [lat, setLat] = useState(address?.latitude ?? 33.8938);
  const [lng, setLng] = useState(address?.longitude ?? 35.5018);
  const [formattedAddress, setFormattedAddress] = useState(address?.formatted_address ?? "");
  const [showMap, setShowMap] = useState(!address);
  const [isDefault, setIsDefault] = useState(address?.is_default ?? false);

  return (
    <div className="space-y-5">
      {/* Label selector */}
      <div>
        <p className="mb-2 text-sm font-semibold text-slate-700">Address type</p>
        <div className="flex gap-2 flex-wrap">
          {LABEL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setLabel(opt.value)}
              className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
                label === opt.value
                  ? opt.color + " ring-2 ring-violet-200"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map location picker */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-violet-500" />
            <p className="text-sm font-semibold text-slate-700">Pin on map</p>
          </div>
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className="flex items-center gap-1 rounded-xl bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
          >
            <Map className="h-3.5 w-3.5" />
            {showMap ? "Hide map" : "Open map"}
            <ChevronDown className={`h-3.5 w-3.5 transition ${showMap ? "rotate-180" : ""}`} />
          </button>
        </div>

        {showMap ? (
          <div className="h-80">
            <GoogleMapPicker
              initial={{ lat, lng }}
              onConfirm={(result) => {
                setLat(result.lat);
                setLng(result.lng);
                setFormattedAddress(result.address);
                setShowMap(false);
              }}
              onClose={() => setShowMap(false)}
            />
          </div>
        ) : (
          <div className="px-4 py-3">
            <p className="text-sm text-slate-500">
              {formattedAddress || `${lat.toFixed(5)}, ${lng.toFixed(5)}`}
            </p>
          </div>
        )}
      </div>

      {/* Form */}
      <form action={saveCustomerAddressAction} className="space-y-4">
        {address ? <input type="hidden" name="id" value={address.id} /> : null}
        <input type="hidden" name="label" value={label} />
        <input type="hidden" name="latitude" value={lat} />
        <input type="hidden" name="longitude" value={lng} />
        <input type="hidden" name="formatted_address" value={formattedAddress} />
        <input type="hidden" name="is_default" value={String(isDefault)} />

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Nickname (optional)
          </label>
          <input
            name="nickname"
            type="text"
            defaultValue={address?.nickname ?? ""}
            placeholder={`e.g. "${LABEL_OPTIONS.find((l) => l.value === label)?.label ?? "Home"}"`}
            className="ui-input"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Street</label>
            <input
              name="street"
              type="text"
              defaultValue={address?.street ?? ""}
              placeholder="Street name"
              className="ui-input"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Building</label>
            <input
              name="building"
              type="text"
              defaultValue={address?.building ?? ""}
              placeholder="Building no. / name"
              className="ui-input"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Floor / Apartment
          </label>
          <input
            name="apartment"
            type="text"
            defaultValue={address?.apartment ?? ""}
            placeholder="Floor 3, Apt 12"
            className="ui-input"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Phone (optional)
          </label>
          <input
            name="phone"
            type="tel"
            defaultValue={address?.phone ?? ""}
            placeholder="+961 71 000 000"
            className="ui-input"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Delivery notes (optional)
          </label>
          <textarea
            name="driver_notes"
            defaultValue={address?.driver_notes ?? ""}
            placeholder="e.g. Ring the doorbell twice, white gate"
            rows={2}
            className="ui-input resize-none"
          />
        </div>

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
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-4 text-sm font-bold text-white shadow-md shadow-violet-400/30 transition hover:brightness-110 active:scale-[0.99]"
        >
          <MapPin className="h-4 w-4" />
          {address ? "Save changes" : "Save address"}
        </button>
      </form>
    </div>
  );
}
