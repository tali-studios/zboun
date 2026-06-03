/** Display name shown in lists (nickname, else category label). */
export function customerAddressDisplayName(label: string, nickname?: string | null): string {
  const nick = String(nickname ?? "").trim();
  if (nick) return nick;

  switch (String(label ?? "other").trim().toLowerCase()) {
    case "home":
      return "Home";
    case "work":
      return "Work";
    case "moms":
      return "Mom's";
    case "other":
      return "Other";
    default: {
      const l = String(label ?? "").trim();
      return l ? l.charAt(0).toUpperCase() + l.slice(1) : "Other";
    }
  }
}

export function normalizeAddressNameKey(name: string): string {
  return name.trim().toLowerCase();
}

export function duplicateAddressNameMessage(name: string): string {
  return `You already have an address named "${name}". Use a different nickname.`;
}

/** Nickname sent when saving (custom name required for "other"). */
export function resolveAddressNicknameForSave(
  label: string,
  nickname: string,
  categoryLabel: string,
): { ok: true; nickname: string } | { ok: false; error: string } {
  const trimmed = nickname.trim();
  if (label === "other") {
    if (!trimmed) {
      return { ok: false, error: "Please enter a name for this location (e.g. Second Home)." };
    }
    return { ok: true, nickname: trimmed };
  }
  return { ok: true, nickname: trimmed || categoryLabel };
}
