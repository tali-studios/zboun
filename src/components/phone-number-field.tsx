"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  COUNTRY_CALLING_CODES,
  DEFAULT_COUNTRY_DIAL,
  dialToSelectIso,
  findCountryByIso,
  formatCountryOptionLabel,
  type CountryCallingCode,
} from "@/lib/country-calling-codes";

type Props = {
  name?: string;
  countryCodeName?: string;
  phone?: string;
  defaultPhone?: string;
  onPhoneChange?: (value: string) => void;
  /** @deprecated use phone */
  value?: string;
  /** @deprecated use onPhoneChange */
  onChange?: (value: string) => void;
  /** @deprecated use defaultPhone */
  defaultValue?: string;
  countryCode?: string;
  defaultCountryCode?: string;
  onCountryCodeChange?: (dial: string) => void;
  className?: string;
  labelClassName?: string;
  showLabel?: boolean;
  form?: string;
  required?: boolean;
};

const DEFAULT_LABEL_CLASS =
  "block text-xs font-semibold text-slate-600";

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function PhoneNumberField({
  name = "phone",
  countryCodeName = "country_code",
  phone: phoneProp,
  defaultPhone,
  onPhoneChange,
  value,
  onChange,
  defaultValue,
  countryCode: countryCodeProp,
  defaultCountryCode = DEFAULT_COUNTRY_DIAL,
  onCountryCodeChange,
  className = "",
  labelClassName = DEFAULT_LABEL_CLASS,
  showLabel = true,
  form,
  required = false,
}: Props) {
  const resolvedPhoneProp = phoneProp ?? value;
  const resolvedOnPhoneChange = onPhoneChange ?? onChange;
  const resolvedDefaultPhone = defaultPhone ?? defaultValue ?? "";

  const [internalCountryCode, setInternalCountryCode] = useState(defaultCountryCode);
  const countryCode = countryCodeProp ?? internalCountryCode;

  const selectedIso = useMemo(() => dialToSelectIso(countryCode), [countryCode]);

  const phonePlaceholder = useMemo(() => {
    if (countryCode === "+961") return "03123456";
    return "1234567890";
  }, [countryCode]);

  function setCountryCode(next: string) {
    if (countryCodeProp === undefined) setInternalCountryCode(next);
    onCountryCodeChange?.(next);
  }

  function handleCountryChange(iso2: string) {
    const country = findCountryByIso(iso2);
    if (country) setCountryCode(country.dial);
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = digitsOnly(e.target.value).slice(0, 15);
    e.target.value = next;
    resolvedOnPhoneChange?.(next);
  }

  const phoneInputProps =
    resolvedPhoneProp !== undefined
      ? { value: digitsOnly(resolvedPhoneProp), onChange: handlePhoneChange }
      : { defaultValue: digitsOnly(resolvedDefaultPhone), onChange: handlePhoneChange };

  return (
    <div className={`space-y-1 ${className}`.trim()}>
      {showLabel ? (
        <label htmlFor={`${name}-input`} className={labelClassName}>
          Phone number{required ? " *" : ""}
        </label>
      ) : null}
      <div className="flex h-11 overflow-hidden rounded-md border border-slate-200 bg-white focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100">
        <div className="relative shrink-0 border-r border-slate-200 bg-slate-50">
          <select
            value={selectedIso}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="h-full min-w-[11rem] max-w-[14rem] cursor-pointer appearance-none border-0 bg-transparent py-0 pl-3 pr-8 text-sm font-medium text-slate-800 outline-none"
            aria-label="Country code"
          >
            {COUNTRY_CALLING_CODES.map((country: CountryCallingCode) => (
              <option key={country.iso2} value={country.iso2}>
                {formatCountryOptionLabel(country)}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
        </div>
        <input
          id={`${name}-input`}
          name={name}
          form={form}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="tel-national"
          placeholder={phonePlaceholder}
          required={required}
          className="min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
          {...phoneInputProps}
        />
      </div>
      <input type="hidden" name={countryCodeName} form={form} value={countryCode} readOnly />
    </div>
  );
}
