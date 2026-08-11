import type { SocialPlatform } from "@/lib/social-links";
import { listConfiguredSocialLinks, type SocialLinks } from "@/lib/social-links";

type Props = {
  links: Partial<SocialLinks> | null | undefined;
  /** Light icons on dark hero banner */
  onDark?: boolean;
};

function SocialIcon({ platform, className }: { platform: SocialPlatform; className?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": true as const,
    className,
  };

  switch (platform) {
    case "instagram":
      return (
        <svg {...common}>
          <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5Zm8.75 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...common}>
          <path d="M14.5 3c.4 2.4 1.9 4.2 4.3 4.7v2.4c-1.5-.05-2.9-.5-4.1-1.3v5.7c0 3.3-2.5 5.8-5.7 5.8S3.3 17.8 3.3 14.6c0-3.1 2.4-5.6 5.5-5.8v2.5c-1.7.2-3 1.6-3 3.3 0 1.8 1.5 3.3 3.3 3.3s3.3-1.5 3.3-3.3V3h2.1Z" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...common}>
          <path d="M13.5 21v-7.5H16l.5-3h-3V8.7c0-.9.3-1.5 1.6-1.5H16.6V4.4C16.2 4.3 15.2 4.2 14 4.2c-2.5 0-4.2 1.5-4.2 4.3V10.5H7v3h2.8V21h3.7Z" />
        </svg>
      );
    case "twitter":
      return (
        <svg {...common}>
          <path d="M4.5 4h4.1l3.4 4.7L16.3 4H20l-5.7 6.5L20.5 20h-4.1l-3.7-5.1L8 20H4.3l6-6.8L4.5 4Zm3.3 1.4 8.8 12.2H17L8 5.4H7.8Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common}>
          <path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 4.8 12 4.8 12 4.8s-6 0-7.7.5a2.7 2.7 0 0 0-1.9 1.9C2 9 2 12 2 12s0 3 .4 4.8a2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.7.5 7.7.5s6 0 7.7-.5a2.7 2.7 0 0 0 1.9-1.9c.4-1.8.4-4.8.4-4.8s0-3-.4-4.8ZM10.2 15.2V8.8L15.5 12l-5.3 3.2Z" />
        </svg>
      );
  }
}

export function RestaurantSocialLinks({ links, onDark = false }: Props) {
  const configured = listConfiguredSocialLinks(links);
  if (configured.length === 0) return null;

  return (
    <div
      className={`mt-3 flex flex-wrap items-center gap-2 ${onDark ? "" : ""}`}
      aria-label="Social media"
    >
      {configured.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          title={item.label}
          aria-label={`${item.label} (opens in a new tab)`}
          className={
            onDark
              ? "inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-sm transition hover:bg-white/25 hover:ring-white/50"
              : "inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-200"
          }
        >
          <SocialIcon platform={item.id} className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}
