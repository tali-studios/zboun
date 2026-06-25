import Image from "next/image";
import Link from "next/link";
import { BackButton } from "@/components/back-button";
import { SiteFooter } from "@/components/site-footer";

import { ZBOUN_OPS_EMAIL } from "@/lib/zboun-contact";

export const metadata = {
  title: "Terms of Service — Zboun",
  description: "Read the Zboun Terms of Service before using our platform.",
};

const EFFECTIVE_DATE = "28 May 2026";
const CONTACT_EMAIL = ZBOUN_OPS_EMAIL;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-base font-bold text-slate-900">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f8ff]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="shrink-0 outline-none transition-opacity hover:opacity-80" aria-label="Zboun home">
              <Image src="/Logo.svg?v=3" alt="Zboun" width={120} height={34} className="h-8 w-auto" unoptimized priority />
            </Link>
            <span className="text-slate-300" aria-hidden>/</span>
            <p className="text-sm font-semibold text-slate-600">Terms of Service</p>
          </div>
          {/* <BackButton
            fallbackHref="/"
            className="hidden rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-violet-300 hover:text-violet-700 sm:inline-flex"
          >
            ← Back
          </BackButton> */}
        </div>
      </header>

      <main className="container mx-auto max-w-2xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        {/* Hero */}
        <div className="mb-10">
          <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600">Legal</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Terms of Service</h1>
          <p className="mt-2 text-sm text-slate-400">Effective date: {EFFECTIVE_DATE}</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using Zboun ("the Platform"), you agree to be bound by these Terms of Service. If
              you do not agree, please do not use the Platform.
            </p>
          </Section>

          <Section title="2. What Zboun Does">
            <p>
              Zboun provides a digital menu and online ordering platform that connects customers with
              restaurants. Zboun is a technology intermediary and is not responsible for the preparation,
              quality, or delivery of food or goods ordered through the Platform.
            </p>
          </Section>

          <Section title="3. Customer Accounts">
            <p>
              You must provide accurate and complete information when creating an account. You are responsible
              for keeping your credentials secure and for all activity under your account.
            </p>
            <p>
              You may delete your account at any time from the Account Settings page. We will remove your
              personal data in accordance with our Privacy Policy.
            </p>
          </Section>

          <Section title="4. Placing Orders">
            <p>
              Orders placed through the Platform are sent directly to the restaurant. Zboun does not process
              payments between customers and restaurants - any payment arrangements are solely between you and
              the restaurant.
            </p>
            <p>
              Zboun is not responsible for order cancellations, incorrect items, or unfulfilled orders. Please
              contact the restaurant directly for issues with your order.
            </p>
          </Section>

          <Section title="5. Restaurant Listings">
            <p>
              Restaurant information (menus, prices, hours, availability) is provided by the restaurant and
              may not always be up to date. Zboun makes no warranties regarding the accuracy of such
              information.
            </p>
          </Section>

          <Section title="6. Intellectual Property">
            <p>
              All content on the Platform - including the Zboun name, logo, design, and software - is the
              property of Zboun and may not be reproduced without written permission.
            </p>
            <p>
              Restaurants retain ownership of their logos, photos, and menu content uploaded to the Platform.
            </p>
          </Section>

          <Section title="7. Prohibited Use">
            <p>You agree not to:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Use the Platform for any unlawful purpose</li>
              <li>Attempt to scrape, copy, or reverse-engineer any part of the Platform</li>
              <li>Submit false, misleading, or fraudulent orders</li>
              <li>Harass or impersonate any restaurant, user, or Zboun employee</li>
            </ul>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>
              To the fullest extent permitted by law, Zboun shall not be liable for any indirect, incidental,
              or consequential damages arising from your use of the Platform, including but not limited to
              food quality, delivery failures, or loss of data.
            </p>
          </Section>

          <Section title="9. Changes to These Terms">
            <p>
              We may update these Terms from time to time. Continued use of the Platform after changes are
              posted constitutes your acceptance of the updated Terms. We will update the effective date at
              the top of this page.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>
              For questions about these Terms, please contact us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-semibold text-violet-600 underline underline-offset-2 hover:text-violet-700"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
