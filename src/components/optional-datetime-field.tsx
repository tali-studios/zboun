"use client";

import { useState } from "react";

type Props = {
  name: string;
  label: string;
  /** Default time when only a date is chosen (e.g. 00:00 start, 23:59 end). */
  defaultTime?: string;
};

/**
 * Mobile-safe date + time pair. Native `datetime-local` overflows on iPhone;
 * separate controls stay inside the card width.
 */
export function OptionalDateTimeField({ name, label, defaultTime = "00:00" }: Props) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const combined = date ? `${date}T${time || defaultTime}` : "";

  return (
    <div className="min-w-0 space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <div className="grid min-w-0 grid-cols-2 gap-2">
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="ui-input min-w-0"
          aria-label={`${label} date`}
        />
        <input
          type="time"
          value={time}
          onChange={(event) => setTime(event.target.value)}
          className="ui-input min-w-0"
          aria-label={`${label} time`}
        />
      </div>
      <input type="hidden" name={name} value={combined} />
    </div>
  );
}
