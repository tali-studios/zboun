export const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type DayHours = {
  day: number;
  open: string;
  close: string;
  closed: boolean;
};

export type ScheduleSlot = {
  iso: string;
  dateLabel: string;
  friendlyDateLabel: string;
  timeLabel: string;
  intervalLabel: string;
  dayKey: string;
  dayOffset: number;
};

export type ScheduleDayOption = {
  dayKey: string;
  label: string;
  dayOffset: number;
};

export const DEFAULT_OPENING_HOURS: DayHours[] = [
  { day: 0, open: "10:00", close: "22:00", closed: false },
  { day: 1, open: "09:00", close: "22:00", closed: false },
  { day: 2, open: "09:00", close: "22:00", closed: false },
  { day: 3, open: "09:00", close: "22:00", closed: false },
  { day: 4, open: "09:00", close: "22:00", closed: false },
  { day: 5, open: "09:00", close: "22:00", closed: false },
  { day: 6, open: "09:00", close: "22:00", closed: false },
];

function parseTimeToMinutes(hhmm: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (!Number.isFinite(h) || !Number.isFinite(m) || h > 23 || m > 59) return null;
  return h * 60 + m;
}

function normalizeDayHours(raw: unknown): DayHours | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const day = Number(row.day);
  if (!Number.isInteger(day) || day < 0 || day > 6) return null;
  const open = String(row.open ?? "09:00").trim();
  const close = String(row.close ?? "22:00").trim();
  if (parseTimeToMinutes(open) == null || parseTimeToMinutes(close) == null) return null;
  return {
    day,
    open,
    close,
    closed: row.closed === true,
  };
}

export function parseOpeningHours(raw: unknown): DayHours[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_OPENING_HOURS;
  const byDay = new Map<number, DayHours>();
  for (const item of raw) {
    const parsed = normalizeDayHours(item);
    if (parsed) byDay.set(parsed.day, parsed);
  }
  if (byDay.size === 0) return DEFAULT_OPENING_HOURS;
  return DEFAULT_OPENING_HOURS.map((fallback) => byDay.get(fallback.day) ?? fallback);
}

export function isRestaurantOpenNow(
  hours: DayHours[],
  options?: { isTemporarilyClosed?: boolean; now?: Date },
): boolean {
  if (options?.isTemporarilyClosed) return false;
  const now = options?.now ?? new Date();
  const dayConfig = hours.find((h) => h.day === now.getDay());
  if (!dayConfig || dayConfig.closed) return false;
  const openMin = parseTimeToMinutes(dayConfig.open);
  const closeMin = parseTimeToMinutes(dayConfig.close);
  if (openMin == null || closeMin == null || closeMin <= openMin) return false;
  const currentMin = now.getHours() * 60 + now.getMinutes();
  return currentMin >= openMin && currentMin < closeMin;
}

function formatTime(d: Date): string {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(d);
}

function formatFriendlyDayLabel(dayStart: Date, dayOffset: number): string {
  if (dayOffset === 0) return "Today";
  if (dayOffset === 1) return "Tomorrow";
  const weekday = new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(dayStart);
  const rest = new Intl.DateTimeFormat(undefined, { month: "short", day: "2-digit" }).format(dayStart);
  return `${weekday}, ${rest}`;
}

export function getScheduleDays(
  hours: DayHours[],
  options?: { now?: Date; maxDays?: number },
): ScheduleDayOption[] {
  const now = options?.now ?? new Date();
  const maxDays = options?.maxDays ?? 5;
  const days: ScheduleDayOption[] = [];

  for (let offset = 0; offset < maxDays; offset += 1) {
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    dayStart.setDate(dayStart.getDate() + offset);

    days.push({
      dayKey: dayStart.toISOString().slice(0, 10),
      label: formatFriendlyDayLabel(dayStart, offset),
      dayOffset: offset,
    });
  }

  return days;
}

export function getScheduleSlots(
  hours: DayHours[],
  options?: { now?: Date; maxDays?: number; intervalMinutes?: number; dayKey?: string },
): ScheduleSlot[] {
  const now = options?.now ?? new Date();
  const maxDays = options?.maxDays ?? 5;
  const interval = options?.intervalMinutes ?? 15;
  const slots: ScheduleSlot[] = [];
  const dateFmt = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" });

  for (let offset = 0; offset < maxDays; offset += 1) {
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    dayStart.setDate(dayStart.getDate() + offset);

    const dayKey = dayStart.toISOString().slice(0, 10);
    if (options?.dayKey && options.dayKey !== dayKey) continue;

    const dayConfig = hours.find((h) => h.day === dayStart.getDay());
    if (!dayConfig || dayConfig.closed) continue;

    const openMin = parseTimeToMinutes(dayConfig.open);
    const closeMin = parseTimeToMinutes(dayConfig.close);
    if (openMin == null || closeMin == null || closeMin <= openMin) continue;

    for (let minute = openMin; minute + interval <= closeMin; minute += interval) {
      const slot = new Date(dayStart);
      slot.setHours(Math.floor(minute / 60), minute % 60, 0, 0);
      if (slot.getTime() <= now.getTime()) continue;

      const end = new Date(slot);
      end.setMinutes(end.getMinutes() + interval);

      slots.push({
        iso: slot.toISOString(),
        dateLabel: dateFmt.format(slot),
        friendlyDateLabel: formatFriendlyDayLabel(dayStart, offset),
        timeLabel: formatTime(slot),
        intervalLabel: `${formatTime(slot)} - ${formatTime(end)}`,
        dayKey,
        dayOffset: offset,
      });
    }
  }

  return slots;
}

export function formatDeliveryTimeLabel(
  choice: { mode: "now" } | { mode: "scheduled"; at: string },
  etaLabel?: string | null,
): string {
  if (choice.mode === "now") {
    const trimmed = etaLabel?.trim();
    return trimmed ? trimmed : "In 30 – 45 mins";
  }
  const date = new Date(choice.at);
  if (Number.isNaN(date.getTime())) return "Scheduled";
  const end = new Date(date);
  end.setMinutes(end.getMinutes() + 15);
  const dateFmt = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return `${dateFmt.format(date)}, ${formatTime(date)} - ${formatTime(end)}`;
}

export function isScheduledTimeValid(
  hours: DayHours[],
  iso: string,
  options?: { now?: Date; maxDays?: number; intervalMinutes?: number },
): boolean {
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return false;
  const slots = getScheduleSlots(hours, { ...options, intervalMinutes: options?.intervalMinutes ?? 15 });
  return slots.some((slot) => slot.iso === target.toISOString());
}

export function serializeOpeningHoursForForm(hours: DayHours[]): string {
  return JSON.stringify(parseOpeningHours(hours));
}
