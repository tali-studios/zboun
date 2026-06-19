import { distanceKm, type LatLng } from "@/lib/geo";
import { env } from "@/lib/env";

export const MIN_RESTAURANT_DELIVERY_RADIUS_KM = 1;
export const MAX_RESTAURANT_DELIVERY_RADIUS_KM = 50;

export function normalizeRestaurantDeliveryRadiusKm(value: number | null | undefined): number {
  const fallback = env.defaultDeliveryRadiusKm;
  const n = value != null && Number.isFinite(Number(value)) ? Number(value) : fallback;
  return (
    Math.round(
      Math.min(MAX_RESTAURANT_DELIVERY_RADIUS_KM, Math.max(MIN_RESTAURANT_DELIVERY_RADIUS_KM, n)) * 100,
    ) / 100
  );
}

type RestaurantGeoSource = {
  latitude?: number | null;
  longitude?: number | null;
  branches?: Array<{ latitude: number; longitude: number }> | null;
};

export function collectRestaurantGeoPoints(restaurant: RestaurantGeoSource): LatLng[] {
  const points: LatLng[] = [];
  for (const branch of restaurant.branches ?? []) {
    if (Number.isFinite(branch.latitude) && Number.isFinite(branch.longitude)) {
      points.push({ lat: branch.latitude, lng: branch.longitude });
    }
  }
  if (restaurant.latitude != null && restaurant.longitude != null) {
    points.push({ lat: restaurant.latitude, lng: restaurant.longitude });
  }
  return points;
}

export function minDistanceToRestaurantKm(user: LatLng, restaurant: RestaurantGeoSource): number | null {
  const points = collectRestaurantGeoPoints(restaurant);
  if (points.length === 0) return null;
  return Math.min(...points.map((point) => distanceKm(user, point)));
}

/** Max distance to show / deliver: the smaller of the customer's search radius and the restaurant's range. */
export function effectiveSearchRadiusKm(
  userRadiusKm: number,
  restaurantRadiusKm: number | null | undefined,
): number {
  return Math.min(userRadiusKm, normalizeRestaurantDeliveryRadiusKm(restaurantRadiusKm));
}

export function isWithinRestaurantDeliveryRange(
  user: LatLng,
  restaurant: RestaurantGeoSource & { delivery_radius_km?: number | null },
): boolean | null {
  const distKm = minDistanceToRestaurantKm(user, restaurant);
  if (distKm === null) return null;
  return distKm <= normalizeRestaurantDeliveryRadiusKm(restaurant.delivery_radius_km);
}
