import codesData from "@/lib/country-calling-codes.json";

export type CountryCallingCode = {
  dial: string;
  iso2: string;
  name: string;
};

export const DEFAULT_COUNTRY_DIAL = "+961";
export const DEFAULT_COUNTRY_ISO = "LB";

export const COUNTRY_CALLING_CODES: CountryCallingCode[] = (
  codesData as CountryCallingCode[]
)
  .slice()
  .sort((a, b) => a.name.localeCompare(b.name, "en"));

/** e.g. Lebanon (+961) */
export function formatCountryOptionLabel(country: CountryCallingCode): string {
  return `${country.name} (${country.dial})`;
}

export function isoToFlag(iso2: string): string {
  const code = iso2.toUpperCase();
  if (code.length !== 2) return "🌐";
  return String.fromCodePoint(
    ...[...code].map((char) => 0x1f1e6 - 65 + char.charCodeAt(0)),
  );
}

export function findCountryByIso(iso2: string): CountryCallingCode | undefined {
  return COUNTRY_CALLING_CODES.find((c) => c.iso2 === iso2);
}

export function findCountryByDial(dial: string): CountryCallingCode | undefined {
  const normalized = dial.trim();
  if (normalized === "+961") {
    return COUNTRY_CALLING_CODES.find((c) => c.iso2 === "LB") ?? findCountryByIso("LB");
  }
  return COUNTRY_CALLING_CODES.find((c) => c.dial === normalized);
}

/** Map stored dial code to ISO for the country dropdown. */
export function dialToSelectIso(dial: string): string {
  const normalized = dial.trim() || DEFAULT_COUNTRY_DIAL;
  if (normalized === "+961") return "LB";
  const matches = COUNTRY_CALLING_CODES.filter((c) => c.dial === normalized);
  if (matches.length === 1) return matches[0].iso2;
  if (matches.length > 1) return matches[0].iso2;
  return DEFAULT_COUNTRY_ISO;
}
