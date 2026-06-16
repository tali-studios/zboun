"use client";

import { useState } from "react";
import { MENU_THEME_PRESETS } from "@/lib/menu-theme";

type Props = {
  defaultColor: string | null;
};

export function MenuThemePicker({ defaultColor }: Props) {
  const initial =
    defaultColor && MENU_THEME_PRESETS.some((preset) => preset.color === defaultColor)
      ? defaultColor
      : defaultColor ?? MENU_THEME_PRESETS[0].color;

  const [color, setColor] = useState(initial);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 md:col-span-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Menu theme color</p>
      <p className="mt-1 text-xs text-slate-500">
        Accent color for your public menu — category chips, prices, and buttons.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {MENU_THEME_PRESETS.map((preset) => {
          const selected = color.toLowerCase() === preset.color.toLowerCase();
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => setColor(preset.color)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                selected
                  ? "border-slate-900 bg-white text-slate-900 shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <span
                className="h-4 w-4 rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: preset.color }}
                aria-hidden
              />
              {preset.label}
            </button>
          );
        })}
      </div>

      <label className="mt-3 flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Custom</span>
        <input
          type="color"
          value={color}
          onChange={(event) => setColor(event.target.value)}
          className="h-10 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
          aria-label="Pick a custom menu color"
        />
        <input
          type="text"
          value={color}
          onChange={(event) => setColor(event.target.value)}
          pattern="^#[0-9a-fA-F]{6}$"
          className="ui-input max-w-[8rem] font-mono text-sm"
          aria-label="Menu color hex code"
        />
      </label>

      <input type="hidden" name="menu_theme_color" value={color} />

      <div
        className="mt-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold text-white"
        style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}
      >
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs uppercase tracking-wide">Preview</span>
        Menu buttons &amp; accents
      </div>
    </div>
  );
}
