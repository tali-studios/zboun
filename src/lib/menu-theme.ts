import { BRAND_HEX, BRAND_HEX_ACCENT, BRAND_HEX_DEEP } from "@/lib/brand";
import type { CSSProperties } from "react";

export type MenuTheme = {
  primary: string;
  accent: string;
  deep: string;
  softBg: string;
  softBorder: string;
  softText: string;
};

const DEFAULT_THEME: MenuTheme = {
  primary: BRAND_HEX,
  accent: BRAND_HEX_ACCENT,
  deep: BRAND_HEX_DEEP,
  softBg: "#f5f3ff",
  softBorder: "#ddd6fe",
  softText: "#4c1d95",
};

function parseHexRgb(input: string): { r: number; g: number; b: number } | null {
  const hex = input.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

function toHex({ r, g, b }: { r: number; g: number; b: number }) {
  return `#${[r, g, b]
    .map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, "0"))
    .join("")}`;
}

function mix(
  base: { r: number; g: number; b: number },
  target: { r: number; g: number; b: number },
  amount: number,
) {
  return {
    r: base.r + (target.r - base.r) * amount,
    g: base.g + (target.g - base.g) * amount,
    b: base.b + (target.b - base.b) * amount,
  };
}

export const MENU_THEME_PRESETS = [
  { id: "zboun", label: "Zboun purple", color: "#7854ff" },
  { id: "rose", label: "Rose", color: "#e11d48" },
  { id: "orange", label: "Orange", color: "#ea580c" },
  { id: "amber", label: "Amber", color: "#d97706" },
  { id: "green", label: "Green", color: "#16a34a" },
  { id: "teal", label: "Teal", color: "#0d9488" },
  { id: "blue", label: "Blue", color: "#2563eb" },
] as const;

export function parseMenuThemeColor(raw: FormDataEntryValue | null): string | null {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  const rgb = parseHexRgb(value);
  if (!rgb) return null;
  return toHex(rgb);
}

export function resolveMenuTheme(color: string | null | undefined): MenuTheme {
  if (!color) return DEFAULT_THEME;
  const rgb = parseHexRgb(color);
  if (!rgb) return DEFAULT_THEME;

  const primary = toHex(rgb);
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };

  return {
    primary,
    accent: toHex(mix(rgb, white, 0.2)),
    deep: toHex(mix(rgb, black, 0.28)),
    softBg: toHex(mix(rgb, white, 0.9)),
    softBorder: toHex(mix(rgb, white, 0.72)),
    softText: toHex(mix(rgb, black, 0.5)),
  };
}

export function menuThemeStyle(theme: MenuTheme): CSSProperties {
  return {
    ["--menu-primary" as string]: theme.primary,
    ["--menu-accent" as string]: theme.accent,
    ["--menu-deep" as string]: theme.deep,
    ["--menu-soft-bg" as string]: theme.softBg,
    ["--menu-soft-border" as string]: theme.softBorder,
    ["--menu-soft-text" as string]: theme.softText,
  };
}

export function menuPrimaryGradient(theme: MenuTheme): string {
  return `linear-gradient(135deg, ${theme.primary} 0%, ${theme.deep} 100%)`;
}

export function menuPrimaryButtonStyle(theme: MenuTheme): CSSProperties {
  return {
    background: menuPrimaryGradient(theme),
    color: "#fff",
  };
}

/** Tailwind class fragments — set `menuThemeStyle(theme)` on the same node or an ancestor. */
export const menuThemeSelectedClass =
  "border-[var(--menu-primary)] bg-[var(--menu-soft-bg)] ring-1 ring-[var(--menu-soft-border)]";

export const menuThemeOutlineBtnClass =
  "shrink-0 rounded-lg border border-[var(--menu-primary)] px-4 py-1.5 text-xs font-semibold text-[var(--menu-primary)] transition hover:bg-[var(--menu-soft-bg)]";

export const menuThemeQuickSelectedClass =
  "border-[var(--menu-primary)] bg-[var(--menu-soft-bg)] text-[var(--menu-soft-text)]";

export const menuThemeQuickIdleClass =
  "border-slate-200 bg-white text-slate-600 hover:border-[color-mix(in_srgb,var(--menu-primary)_40%,transparent)]";

export const menuThemeModeSelectedClass =
  "border-[var(--menu-primary)] bg-[color-mix(in_srgb,var(--menu-soft-bg)_60%,white)] shadow-sm";

export const menuThemeAccentCheckboxClass =
  "h-4 w-4 rounded border-slate-300 accent-[var(--menu-primary)]";
