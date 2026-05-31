"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarClock, Clock } from "lucide-react";
import {
  formatDeliveryTimeLabel,
  getScheduleDays,
  getScheduleSlots,
  type DayHours,
} from "@/lib/opening-hours";

export type DeliveryTimeChoice =
  | { mode: "now" }
  | { mode: "scheduled"; at: string };

type Props = {
  open: boolean;
  onClose: () => void;
  value: DeliveryTimeChoice;
  onChange: (value: DeliveryTimeChoice) => void;
  openingHours: DayHours[];
  etaLabel?: string | null;
};

const ITEM_H = 44;
const VISIBLE = 3;

function ScrollPickerColumn({
  items,
  selectedIndex,
  onSelect,
  className = "",
}: {
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pad = ((VISIBLE - 1) / 2) * ITEM_H;

  useEffect(() => {
    const el = ref.current;
    if (!el || selectedIndex < 0) return;
    el.scrollTo({ top: selectedIndex * ITEM_H, behavior: "smooth" });
  }, [selectedIndex]);

  function handleScroll() {
    const el = ref.current;
    if (!el || items.length === 0) return;
    const index = Math.round(el.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(items.length - 1, index));
    if (clamped !== selectedIndex) onSelect(clamped);
  }

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      className={`h-full snap-y snap-mandatory overflow-y-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
      style={{ paddingTop: pad, paddingBottom: pad }}
    >
      {items.map((label, index) => {
        const distance = Math.abs(index - selectedIndex);
        const opacity = distance === 0 ? 1 : distance === 1 ? 0.35 : 0.15;
        const weight = distance === 0 ? 600 : 400;
        return (
          <button
            key={`${label}-${index}`}
            type="button"
            onClick={() => {
              onSelect(index);
              ref.current?.scrollTo({ top: index * ITEM_H, behavior: "smooth" });
            }}
            className="flex w-full snap-center items-center justify-center px-2 text-center transition-opacity duration-150"
            style={{ height: ITEM_H, opacity, fontWeight: weight }}
          >
            <span className="truncate text-[13px] leading-tight text-slate-900 sm:text-sm">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function DeliveryTimeSheet({
  open,
  onClose,
  value,
  onChange,
  openingHours,
  etaLabel,
}: Props) {
  const scheduleDays = useMemo(
    () => getScheduleDays(openingHours, { maxDays: 5 }),
    [openingHours],
  );
  const slots = useMemo(
    () => getScheduleSlots(openingHours, { maxDays: 5, intervalMinutes: 15 }),
    [openingHours],
  );
  const hasAnySlots = slots.length > 0;

  const initialDayKey =
    value.mode === "scheduled"
      ? new Date(value.at).toISOString().slice(0, 10)
      : scheduleDays[0]?.dayKey ?? "";

  const [draftMode, setDraftMode] = useState<"now" | "scheduled">(
    value.mode === "scheduled" ? "scheduled" : "now",
  );
  const [activeDayKey, setActiveDayKey] = useState(initialDayKey);
  const [draftSlot, setDraftSlot] = useState<string | null>(
    value.mode === "scheduled" ? value.at : null,
  );

  const dayIntervals = useMemo(
    () => slots.filter((s) => s.dayKey === activeDayKey),
    [slots, activeDayKey],
  );

  const dayLabels = useMemo(() => scheduleDays.map((d) => d.label), [scheduleDays]);
  const intervalLabels = useMemo(() => dayIntervals.map((s) => s.intervalLabel), [dayIntervals]);

  const dayIndex = Math.max(
    0,
    scheduleDays.findIndex((d) => d.dayKey === activeDayKey),
  );
  const slotIndex = Math.max(
    0,
    dayIntervals.findIndex((s) => s.iso === draftSlot),
  );

  useEffect(() => {
    if (!open) return;
    if (scheduleDays.length === 0) return;
    if (!scheduleDays.some((d) => d.dayKey === activeDayKey)) {
      setActiveDayKey(scheduleDays[0].dayKey);
    }
  }, [open, scheduleDays, activeDayKey]);

  useEffect(() => {
    if (dayIntervals.length > 0) {
      if (!draftSlot || !dayIntervals.some((s) => s.iso === draftSlot)) {
        setDraftSlot(dayIntervals[0].iso);
      }
      return;
    }
    const nextDay = scheduleDays.find((d) => slots.some((s) => s.dayKey === d.dayKey));
    if (nextDay && nextDay.dayKey !== activeDayKey) {
      setActiveDayKey(nextDay.dayKey);
      return;
    }
    setDraftSlot(null);
  }, [dayIntervals, draftSlot, scheduleDays, slots, activeDayKey]);

  if (!open) return null;

  function handleConfirm() {
    if (draftMode === "now") {
      onChange({ mode: "now" });
      onClose();
      return;
    }
    if (!draftSlot) return;
    onChange({ mode: "scheduled", at: draftSlot });
    onClose();
  }

  const preview =
    draftMode === "now"
      ? formatDeliveryTimeLabel({ mode: "now" }, etaLabel)
      : draftSlot
        ? formatDeliveryTimeLabel({ mode: "scheduled", at: draftSlot }, etaLabel)
        : "Pick a time";

  const pickerHeight = ITEM_H * VISIBLE;

  const sheet = (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[min(90dvh,640px)] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-slate-200" aria-hidden />
        </div>

        <div className="px-5 pb-2 pt-4">
          <h3 className="text-lg font-bold text-slate-900">Delivery time</h3>
        </div>

        <div className="space-y-1 px-3 pb-3">
          <button
            type="button"
            onClick={() => setDraftMode("now")}
            className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
              draftMode === "now"
                ? "border-emerald-500 bg-emerald-50/60 shadow-sm"
                : "border-transparent bg-white hover:bg-slate-50"
            }`}
          >
            {draftMode === "now" ? (
              <span className="h-10 w-1 shrink-0 rounded-full bg-emerald-500" aria-hidden />
            ) : (
              <span className="w-1 shrink-0" aria-hidden />
            )}
            <Clock className="h-5 w-5 shrink-0 text-slate-700" strokeWidth={1.75} aria-hidden />
            <span className="text-sm font-semibold text-slate-900">Now</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setDraftMode("scheduled");
              if (scheduleDays[0]) setActiveDayKey(scheduleDays[0].dayKey);
            }}
            disabled={!hasAnySlots}
            className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
              draftMode === "scheduled"
                ? "border-emerald-500 bg-emerald-50/60 shadow-sm"
                : "border-transparent bg-white hover:bg-slate-50"
            }`}
          >
            {draftMode === "scheduled" ? (
              <span className="h-10 w-1 shrink-0 rounded-full bg-emerald-500" aria-hidden />
            ) : (
              <span className="w-1 shrink-0" aria-hidden />
            )}
            <CalendarClock className="h-5 w-5 shrink-0 text-slate-700" strokeWidth={1.75} aria-hidden />
            <span className="text-sm font-semibold text-slate-900">Schedule For Later</span>
          </button>
        </div>

        {draftMode === "scheduled" ? (
          <div className="border-t border-slate-100 px-2 py-4">
            {!hasAnySlots ? (
              <p className="px-2 text-sm text-slate-500">
                No delivery slots available in the next 5 days. Check the restaurant opening hours.
              </p>
            ) : (
              <div className="relative mx-1" style={{ height: pickerHeight }}>
                <div
                  className="pointer-events-none absolute inset-x-2 top-1/2 z-10 -translate-y-1/2 rounded-xl bg-slate-100"
                  style={{ height: ITEM_H }}
                  aria-hidden
                />
                <div className="relative z-20 grid h-full grid-cols-[1fr_1.15fr] gap-0">
                  <ScrollPickerColumn
                    items={dayLabels}
                    selectedIndex={dayIndex}
                    onSelect={(index) => {
                      const day = scheduleDays[index];
                      if (day) setActiveDayKey(day.dayKey);
                    }}
                  />
                  <ScrollPickerColumn
                    items={intervalLabels.length > 0 ? intervalLabels : ["No slots"]}
                    selectedIndex={intervalLabels.length > 0 ? slotIndex : 0}
                    onSelect={(index) => {
                      const slot = dayIntervals[index];
                      if (slot) setDraftSlot(slot.iso);
                    }}
                    className="border-l border-slate-100"
                  />
                </div>
              </div>
            )}
          </div>
        ) : null}

        <div className="shrink-0 border-t border-slate-100 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <p className="mb-3 text-center text-xs text-slate-500">{preview}</p>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={draftMode === "scheduled" && !draftSlot}
            className="w-full rounded-2xl bg-emerald-500 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Set delivery time
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(sheet, document.body);
}
