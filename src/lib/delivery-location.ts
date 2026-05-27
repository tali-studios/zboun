import type { LatLng } from "@/lib/geo";

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
