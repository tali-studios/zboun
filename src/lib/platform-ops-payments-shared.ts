export const PLATFORM_OPS_REMINDER_DAYS = {
  one_month: 30,
  one_week: 7,
  three_days: 3,
} as const;

export type PlatformOpsReminderKind = keyof typeof PLATFORM_OPS_REMINDER_DAYS;

export const PLATFORM_OPS_CATEGORY_LABELS: Record<string, string> = {
  domain: "Domain",
  hosting: "Hosting",
  saas: "SaaS",
  marketing: "Marketing",
  other: "Other",
};

export const PLATFORM_OPS_REMINDER_LABELS: Record<PlatformOpsReminderKind, string> = {
  one_month: "1 month before",
  one_week: "1 week before",
  three_days: "3 days before",
};
