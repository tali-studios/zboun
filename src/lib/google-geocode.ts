import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

let geocoderReady: Promise<google.maps.Geocoder | null> | null = null;

function loadGeocoder(): Promise<google.maps.Geocoder | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  if (!apiKey) return Promise.resolve(null);

  if (!geocoderReady) {
    setOptions({ key: apiKey, v: "weekly" });
    geocoderReady = importLibrary("geocoding")
      .then((lib) => new lib.Geocoder())
      .catch(() => null);
  }
  return geocoderReady;
}

/** Turn lat/lng into a human-readable street address via Google Geocoding. */
export async function reverseGeocodeAddress(lat: number, lng: number): Promise<string | null> {
  const geocoder = await loadGeocoder();
  if (!geocoder) return null;

  return new Promise((resolve) => {
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results?.[0]?.formatted_address) {
        resolve(results[0].formatted_address);
        return;
      }
      resolve(null);
    });
  });
}

export function addressLabelFromFormatted(address: string): string {
  const first = address.split(",")[0]?.trim();
  return first || address;
}

export function isPlaceholderLocationText(text: string): boolean {
  const t = text.trim().toLowerCase();
  return t === "current location" || t === "custom" || t === "my location";
}
