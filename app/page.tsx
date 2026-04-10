import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

const steps = [
  "Customer scans QR or opens your menu link",
  "They pick items and review cart in seconds",
  "Order goes directly to your WhatsApp number",
];

const features = [
  "Digital menu by restaurant slug",
  "Clean WhatsApp order messages",
  "Simple dashboard for updates",
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader largeLogo />
      <main>
        <section className="container py-16 md:py-24">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
              Built for restaurants
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
              Turn your menu into instant WhatsApp orders
            </h1>
            <p className="max-w-2xl text-lg text-slate-600">
              No commissions. No apps. Just direct orders.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="rounded-full bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
              >
                Contact us to get started
              </Link>
              <Link
                href="/demo-restaurant"
                className="rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-800 hover:bg-slate-100"
              >
                View demo menu
              </Link>
            </div>
          </div>
        </section>

        <section className="container py-8">
          <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm font-semibold text-orange-600">Step {index + 1}</p>
                <p className="mt-2 font-medium text-slate-800">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container py-8">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-10">
            <h2 className="text-2xl font-bold text-slate-900">Why Zboun</h2>
            <ul className="mt-5 space-y-2 text-slate-700">
              {features.map((feature) => (
                <li key={feature}>- {feature}</li>
              ))}
              <li>- Increase direct orders and save time</li>
              <li>- No commission fees like delivery apps</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
