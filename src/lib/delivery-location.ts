import type { LatLng } from "@/lib/geo";
import { addressLabelFromFormatted, reverseGeocodeAddress } from "@/lib/google-geocode";

export const DEFAULT_RADIUS_KM = 10;
export const MIN_RADIUS_KM = 3;
export const MAX_RADIUS_KM = 50;

export type DeliveryLocation = LatLng & {
  address: string;
  label: string;   // e.g. "Home", "Work", "Custom"
  radiusKm: number;
};

const LS_KEY = "zboun_delivery_location";

export function loadDeliveryLocation(): DeliveryLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DeliveryLocation;
    if (
      typeof parsed.lat === "number" &&
      typeof parsed.lng === "number" &&
      typeof parsed.radiusKm === "number"
    ) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function saveDeliveryLocation(loc: DeliveryLocation): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(loc));
}

export function clearDeliveryLocation(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LS_KEY);
}

function geolocationErrorMessage(err: GeolocationPositionError): string {
  const msgs: Record<number, string> = {
    1: "Location access denied. Please allow location in your browser settings.",
    2: "Location unavailable.",
    3: "Location request timed out.",
  };
  return msgs[err.code] ?? "Could not get your location.";
}

/** Browser GPS + reverse geocode for delivery filtering. */
export async function resolveCurrentDeliveryLocation(
  radiusKm: number = DEFAULT_RADIUS_KM,
): Promise<DeliveryLocation> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    throw new Error("Geolocation is not available.");
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
  const label = geocoded ? addressLabelFromFormatted(geocoded) : "Near me";

  return { lat, lng, address, label, radiusKm };
}

export function formatGeolocationError(err: unknown): string {
  if (err instanceof GeolocationPositionError) return geolocationErrorMessage(err);
  return err instanceof Error ? err.message : "Could not get your location.";
}
