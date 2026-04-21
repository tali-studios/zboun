import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ZBOUN_PRICING } from "@/lib/pricing";

const steps = [
  {
    title: "We set up your page",
    body: "Unique menu URL, QR assets, and a clean WhatsApp order format for your brand.",
  },
  {
    title: "You manage the menu",
    body: "Sections, items, photos, prices, and availability — updated anytime from your dashboard.",
  },
  {
    title: "Customers order on WhatsApp",
    body: "No app installs. Guests browse your menu and send structured orders straight to your number.",
  },
];

const includes = [
  "Digital menu page + shareable link",
  "QR code & print-ready flyer tools",
  "WhatsApp order message builder",
  "Unlimited menu updates",
  "Logo & item photos",
  "Optional listing on the Zboun home discovery page (super admin controlled)",
];

const onboardingRequirements = [
  "Full menu items list",
  "Ingredients / contents for each item",
  "Item photos / logo files",
  "Prices and section structure",
];

export default function ForRestaurantsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/40">
      <SiteHeader showDashboardButton={false} showForRestaurantsLink />
      <main>
        <section className="border-b border-slate-200/80 bg-white/90">
          <div className="container py-10 md:py-16">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">
                For restaurants
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
                Your menu. Your WhatsApp. Zero commission on orders.
              </h1>
              <p className="mt-4 text-base text-slate-600 md:text-lg">
                Zboun gives you a premium customer menu and a simple admin dashboard — so guests
                order clearly, and you stay in control.
              </p>
              <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/contact"
                  className="rounded-full bg-emerald-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  Contact us to subscribe
                </Link>
                <Link
                  href="/"
                  className="rounded-full border border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  View live restaurant menus
                </Link>
                <Link href="/" className="text-center text-sm font-semibold text-emerald-700 hover:underline">
                  ← Back to restaurants
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-12 md:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Simple pricing</h2>
            <p className="mt-2 text-sm text-slate-600">
              One subscription covers your menu page, dashboard, and WhatsApp ordering tools.
            </p>
          </div>
          <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-1">
            <article className="panel relative rounded-3xl p-6 md:p-8">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Monthly</p>
              <p className="mt-2 text-4xl font-bold text-slate-900">
                {ZBOUN_PRICING.symbol}
                {ZBOUN_PRICING.monthly}
                <span className="text-lg font-semibold text-slate-500">/mo</span>
              </p>
              <p className="mt-2 text-sm text-slate-600">Flexible — cancel when you need to.</p>
              <ul className="mt-6 space-y-2 text-sm text-slate-700">
                {includes.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-emerald-600">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
                  Optional add-on
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  One-time data entry service: {ZBOUN_PRICING.symbol}
                  {ZBOUN_PRICING.oneTimeDataEntry}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  We can enter your menu for you if you provide:
                </p>
                <ul className="mt-2 space-y-1 text-xs text-slate-700">
                  {onboardingRequirements.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <Link
                href="/contact"
                className="mt-8 block w-full rounded-xl bg-slate-900 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800"
              >
                Get started — monthly
              </Link>
            </article>

            {/* <article className="panel relative rounded-3xl border-2 border-emerald-200/80 bg-gradient-to-b from-emerald-50/60 to-white p-6 md:p-8">
              <span className="absolute right-4 top-4 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                Best value
              </span>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Yearly</p>
              <p className="mt-2 text-4xl font-bold text-slate-900">
                {ZBOUN_PRICING.symbol}
                {ZBOUN_PRICING.yearly}
                <span className="text-lg font-semibold text-slate-500">/yr</span>
              </p>
              <p className="mt-2 text-sm text-emerald-800">
                Save {ZBOUN_PRICING.symbol}
                {savings} vs 12× monthly.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-slate-700">
                {includes.map((item) => (
                  <li key={`y-${item}`} className="flex gap-2">
                    <span className="text-emerald-600">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className="mt-8 block w-full rounded-xl bg-emerald-600 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                Get started — yearly
              </Link>
            </article> */}
          </div>
        </section>

        <section className="border-t border-slate-200/80 bg-white/80 py-12 md:py-16">
          <div className="container">
            <h2 className="text-center text-2xl font-bold text-slate-900 md:text-3xl">How it works</h2>
            <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-3">
              {steps.map((step, i) => (
                <div key={step.title} className="panel rounded-2xl p-5">
                  <p className="text-xs font-bold text-orange-600">Step {i + 1}</p>
                  <h3 className="mt-2 font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container py-12 md:py-16">
          <div className="panel mx-auto max-w-3xl rounded-3xl p-6 text-center md:p-10">
            <h2 className="text-xl font-bold text-slate-900 md:text-2xl">Ready when you are</h2>
            <p className="mt-2 text-sm text-slate-600">
              Tell us your restaurant name and we’ll help you go live on Zboun.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/contact"
                className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Contact us
              </Link>
              {/* <a
                href="https://wa.me/96171212734"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                WhatsApp us
              </a> */}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
