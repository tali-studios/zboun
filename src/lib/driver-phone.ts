import { DEFAULT_COUNTRY_DIAL } from "@/lib/country-calling-codes";

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function parseStoredPhone(phone: string | null | undefined) {
  const trimmed = phone?.trim() ?? "";
  if (!trimmed) {
    return { countryCode: DEFAULT_COUNTRY_DIAL, localPhone: "" };
  }

  const digits = digitsOnly(trimmed);
  if (trimmed.startsWith("+") || digits.startsWith("961")) {
    const national = digits.startsWith("961") ? digits.slice(3) : digits;
    return { countryCode: DEFAULT_COUNTRY_DIAL, localPhone: national };
  }

  return { countryCode: DEFAULT_COUNTRY_DIAL, localPhone: digits };
}

export function normalizeOptionalDriverPhone(
  raw: string,
  countryCode = DEFAULT_COUNTRY_DIAL,
): { ok: true; phone: string | null } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: true, phone: null };

  if (/[a-zA-Z]/.test(trimmed)) {
    return { ok: false, error: "Phone number cannot contain letters." };
  }

  const ccDigits = digitsOnly(countryCode);
  if (!ccDigits) {
    return { ok: false, error: "Choose a valid country code." };
  }

  let national = digitsOnly(trimmed);
  if (!national) {
    return { ok: false, error: "Phone number must contain digits only." };
  }

  if (national.startsWith(ccDigits) && national.length > ccDigits.length) {
    national = national.slice(ccDigits.length);
  }
  if (national.startsWith("0")) {
    national = national.slice(1);
  }

  if (countryCode === DEFAULT_COUNTRY_DIAL) {
    if (national.length < 7 || national.length > 8) {
      return {
        ok: false,
        error: "Use a Lebanese number like 03123456 or 71234567 (7–8 digits, no +961).",
      };
    }
  } else if (national.length < 6 || national.length > 15) {
    return { ok: false, error: "Enter a valid phone number for the selected country." };
  }

  return { ok: true, phone: `+${ccDigits}${national}` };
}

/** Canonical E.164-style value for duplicate checks (handles legacy stored formats). */
export function canonicalDriverPhone(phone: string | null | undefined): string | null {
  const trimmed = phone?.trim() ?? "";
  if (!trimmed) return null;

  const parsed = normalizeOptionalDriverPhone(trimmed, DEFAULT_COUNTRY_DIAL);
  if (parsed.ok && parsed.phone) return parsed.phone;

  const digits = digitsOnly(trimmed);
  if (!digits) return null;
  if (digits.startsWith("961") && digits.length > 3) return `+${digits}`;
  const national = digits.startsWith("0") ? digits.slice(1) : digits;
  return national ? `+961${national}` : null;
}

export function formatDriverPhoneHint(countryCode = DEFAULT_COUNTRY_DIAL) {
  if (countryCode === DEFAULT_COUNTRY_DIAL) {
    return "Local number only — e.g. 03123456 or 71234567. We save it as +961…";
  }
  return "Digits only — country code is added automatically.";
}
