"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  X,
  Loader2,
  Phone,
  Map,
} from "lucide-react";
import {
  saveRestaurantLocationAction,
  deleteRestaurantLocationAction,
  setMainLocationAction,
  type RestaurantLocationRow,
} from "@/app-actions/restaurant";

const GoogleMapPicker = dynamic(
  () => import("@/components/google-map-picker").then((m) => m.GoogleMapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
      </div>
    ),
  },
);

type Props = {
  restaurantId: string;
  initialLocations: RestaurantLocationRow[];
};

type FormMode = { kind: "new" } | { kind: "edit"; loc: RestaurantLocationRow };

const BEIRUT = { lat: 33.8938, lng: 35.5018 };

export function RestaurantLocationsPanel({ restaurantId, initialLocations }: Props) {
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [lat, setLat] = useState<number>(BEIRUT.lat);
  const [lng, setLng] = useState<number>(BEIRUT.lng);
  const [address, setAddress] = useState("");

  function openNew() {
    setFormMode({ kind: "new" });
    setLat(BEIRUT.lat);
    setLng(BEIRUT.lng);
    setAddress("");
    setShowMap(false);
  }

  function openEdit(loc: RestaurantLocationRow) {
    setFormMode({ kind: "edit", loc });
    setLat(loc.latitude);
    setLng(loc.longitude);
    setAddress(loc.address ?? "");
    setShowMap(false);
  }

  function closeForm() {
    setFormMode(null);
    setShowMap(false);
  }

  const editing = formMode?.kind === "edit" ? formMode.loc : null;

  return (
    <div id="locations" className="panel p-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="panel-title">Locations / branches</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Add every physical branch. Customers nearby will find you on the home page.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Add branch
        </button>
      </div>

      {/* Existing locations */}
      {initialLocations.length === 0 && !formMode ? (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 py-10 text-center">
          <MapPin className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm font-semibold text-slate-600">No locations yet</p>
          <p className="mt-0.5 text-xs text-slate-400">
            Customers use locations to find restaurants near them.
          </p>
          <button
            type="button"
            onClick={openNew}
            className="mt-4 flex items-center gap-2 mx-auto rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Add first location
          </button>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {initialLocations.map((loc) => (
            <div
              key={loc.id}
              className={`flex items-start gap-3 rounded-2xl border p-4 ${
                loc.is_main
                  ? "border-violet-200 bg-violet-50/50"
                  : "border-slate-100 bg-white"
              }`}
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <MapPin className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-800">{loc.name}</p>
                  {loc.is_main ? (
                    <span className="flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                      <Star className="h-2.5 w-2.5" /> Main
                    </span>
                  ) : null}
                </div>
                {loc.address ? (
                  <p className="mt-0.5 text-xs text-slate-500">{loc.address}</p>
                ) : (
                  <p className="mt-0.5 text-xs text-slate-400">
                    {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}
                  </p>
                )}
                {loc.phone ? (
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                    <Phone className="h-3 w-3" /> {loc.phone}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {!loc.is_main ? (
                  <form action={setMainLocationAction}>
                    <input type="hidden" name="id" value={loc.id} />
                    <button
                      type="submit"
                      title="Set as main"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-violet-300 hover:text-violet-600"
                    >
                      <Star className="h-3.5 w-3.5" />
                    </button>
                  </form>
                ) : null}
                <button
                  type="button"
                  onClick={() => openEdit(loc)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-violet-300 hover:text-violet-600"
                  title="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <form action={deleteRestaurantLocationAction}>
                  <input type="hidden" name="id" value={loc.id} />
                  <button
                    type="submit"
                    title="Delete"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-300 transition hover:border-red-100 hover:bg-red-50 hover:text-red-500"
                    onClick={(e) => {
                      if (!confirm(`Delete "${loc.name}"?`)) e.preventDefault();
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / edit form */}
      {formMode ? (
        <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50/30 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              {formMode.kind === "new" ? "Add new branch" : `Edit: ${editing?.name}`}
            </h3>
            <button
              type="button"
              onClick={closeForm}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition hover:text-slate-800"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Map picker toggle */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-600">Pin on map</p>
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-1.5 rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-50"
              >
                <Map className="h-3.5 w-3.5" />
                {showMap ? "Close map" : "Pick on map"}
              </button>
            </div>
            {showMap ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200" style={{ height: 360 }}>
                <GoogleMapPicker
                  initial={{ lat, lng }}
                  onConfirm={(r) => {
                    setLat(r.lat);
                    setLng(r.lng);
                    setAddress(r.address);
                    setShowMap(false);
                  }}
                  onClose={() => setShowMap(false)}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs text-slate-500">
                <MapPin className="h-4 w-4 shrink-0 text-violet-400" />
                {address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`}
              </div>
            )}
          </div>

          {/* Form fields */}
          <form action={saveRestaurantLocationAction} className="grid gap-3 md:grid-cols-2">
            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
            <input type="hidden" name="latitude" value={lat} />
            <input type="hidden" name="longitude" value={lng} />
            <input type="hidden" name="address" value={address} />
            <input type="hidden" name="position" value={editing?.position ?? initialLocations.length} />

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Branch name
              </label>
              <input
                name="name"
                required
                defaultValue={editing?.name ?? ""}
                placeholder="e.g. Hamra, Downtown, Airport"
                className="ui-input"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Branch phone (optional)
              </label>
              <input
                name="phone"
                type="tel"
                defaultValue={editing?.phone ?? ""}
                placeholder="+961 1 000 000"
                className="ui-input"
              />
            </div>

            <div className="flex items-center gap-3 md:col-span-2">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  name="is_main"
                  value="true"
                  defaultChecked={editing?.is_main ?? initialLocations.length === 0}
                  onChange={(e) => {
                    // reflect value via hidden input trick isn't needed since checkbox value is "true"
                    void e;
                  }}
                  className="h-4 w-4 accent-violet-600"
                />
                <span className="text-sm font-medium text-slate-700">Mark as main branch</span>
              </label>
            </div>

            <div className="flex gap-3 md:col-span-2">
              <button
                type="button"
                onClick={closeForm}
                className="flex h-10 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex h-10 flex-[2] items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
              >
                <MapPin className="h-4 w-4" />
                {formMode.kind === "new" ? "Add branch" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
