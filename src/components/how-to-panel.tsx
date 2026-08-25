import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CirclePlay,
  ExternalLink,
} from "lucide-react";
import {
  STORE_ADMIN_HOW_TO_VIDEO,
  type StoreAdminHowToSection,
} from "@/lib/store-admin-how-to-content";

type Props = {
  sections: StoreAdminHowToSection[];
  /** Hide Drivers when the store does not have driver management enabled. */
  showDrivers?: boolean;
};

export function HowToPanel({ sections, showDrivers = false }: Props) {
  const visibleSections = sections.filter(
    (section) => section.id !== "drivers" || showDrivers,
  );

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-violet-50 via-white to-fuchsia-50 px-5 py-5 md:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600">
                Video walkthrough
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-900 md:text-xl">
                {STORE_ADMIN_HOW_TO_VIDEO.title}
              </h2>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">
                Watch the full portal tour, then use the guide below to jump straight to each page and
                understand what it is for.
              </p>
            </div>
            <a
              href={STORE_ADMIN_HOW_TO_VIDEO.watchUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-violet-200 bg-white px-3.5 py-2 text-xs font-semibold text-violet-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50"
            >
              <CirclePlay className="h-3.5 w-3.5" aria-hidden />
              Open on YouTube
              <ExternalLink className="h-3 w-3 opacity-70" aria-hidden />
            </a>
          </div>
        </div>

        <div className="p-4 md:p-5">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950 shadow-inner">
            <div className="relative aspect-video w-full">
              <iframe
                title={STORE_ADMIN_HOW_TO_VIDEO.title}
                src={`${STORE_ADMIN_HOW_TO_VIDEO.embedUrl}?rel=0`}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600">
            Portal guide
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-900 md:text-xl">
            Pages &amp; benefits
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
            Each area of the store admin portal has one job. Use this map to set up faster, promote your
            storefront, and run day-to-day operations with confidence.
          </p>
        </div>

        <ol className="mt-6 space-y-4">
          {visibleSections.map((section, index) => (
            <li
              key={section.id}
              id={section.id}
              className="rounded-2xl border border-slate-100 bg-[#fbfbff] p-4 transition hover:border-violet-200 hover:bg-white md:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white shadow-sm shadow-violet-400/30"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900">{section.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{section.summary}</p>
                  </div>
                </div>
                <Link
                  href={section.href}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-50"
                >
                  Open page
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>

              <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                {section.benefits.map((benefit) => (
                  <li key={benefit} className="flex gap-2.5 text-sm leading-relaxed text-slate-700">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                      aria-hidden
                    />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
