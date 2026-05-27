"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { MapPin, Search, Loader2 } from "lucide-react";

export type MapPickerResult = {
  lat: number;
  lng: number;
  address: string;
};

type Props = {
  initial?: { lat: number; lng: number };
  onConfirm: (result: MapPickerResult) => void;
  onClose: () => void;
};

const BEIRUT = { lat: 33.8938, lng: 35.5018 };

export function GoogleMapPicker({ initial, onConfirm, onClose }: Props) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const currentPos = useRef<{ lat: number; lng: number }>(initial ?? BEIRUT);

  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [noApiKey, setNoApiKey] = useState(false);

  const reverseGeocode = useCallback((lat: number, lng: number) => {
    if (!geocoderRef.current) return;
    geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        setAddress(results[0].formatted_address ?? "");
      }
    });
  }, []);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setNoApiKey(true);
      setIsLoading(false);
      return;
    }

    setOptions({ key: apiKey, v: "weekly", libraries: ["places", "geocoding", "marker"] });

    let cancelled = false;

    async function initMap() {
      try {
        const [mapsLib, markerLib, geocodingLib, placesLib] = await Promise.all([
          importLibrary("maps"),
          importLibrary("marker"),
          importLibrary("geocoding"),
          importLibrary("places"),
        ]);

        if (cancelled || !mapDivRef.current) return;

        const center = initial ?? BEIRUT;
        const map = new mapsLib.Map(mapDivRef.current, {
          center,
          zoom: 15,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "greedy",
          mapId: "zboun_delivery",
        });

        const geocoder = new geocodingLib.Geocoder();
        geocoderRef.current = geocoder;

        const pinEl = document.createElement("div");
        pinEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#7C3AED">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>`;
        pinEl.style.cursor = "grab";

        const marker = new markerLib.AdvancedMarkerElement({
          position: center,
          map,
          content: pinEl,
          gmpDraggable: true,
          title: "Your delivery location",
        });
        markerRef.current = marker;
        currentPos.current = center;
        reverseGeocode(center.lat, center.lng);

        marker.addListener("dragend", () => {
          const pos = marker.position as google.maps.LatLng | null;
          if (pos) {
            const lat = typeof pos.lat === "function" ? pos.lat() : (pos as unknown as { lat: number }).lat;
            const lng = typeof pos.lng === "function" ? pos.lng() : (pos as unknown as { lng: number }).lng;
            currentPos.current = { lat, lng };
            reverseGeocode(lat, lng);
          }
        });

        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            marker.position = { lat, lng };
            currentPos.current = { lat, lng };
            reverseGeocode(lat, lng);
          }
        });

        // Places autocomplete on the search input
        const inputEl = document.getElementById("map-search-input") as HTMLInputElement | null;
        if (inputEl) {
          const autocomplete = new placesLib.Autocomplete(inputEl, {
            fields: ["geometry", "formatted_address", "name"],
          });
          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (place.geometry?.location) {
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              map.panTo({ lat, lng });
              map.setZoom(17);
              marker.position = { lat, lng };
              currentPos.current = { lat, lng };
              const addr = place.formatted_address ?? place.name ?? "";
              setAddress(addr);
              if (inputEl) inputEl.value = addr;
            }
          });
        }

        setIsLoading(false);
      } catch {
        setIsLoading(false);
      }
    }

    initMap();
    return () => { cancelled = true; };
  }, [initial, reverseGeocode]);

  if (noApiKey) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-10 text-center">
        <MapPin className="h-10 w-10 text-violet-400" />
        <p className="text-sm text-slate-500">
          Google Maps is not configured.
          <br />
          Add{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>{" "}
          to your environment variables.
        </p>
        <button
          onClick={onClose}
          className="rounded-full bg-violet-600 px-6 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Search bar */}
      <div className="relative z-10 m-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id="map-search-input"
          type="text"
          placeholder="Search for a street or building…"
          className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-4 text-sm shadow-md outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
        />
      </div>

      {/* Map canvas */}
      <div className="relative flex-1 overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          </div>
        )}
        <div ref={mapDivRef} className="h-full w-full" />
        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center">
          <div className="max-w-xs rounded-2xl bg-slate-900/80 px-4 py-2 text-center text-xs font-medium text-white backdrop-blur-sm">
            Drag the pin or tap the map to set your location
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 bg-white px-4 py-4">
        {address ? (
          <p className="mb-3 flex items-start gap-2 text-sm text-slate-600">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
            <span className="line-clamp-2">{address}</span>
          </p>
        ) : null}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex h-12 flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm({ ...currentPos.current, address })}
            className="flex h-12 flex-[2] items-center justify-center gap-2 rounded-2xl bg-violet-600 text-sm font-semibold text-white shadow-md shadow-violet-600/25 transition hover:bg-violet-700"
          >
            <MapPin className="h-4 w-4" />
            Confirm location
          </button>
        </div>
      </div>
    </div>
  );
}
