"use client";

import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import {
  COUNTRY_CALLING_CODES,
  dialToSelectIso,
  findCountryByIso,
  formatCountryOptionLabel,
  type CountryCallingCode,
} from "@/lib/country-calling-codes";

type Props = {
  value: string;
  onChange: (dial: string) => void;
  name?: string;
  className?: string;
  /** Matches checkout “Phone number” field styling */
  variant?: "plain" | "card";
};

export function PhoneCountrySelect({
  value,
  onChange,
  name,
  className = "",
  variant = "plain",
}: Props) {
  const selectedIso = useMemo(() => dialToSelectIso(value), [value]);
  const selected = findCountryByIso(selectedIso);
  const selectedLabel = selected ? formatCountryOptionLabel(selected) : value;

  function handleChange(iso2: string) {
    const country = findCountryByIso(iso2);
    if (country) onChange(country.dial);
  }

  const selectEl = (
    <>
      <select
        id="phone-country-code"
        value={selectedIso}
        onChange={(e) => handleChange(e.target.value)}
        className={
          variant === "card"
            ? "w-full min-w-0 cursor-pointer appearance-none truncate border-0 bg-transparent p-0 pr-7 text-sm font-medium text-slate-900 outline-none"
            : "ui-input h-11 w-full min-w-0 cursor-pointer appearance-none truncate rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-9 text-left text-[13px] font-medium leading-tight text-slate-800 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 sm:text-sm"
        }
        aria-label={selected ? `Country, ${selectedLabel}` : "Country"}
        title={selectedLabel}
      >
        {COUNTRY_CALLING_CODES.map((country: CountryCallingCode) => (
          <option key={country.iso2} value={country.iso2}>
            {formatCountryOptionLabel(country)}
          </option>
        ))}
      </select>
      <ChevronDown
        className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 ${
          variant === "card" ? "right-0" : "right-2.5"
        }`}
        aria-hidden
      />
    </>
  );

  if (variant === "card") {
    return (
      <label
        className={`block min-w-0 rounded-xl border border-slate-200 bg-white px-3 pb-2.5 pt-2 shadow-sm ${className}`}
      >
        {name ? <input type="hidden" name={name} value={value} readOnly /> : null}
        <span className="block text-[11px] font-medium text-slate-400">Country</span>
        <div className="relative mt-0.5">{selectEl}</div>
      </label>
    );
  }

  return (
    <div className={`relative min-w-0 ${className}`}>
      {name ? <input type="hidden" name={name} value={value} readOnly /> : null}
      {selectEl}
    </div>
  );
}
