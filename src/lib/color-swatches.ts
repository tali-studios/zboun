/**
 * Map fashion color names → CSS swatch colors for the customer picker.
 * Unknown names fall back to a neutral chip (letter initial).
 */
const COLOR_SWATCH_MAP: Record<string, string> = {
  black: "#111111",
  white: "#f5f5f5",
  ivory: "#fffff0",
  cream: "#fffdd0",
  beige: "#d8c3a5",
  nude: "#e3bc9a",
  khaki: "#c3b091",
  tan: "#d2b48c",
  brown: "#6b3e26",
  chocolate: "#3d1c02",
  camel: "#c19a6b",
  navy: "#1b2a4a",
  "navy blue": "#1b2a4a",
  blue: "#2f5faa",
  "light blue": "#9ec9e8",
  sky: "#87ceeb",
  denim: "#3b5f7d",
  teal: "#008080",
  turquoise: "#40e0d0",
  green: "#2e7d4f",
  "mint green": "#c5e1c5",
  mint: "#c5e1c5",
  olive: "#708238",
  sage: "#9caf88",
  red: "#c62828",
  burgundy: "#6d1a28",
  maroon: "#800000",
  wine: "#722f37",
  pink: "#e89bb5",
  "dusty pink": "#d4a5a5",
  rose: "#e8a0bf",
  coral: "#ff7f50",
  orange: "#e67e22",
  yellow: "#f1c40f",
  mustard: "#d4a017",
  gold: "#c9a227",
  purple: "#7e57c2",
  lavender: "#b57edc",
  lilac: "#c8a2c8",
  violet: "#8f00ff",
  grey: "#9e9e9e",
  gray: "#9e9e9e",
  "light grey": "#d0d0d0",
  "light gray": "#d0d0d0",
  charcoal: "#36454f",
  silver: "#c0c0c0",
  multicolor: "linear-gradient(135deg,#ef4444,#eab308,#22c55e,#3b82f6,#a855f7)",
  multi: "linear-gradient(135deg,#ef4444,#eab308,#22c55e,#3b82f6,#a855f7)",
};

export function resolveColorSwatch(name: string): {
  background: string;
  isLight: boolean;
  known: boolean;
} {
  const key = name.trim().toLowerCase();
  const mapped = COLOR_SWATCH_MAP[key];
  if (mapped) {
    const isLight =
      key.includes("white") ||
      key.includes("cream") ||
      key.includes("ivory") ||
      key.includes("beige") ||
      key.includes("mint") ||
      key.includes("yellow") ||
      key.includes("light");
    return { background: mapped, isLight, known: true };
  }
  // Try bare hex (#fff / #ffffff)
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(key)) {
    return { background: key, isLight: false, known: true };
  }
  return { background: "#e5e7eb", isLight: true, known: false };
}
