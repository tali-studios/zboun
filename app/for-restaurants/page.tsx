import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { ZBOUN_PRICING } from "@/lib/pricing";

const steps = [
  {
    n: "01",
    title: "We set up your page",
    body: "Unique menu URL, QR assets, and a clean WhatsApp order format for your brand.",
  },
  {
    n: "02",
    title: "You manage the menu",
    body: "Sections, items, photos, prices, and availability — updated anytime from your dashboard.",
  },
  {
    n: "03",
    title: "Customers order on WhatsApp",
    body: "No app installs. Guests browse your menu and send structured orders to your number.",
  },
];

const includes = [
  "Digital menu page + shareable link",
  "QR code & print-ready flyer tools",
  "WhatsApp order message builder",
  "Unlimited menu updates",
  "Logo & item photos",
  "Optional listing on the Zboun home discovery page",
];

const onboardingRequirements = [
  "Full menu items list",
  "Ingredients / contents for each item",
  "Item photos / logo files",
  "Prices and section structure",
];

export default function ForRestaurantsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f8ff]">
      <main className="flex-1">

        {/* ── Pricing ──────────────────────────────────────────────────────── */}
        <section className="container py-12 pt-16 md:py-16 md:pt-20">
          <div className="mx-auto max-w-lg text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600">Pricing</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Simple, flat pricing</h2>
            <p className="mt-2 text-sm text-slate-500">
              One plan. Includes everything. No hidden fees.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-md">
            <article className="relative overflow-hidden rounded-3xl border border-violet-100 bg-white p-7 shadow-[0_12px_40px_rgba(120,84,255,0.12)] md:p-8">
              {/* Top accent */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-t-3xl" />

              <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600">Monthly plan</p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight text-slate-900">
                  {ZBOUN_PRICING.symbol}{ZBOUN_PRICING.monthly}
                </span>
                <span className="text-lg text-slate-400">/mo</span>
              </div>
              <p className="mt-1.5 text-sm text-slate-500">Flexible — cancel anytime.</p>

              <ul className="mt-6 space-y-2.5">
                {includes.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700">✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              {/* Add-on */}
              <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-violet-700">Optional add-on</p>
                <p className="mt-1.5 text-sm font-semibold text-slate-800">
                  One-time data entry: {ZBOUN_PRICING.symbol}{ZBOUN_PRICING.oneTimeDataEntry}
                </p>
                <p className="mt-1 text-xs text-slate-500">We set up your full menu if you provide:</p>
                <ul className="mt-2 space-y-1 text-xs text-slate-600">
                  {onboardingRequirements.map((item) => (
                    <li key={item} className="flex items-start gap-1.5">
                      <span className="text-violet-400">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/contact"
                className="mt-6 block w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-center text-sm font-bold text-white shadow-md shadow-violet-400/30 transition hover:brightness-110"
              >
                Get started
              </Link>
            </article>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section className="border-y border-slate-100 bg-white py-12 md:py-16">
          <div className="container">
            <div className="mx-auto max-w-lg text-center">
              <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600">Process</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">How it works</h2>
            </div>
            <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-3">
              {steps.map((step) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:border-violet-200 hover:shadow-[0_8px_24px_rgba(120,84,255,0.1)]"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-sm font-bold text-white">
                    {step.n}
                  </span>
                  <h3 className="mt-4 text-base font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Add-on modules ───────────────────────────────────────────────── */}
        <section className="container py-12 md:py-16">
          <div className="mx-auto max-w-lg text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600">ERP Add-ons</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Grow with your business</h2>
            <p className="mt-2 text-sm text-slate-500">
              Add powerful modules to your plan at any time. Each is billed separately.
            </p>
          </div>
          <div className="mx-auto mt-8 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                label: "Inventory Management",
                available: true,
                desc: "Track ingredients and stock in real time. Manage suppliers, log purchases and consumption, and get low-stock alerts before you run out.",
              },
              {
                label: "Cloud & Offline POS",
                available: false,
                desc: "Full point-of-sale system that works online and offline, synced to your menu and inventory.",
              },
              {
                label: "CRM",
                available: false,
                desc: "Customer profiles, order history, preferences, and targeted communication tools.",
              },
              {
                label: "Loyalty Management",
                available: false,
                desc: "Points, rewards, and stamp cards to keep customers coming back.",
              },
              {
                label: "Accounting & Payroll",
                available: true,
                desc: "Financial reports, expense tracking, and staff payroll management.",
              },
              {
                label: "Property Management (PMS)",
                available: false,
                desc: "Room bookings, housekeeping, and front-desk tools for hotels and hospitality.",
              },
              {
                label: "Event Management",
                available: false,
                desc: "Table reservations, private event bookings, and capacity management.",
              },
              {
                label: "E-commerce Integration",
                available: false,
                desc: "Sync your menu with online stores and delivery platforms.",
              },
              {
                label: "Fleet Management",
                available: false,
                desc: "Delivery tracking, driver assignment, and route optimization.",
              },
            ].map((mod) => (
              <div
                key={mod.label}
                className={`rounded-2xl border p-5 ${
                  mod.available
                    ? "border-teal-100 bg-white shadow-sm"
                    : "border-slate-100 bg-slate-50/60"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={`font-semibold ${mod.available ? "text-slate-900" : "text-slate-600"}`}>
                    {mod.label}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      mod.available
                        ? "bg-teal-100 text-teal-700"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {mod.available ? "Available" : "Coming soon"}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{mod.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-slate-500">
            Add-ons are enabled by contacting us.{" "}
            <a href="/contact" className="font-semibold text-violet-600 hover:underline">
              Get in touch →
            </a>
          </p>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <section className="container py-12 md:py-16">
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900 via-slate-900 to-slate-950 px-8 py-10 text-center text-white md:px-12 md:py-14">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl"
            />
            <p className="relative text-[11px] font-bold uppercase tracking-widest text-violet-400">
              Ready to go live?
            </p>
            <h2 className="relative mt-3 text-2xl font-bold md:text-3xl">
              Tell us your restaurant name.
            </h2>
            <p className="relative mt-2 text-sm text-slate-400">
              We'll get your menu page up and running quickly.
            </p>
            <Link
              href="/contact"
              className="relative mt-7 inline-flex rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
            >
              Contact us
            </Link>
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}
