"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Phone,
  Map,
} from "lucide-react";
import {
  saveRestaurantLocationAction,
  deleteRestaurantLocationAction,
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
  const location = initialLocations[0] ?? null;
  const hasLocation = Boolean(location);
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [lat, setLat] = useState<number>(BEIRUT.lat);
  const [lng, setLng] = useState<number>(BEIRUT.lng);
  const [address, setAddress] = useState("");

  function openNew() {
    if (hasLocation) return;
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
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="panel-title">Store location</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {hasLocation
              ? "Your store pin on the map — customers nearby can find you on the home page."
              : "Add your store location so customers nearby can find you on the home page."}
          </p>
        </div>
        {!hasLocation ? (
          <button
            type="button"
            onClick={openNew}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Add location
          </button>
        ) : null}
      </div>

      {!hasLocation && !formMode ? (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 py-10 text-center">
          <MapPin className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm font-semibold text-slate-600">No location yet</p>
          <p className="mt-0.5 text-xs text-slate-400">
            Customers use your store location to find you nearby.
          </p>
          <button
            type="button"
            onClick={openNew}
            className="mx-auto mt-4 flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Add location
          </button>
        </div>
      ) : null}

      {location && !formMode ? (
        <div className="mt-4">
          <div className="flex items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50/50 p-4">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <MapPin className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-800">{location.name}</p>
              {location.address ? (
                <p className="mt-0.5 text-xs text-slate-500">{location.address}</p>
              ) : (
                <p className="mt-0.5 text-xs text-slate-400">
                  {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                </p>
              )}
              {location.phone ? (
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                  <Phone className="h-3 w-3" /> {location.phone}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => openEdit(location)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-violet-300 hover:text-violet-600"
                title="Edit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <form action={deleteRestaurantLocationAction}>
                <input type="hidden" name="id" value={location.id} />
                <button
                  type="submit"
                  title="Delete"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-300 transition hover:border-red-100 hover:bg-red-50 hover:text-red-500"
                  onClick={(e) => {
                    if (!confirm("Remove this store location?")) e.preventDefault();
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {formMode ? (
        <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50/30 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              {formMode.kind === "new" ? "Add store location" : "Edit store location"}
            </h3>
            <button
              type="button"
              onClick={closeForm}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition hover:text-slate-800"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

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

          <form action={saveRestaurantLocationAction} className="grid gap-3 md:grid-cols-2">
            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
            <input type="hidden" name="latitude" value={lat} />
            <input type="hidden" name="longitude" value={lng} />
            <input type="hidden" name="address" value={address} />
            <input type="hidden" name="position" value="0" />
            <input type="hidden" name="is_main" value="true" />
            <input type="hidden" name="restaurant_id" value={restaurantId} />

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Location name
              </label>
              <input
                name="name"
                required
                defaultValue={editing?.name ?? "Store location"}
                placeholder="e.g. Store location"
                className="ui-input"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Phone (optional)
              </label>
              <input
                name="phone"
                type="tel"
                defaultValue={editing?.phone ?? ""}
                placeholder="+961 1 000 000"
                className="ui-input"
              />
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
                {formMode.kind === "new" ? "Save location" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
