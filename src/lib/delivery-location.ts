import type { LatLng } from "@/lib/geo";
import { distanceKm } from "@/lib/geo";
import { addressLabelFromFormatted, reverseGeocodeAddress } from "@/lib/google-geocode";

export const DEFAULT_RADIUS_KM = 10;
export const MIN_RADIUS_KM = 3;
export const MAX_RADIUS_KM = 50;
/** Auto-match a saved address when GPS is within this distance (100 m). */
export const SAVED_ADDRESS_MATCH_RADIUS_KM = 0.1;

export type SavedAddressForMatching = {
  id: string;
  label: string;
  nickname: string | null;
  latitude: number;
  longitude: number;
  formatted_address?: string | null;
  is_default?: boolean;
};

export type DeliveryLocation = LatLng & {
  address: string;
  label: string; // e.g. "At Work", "Home", "Near me"
  radiusKm: number;
  savedAddressId?: string;
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

function capitaliseLabel(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function displaySavedAddressLabel(addr: { label: string; nickname: string | null }): string {
  const nick = addr.nickname?.trim();
  if (nick) return nick;
  return capitaliseLabel(addr.label.trim());
}

export function findNearbySavedAddress<T extends SavedAddressForMatching>(
  point: LatLng,
  addresses: T[],
  maxDistanceKm = SAVED_ADDRESS_MATCH_RADIUS_KM,
): T | null {
  let best: { addr: T; dist: number } | null = null;
  for (const addr of addresses) {
    if (!Number.isFinite(addr.latitude) || !Number.isFinite(addr.longitude)) continue;
    const dist = distanceKm(point, { lat: addr.latitude, lng: addr.longitude });
    if (dist > maxDistanceKm) continue;
    if (
      !best ||
      dist < best.dist - 1e-9 ||
      (Math.abs(dist - best.dist) < 1e-9 && addr.is_default && !best.addr.is_default)
    ) {
      best = { addr, dist };
    }
  }
  return best?.addr ?? null;
}

export function deliveryLocationFromSavedAddress(
  addr: SavedAddressForMatching,
  radiusKm: number,
  options?: { atPrefix?: boolean; addressLine?: string },
): DeliveryLocation {
  const name = displaySavedAddressLabel(addr);
  return {
    lat: addr.latitude,
    lng: addr.longitude,
    address: options?.addressLine ?? addr.formatted_address?.trim() ?? name,
    label: options?.atPrefix ? `At ${name}` : name,
    radiusKm,
    savedAddressId: addr.id,
  };
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

/** Browser GPS + reverse geocode; auto-picks a nearby saved address when within ~100 m. */
export async function resolveCurrentDeliveryLocation(
  radiusKm: number = DEFAULT_RADIUS_KM,
  savedAddresses: SavedAddressForMatching[] = [],
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

  const nearby = findNearbySavedAddress({ lat, lng }, savedAddresses);
  if (nearby) {
    return deliveryLocationFromSavedAddress(nearby, radiusKm, {
      atPrefix: true,
      addressLine: nearby.formatted_address?.trim() || address,
    });
  }

  return { lat, lng, address, label, radiusKm };
}

export function formatGeolocationError(err: unknown): string {
  if (err instanceof GeolocationPositionError) return geolocationErrorMessage(err);
  return err instanceof Error ? err.message : "Could not get your location.";
}
