import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Heart,
  Images,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  Printer,
  QrCode,
  ShoppingBag,
  Smartphone,
  Store,
  Users,
} from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { BackToTopButton } from "@/components/back-to-top-button";
import { BackButton } from "@/components/back-button";
import { formatPricingSummary } from "@/lib/pricing";

const restaurantBenefits = [
  "Keep 100% of every order — flat subscription, zero commission",
  "Your own branded menu page with a link you can share anywhere",
  "Guests order through WhatsApp using clear, structured messages",
  "Update prices, photos, and availability anytime from your dashboard",
  "QR codes and print-ready flyers — ready for tables, doors, and social",
  "Optional visibility on the Zboun home page so new customers discover you",
];

const restaurantFeatures = [
  {
    icon: Store,
    title: "Digital menu page",
    body: "A mobile-friendly menu at your unique Zboun URL — sections, photos, prices, and item details.",
  },
  {
    icon: LayoutDashboard,
    title: "Restaurant dashboard",
    body: "Manage your full menu, opening hours, temporary closures, and branding without calling anyone.",
  },
  {
    icon: QrCode,
    title: "QR codes",
    body: "Two QR types: one for online delivery orders, one for in-restaurant browsing on tables.",
  },
  {
    icon: Printer,
    title: "Print flyer (A4)",
    body: "Export a polished flyer with your menu link and QR — ideal for counters, packaging, and windows.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp order format",
    body: "Every order arrives as a clean, readable message — items, quantities, address, and notes included.",
  },
  {
    icon: Images,
    title: "Photos & branding",
    body: "Upload your logo, cover image, and dish photos so your menu looks as good as your food.",
  },
];

const guestBenefits = [
  "Browse restaurants and menus without creating an account",
  "See photos, prices, and options before you order",
  "Build a cart on your phone — no app download required",
  "Free account unlocks delivery checkout, saved addresses, and order history",
  "Save favorite restaurants and reorder in a few taps",
  "Add Zboun to your home screen — works like a lightweight app",
];

const guestFeatures = [
  {
    icon: ShoppingBag,
    title: "Browse & discover",
    body: "Explore restaurants on Zboun, open any menu instantly, and check what's available near you.",
  },
  {
    icon: Smartphone,
    title: "Mobile-first menus",
    body: "Fast, thumb-friendly menus designed for phones — the way most people order today.",
  },
  {
    icon: MapPin,
    title: "Delivery checkout",
    body: "Sign in (free) to add your address, pick a delivery time, and send a complete order to the restaurant.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp handoff",
    body: "Orders are formatted for WhatsApp so the restaurant receives everything they need in one message.",
  },
  {
    icon: Heart,
    title: "Favorites & reorder",
    body: "Save places you love and repeat past orders without rebuilding your cart from scratch.",
  },
  {
    icon: Users,
    title: "Open to everyone",
    body: "No paywall to browse. Guests can explore freely; accounts are only needed when you checkout.",
  },
];

const steps = [
  {
    n: "01",
    title: "Restaurant joins Zboun",
    body: "We set up your menu page, dashboard access, and QR assets. You stay in control of your brand.",
  },
  {
    n: "02",
    title: "Guests browse your menu",
    body: "Customers open your link or scan your QR — on Zboun, social media, or your printed flyer.",
  },
  {
    n: "03",
    title: "Orders land on WhatsApp",
    body: "Structured orders go straight to your WhatsApp number. No middleman taking a cut of sales.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f8ff]">
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="shrink-0 outline-none transition-opacity hover:opacity-80" aria-label="Zboun home">
              <Image
                src="/Logo.svg?v=3"
                alt="Zboun"
                width={120}
                height={34}
                className="h-8 w-auto"
                unoptimized
                priority
              />
            </Link>
            <span className="text-slate-300" aria-hidden>
              /
            </span>
            <p className="truncate text-sm font-semibold text-slate-600">About Zboun</p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <BackButton
              fallbackHref="/"
              className="hidden rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-violet-300 hover:text-violet-700 sm:inline-flex"
            >
              ← Back
            </BackButton>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-400/30 transition hover:bg-violet-700"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-violet-100/80 bg-gradient-to-b from-white via-[#faf9ff] to-[#f8f8ff]">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-fuchsia-300/15 blur-3xl"
          />

          <div className="container relative py-14 md:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-600">Who we are</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
                Digital menus &amp; WhatsApp ordering, built for Lebanon&apos;s restaurants
              </h1>
              <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
                Zboun helps restaurants share a beautiful online menu, take structured orders on WhatsApp, and
                manage everything from one dashboard — while guests browse and order from their phones without
                downloading another app.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-7 py-3.5 text-sm font-semibold text-white shadow-md shadow-violet-400/25 transition hover:brightness-110 sm:w-auto"
                >
                  Browse restaurants
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/for-restaurants"
                  className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:text-violet-700 sm:w-auto"
                >
                  Plans for restaurants
                </Link>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                No account required to explore menus and learn about Zboun.
              </p>
            </div>
          </div>
        </section>

        {/* What we do */}
        <section className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600">What we do</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              One platform, two sides — restaurants and guests
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              Restaurants get a professional online presence and ordering workflow. Guests get a simple way to
              discover food, build a cart, and send a complete order — with WhatsApp as the familiar last step.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-2">
            <article className="rounded-3xl border border-violet-100 bg-white p-7 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600">For restaurants</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">Your menu, your WhatsApp, your rules</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Replace scattered PDFs and screenshot menus with a live page you control. Share one link, print one
                QR, and receive orders in a format your team can read at a glance.
              </p>
            </article>
            <article className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600">For guests</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">Browse freely, order when you&apos;re ready</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Anyone can open Zboun and explore restaurant menus. Create a free account only when you want
                delivery checkout, saved addresses, favorites, and order history.
              </p>
            </article>
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-slate-100 bg-white py-12 md:py-16">
          <div className="container">
            <div className="mx-auto max-w-lg text-center">
              <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600">How it works</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                From menu link to WhatsApp order
              </h2>
            </div>
            <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-3">
              {steps.map((step) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-slate-100 bg-[#faf9ff] p-6 shadow-sm"
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

        {/* Restaurant benefits + features */}
        <section className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600">Restaurant owners</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Why restaurants choose Zboun
            </h2>
          </div>

          <ul className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
            {restaurantBenefits.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                  <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {restaurantFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-violet-200 hover:shadow-[0_8px_24px_rgba(120,84,255,0.08)]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{feature.body}</p>
                </article>
              );
            })}
          </div>

          <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-violet-100 bg-violet-50/50 p-6 text-center">
            <p className="text-sm font-semibold text-slate-800">
              From {formatPricingSummary()} — everything included, no commission on orders.
            </p>
            <Link
              href="/for-restaurants"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 transition hover:text-violet-900"
            >
              See full pricing &amp; plan details
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>

        {/* Guest benefits + features */}
        <section className="border-t border-slate-100 bg-white py-12 md:py-16">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600">Guests &amp; diners</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                A better way to order from your phone
              </h2>
            </div>

            <ul className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
              {guestBenefits.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-fuchsia-100 text-fuchsia-700">
                    <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {guestFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article
                    key={feature.title}
                    className="rounded-2xl border border-slate-100 bg-[#faf9ff] p-5 shadow-sm"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-100 text-fuchsia-700">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-slate-900">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">{feature.body}</p>
                  </article>
                );
              })}
            </div>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Start browsing menus
              </Link>
              <Link
                href="/install"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:text-violet-700"
              >
                Add Zboun to your home screen
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container py-12 md:py-16">
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900 via-slate-900 to-slate-950 px-8 py-10 text-center text-white md:px-12 md:py-14">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl"
            />
            <p className="relative text-[11px] font-bold uppercase tracking-widest text-violet-400">
              Share this page
            </p>
            <h2 className="relative mt-3 text-2xl font-bold md:text-3xl">
              Everything your restaurant needs to know — in one link
            </h2>
            <p className="relative mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-400">
              Send partners and owners to this page when they ask how Zboun works. When they&apos;re ready, reach
              out and we&apos;ll get their menu live.
            </p>
            <div className="relative mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
              >
                Contact us to join
              </Link>
              <a
                href="https://wa.me/96171212734"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                WhatsApp us
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <BackToTopButton />
    </div>
  );
}
