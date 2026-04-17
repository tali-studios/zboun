import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { RestaurantDirectory } from "@/components/restaurant-directory";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const steps = [
  "Customer scans QR or opens your menu link",
  "They pick items and review cart in seconds",
  "Order goes directly to your WhatsApp number",
];

const featureCards = [
  {
    title: "Digital menu pages",
    description: "Each restaurant gets a unique link and QR-ready menu page.",
  },
  {
    title: "Structured WhatsApp orders",
    description: "No more messy chats. Orders are clear, itemized, and readable.",
  },
  {
    title: "Easy menu management",
    description: "Restaurant admins update sections, items, prices, and availability in minutes.",
  },
];

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("id, name, slug, logo_url")
    .eq("is_active", true)
    .eq("show_on_home", true)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-slate-50 to-white">
      <SiteHeader largeLogo showDashboardButton={false} />
      <main>
        <section className="container py-16 md:py-24">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
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
                  className="rounded-full bg-green-600 px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-green-700"
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

            <div className="panel rounded-3xl p-6">
              <p className="text-sm font-semibold text-slate-500">Live Preview</p>
              <div className="mt-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white">
                <p className="text-sm text-slate-300">Sample order message</p>
                <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-emerald-200">
{`Hello 👋
I'd like to order:
- 2x Chicken Burger
- 1x Fries

Total: $12.00
Name: Ahmad
Address: Hadath near X`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        <RestaurantDirectory restaurants={restaurants ?? []} />

        <section className="container py-8">
          <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step} className="panel p-5">
                <p className="text-sm font-semibold text-orange-600">Step {index + 1}</p>
                <p className="mt-2 font-medium text-slate-800">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container py-8">
          <div className="grid gap-4 md:grid-cols-3">
            {featureCards.map((feature) => (
              <article key={feature.title} className="panel rounded-3xl p-6">
                <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
