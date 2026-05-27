"use client";

import { useState } from "react";
import { MapPin, Home, Briefcase, Star } from "lucide-react";
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
  { value: "home", label: "Home", icon: <Home className="h-4 w-4" /> },
  { value: "work", label: "Work", icon: <Briefcase className="h-4 w-4" /> },
  { value: "moms", label: "Mom's", icon: <Star className="h-4 w-4" /> },
  { value: "other", label: "Other", icon: <MapPin className="h-4 w-4" /> },
];

export function AddressForm({ address }: Props) {
  const [label, setLabel] = useState(address?.label ?? "home");
  const [lat, setLat] = useState(address?.latitude ?? 33.8938);
  const [lng, setLng] = useState(address?.longitude ?? 35.5018);
  const [formattedAddress, setFormattedAddress] = useState(address?.formatted_address ?? "");
  const [showMap, setShowMap] = useState(!address);
  const [isDefault, setIsDefault] = useState(address?.is_default ?? false);

  return (
    <div className="space-y-6">
      {/* Form */}
      <form action={saveCustomerAddressAction} className="space-y-5">
        {address ? <input type="hidden" name="id" value={address.id} /> : null}
        <input type="hidden" name="label" value={label} />
        <input type="hidden" name="latitude" value={lat} />
        <input type="hidden" name="longitude" value={lng} />
        <input type="hidden" name="formatted_address" value={formattedAddress} />
        <input type="hidden" name="is_default" value={String(isDefault)} />
        <input type="hidden" name="nickname" defaultValue={address?.nickname ?? ""} />

        {/* Map location picker */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between px-3.5 py-2.5">
            <p className="text-sm font-semibold text-slate-900">Location pin</p>
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className="text-xs font-medium text-teal-600 transition hover:text-teal-700"
            >
              {showMap ? "Done map" : "Refine map"}
            </button>
          </div>

          {showMap ? (
            <div className="h-72 border-t border-slate-100">
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
                onClick={() => setLabel(opt.value)}
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
        </div>

        <div>
          <p className="mb-2.5 text-[22px] font-bold tracking-tight text-slate-900">Give us the Details</p>
        </div>

        <div>
          <input
            name="street"
            type="text"
            defaultValue={address?.street ?? ""}
            placeholder="Street"
            className="ui-input rounded-md"
          />
        </div>

        <div>
          <input
            name="building"
            type="text"
            defaultValue={address?.building ?? ""}
            placeholder="Building"
            className="ui-input rounded-md"
          />
        </div>

        <div>
          <input
            name="apartment"
            type="text"
            defaultValue={address?.apartment ?? ""}
            placeholder="Apartment"
            className="ui-input rounded-md"
          />
        </div>

        <div className="grid grid-cols-[80px_1fr] gap-2">
          <input
            type="text"
            value="LB +961"
            readOnly
            className="ui-input rounded-md bg-slate-50 px-3 text-xs font-medium text-slate-600"
          />
          <input
            name="phone"
            type="tel"
            defaultValue={address?.phone ?? ""}
            placeholder="Phone Number"
            className="ui-input rounded-md"
          />
        </div>

        <div>
          <textarea
            name="driver_notes"
            defaultValue={address?.driver_notes ?? ""}
            placeholder="Instructions For Your Driver? (Optional)"
            rows={2}
            className="ui-input resize-none rounded-md"
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
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-md shadow-violet-400/30 transition hover:brightness-110 active:scale-[0.99]"
        >
          <MapPin className="h-4 w-4" />
          {address ? "Save changes" : "Save address"}
        </button>
      </form>
    </div>
  );
}
