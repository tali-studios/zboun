"use client";

import { useState, useEffect } from "react";

import { ZBOUN_OPS_EMAIL } from "@/lib/zboun-contact";

const EFFECTIVE_DATE = "28 May 2026";
const CONTACT_EMAIL = ZBOUN_OPS_EMAIL;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 text-sm font-bold text-slate-900 text-left">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-slate-600 text-left">{children}</div>
    </section>
  );
}

export function TermsModal() {
  const [open, setOpen] = useState(false);

  // lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="underline underline-offset-2 hover:text-slate-600 transition-colors"
      >
        terms
      </button>

      {open ? (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm"
            aria-hidden
            onClick={() => setOpen(false)}
          />

          {/* Modal — reset text alignment regardless of parent */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Terms of Service"
            className="fixed inset-x-4 bottom-0 top-[5vh] z-50 mx-auto flex max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white text-left shadow-2xl sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600">Legal</p>
                <h2 className="text-lg font-bold text-slate-900">Terms of Service</h2>
                <p className="text-xs text-slate-400">Effective: {EFFECTIVE_DATE}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                aria-label="Close"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
              <Section title="1. Acceptance of Terms">
                <p>By creating an account or using Zboun ("the Platform"), you agree to be bound by these Terms. If you do not agree, please do not use the Platform.</p>
              </Section>

              <Section title="2. What Zboun Does">
                <p>Zboun provides a digital menu and online ordering platform that connects customers with restaurants. Zboun is a technology intermediary and is not responsible for the preparation, quality, or delivery of food or goods ordered through the Platform.</p>
              </Section>

              <Section title="3. Customer Accounts">
                <p>You must provide accurate and complete information when creating an account. You are responsible for keeping your credentials secure and for all activity under your account.</p>
                <p>You may delete your account at any time from Account Settings. We will remove your personal data accordingly.</p>
              </Section>

              <Section title="4. Placing Orders">
                <p>Orders are sent directly to the restaurant. Zboun does not process payments — any payment arrangements are solely between you and the restaurant.</p>
                <p>Zboun is not responsible for order cancellations, incorrect items, or unfulfilled orders. Please contact the restaurant directly for any issues.</p>
              </Section>

              <Section title="5. Restaurant Listings">
                <p>Restaurant information (menus, prices, hours, availability) is provided by the restaurant and may not always be up to date. Zboun makes no warranties regarding its accuracy.</p>
              </Section>

              <Section title="6. Intellectual Property">
                <p>All Zboun content — including the name, logo, design, and software — is the property of Zboun and may not be reproduced without written permission. Restaurants retain ownership of their own uploaded content.</p>
              </Section>

              <Section title="7. Prohibited Use">
                <p>You agree not to:</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Use the Platform for any unlawful purpose</li>
                  <li>Scrape, copy, or reverse-engineer any part of the Platform</li>
                  <li>Submit false or fraudulent orders</li>
                  <li>Harass or impersonate any restaurant, user, or Zboun employee</li>
                </ul>
              </Section>

              <Section title="8. Limitation of Liability">
                <p>To the fullest extent permitted by law, Zboun shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform.</p>
              </Section>

              <Section title="9. Changes to These Terms">
                <p>We may update these Terms from time to time. Continued use of the Platform after changes are posted constitutes your acceptance. We will update the effective date at the top.</p>
              </Section>

              <Section title="10. Contact">
                <p>
                  Questions?{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-violet-600 underline underline-offset-2 hover:text-violet-700">
                    {CONTACT_EMAIL}
                  </a>
                </p>
              </Section>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-slate-100 px-5 py-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full rounded-2xl bg-violet-600 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
              >
                I understand
              </button>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
