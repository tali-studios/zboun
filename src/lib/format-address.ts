/** Build a single line for WhatsApp / delivery from saved address fields. */
export function formatSavedAddressLine(addr: {
  formatted_address?: string | null;
  street?: string | null;
  building?: string | null;
  apartment?: string | null;
  driver_notes?: string | null;
  nickname?: string | null;
  label?: string;
}): string {
  const parts = [
    addr.formatted_address?.trim(),
    addr.street?.trim(),
    addr.building?.trim() ? `Bldg ${addr.building.trim()}` : null,
    addr.apartment?.trim() ? `Apt ${addr.apartment.trim()}` : null,
    addr.driver_notes?.trim() ? `Notes: ${addr.driver_notes.trim()}` : null,
  ].filter(Boolean) as string[];

  if (parts.length > 0) return parts.join(", ");

  return addr.nickname?.trim() || addr.label || "";
}
