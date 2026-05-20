"use client";

import { useCallback, useState } from "react";
import { ContactWhatsAppForm } from "@/components/contact-whatsapp-form";
import {
  ZBOUN_OPS_EMAIL,
  buildMailtoUrl,
  buildWhatsAppUrl,
} from "@/lib/zboun-contact";

type ContactMethod = "email" | "whatsapp";

type Props = {
  /** Full contact page with forms; billing = quick action buttons only. */
  variant?: "page" | "billing";
  /** Prefill context (billing / renewals). */
  restaurantName?: string;
};

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.124 1.532 5.859L.054 23.285a.75.75 0 00.916.916l5.437-1.478A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.67-.5-5.21-1.374l-.374-.213-3.867 1.051 1.052-3.843-.226-.386A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function MethodToggle({
  method,
  onChange,
  compact,
}: {
  method: ContactMethod;
  onChange: (m: ContactMethod) => void;
  compact?: boolean;
}) {
  const base =
    "flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition";
  const active = "border-violet-600 bg-violet-50 text-violet-800";
  const inactive = "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50/50";

  return (
    <div className={`flex gap-2 ${compact ? "" : "mb-6"}`} role="tablist" aria-label="Contact method">
      <button
        type="button"
        role="tab"
        aria-selected={method === "email"}
        className={`${base} ${method === "email" ? active : inactive}`}
        onClick={() => onChange("email")}
      >
        <MailIcon className="h-4 w-4 shrink-0" />
        Email
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={method === "whatsapp"}
        className={`${base} ${method === "whatsapp" ? active : inactive}`}
        onClick={() => onChange("whatsapp")}
      >
        <WhatsAppIcon className="h-4 w-4 shrink-0 text-[#25D366]" />
        WhatsApp
      </button>
    </div>
  );
}

function ContactEmailForm({ restaurantName }: { restaurantName?: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim() || !message.trim()) {
        window.alert("Please fill Name and Message.");
        return;
      }
      const subject = restaurantName
        ? `Zboun — ${restaurantName}`
        : "Zboun — Contact inquiry";
      const lines = [
        `Name: ${name.trim()}`,
        phone.trim() ? `Phone: ${phone.trim()}` : null,
        restaurantName ? `Restaurant: ${restaurantName}` : null,
        "",
        message.trim(),
      ].filter(Boolean);
      window.location.assign(
        buildMailtoUrl({ subject, body: lines.join("\n") }),
      );
    },
    [name, phone, message, restaurantName],
  );

  return (
    <form className="space-y-4" onSubmit={submit} noValidate>
      <p className="text-sm text-slate-600">
        Your email app will open a message to{" "}
        <a href={`mailto:${ZBOUN_OPS_EMAIL}`} className="font-semibold text-violet-700 underline">
          {ZBOUN_OPS_EMAIL}
        </a>
        .
      </p>
      <input
        type="text"
        name="name"
        placeholder="Your name"
        className="ui-input"
        value={name}
        onChange={(ev) => setName(ev.target.value)}
        required
        autoComplete="name"
      />
      <input
        type="tel"
        name="phone"
        placeholder="Phone (optional)"
        className="ui-input"
        value={phone}
        onChange={(ev) => setPhone(ev.target.value)}
        autoComplete="tel"
      />
      <textarea
        name="message"
        placeholder="How can we help?"
        rows={4}
        className="ui-textarea"
        value={message}
        onChange={(ev) => setMessage(ev.target.value)}
        required
        minLength={2}
      />
      <button type="submit" className="btn btn-primary w-full rounded-xl py-3">
        <MailIcon className="mr-2 inline h-4 w-4" />
        Send email
      </button>
    </form>
  );
}

export function ZbounContactOptions({ variant = "page", restaurantName }: Props) {
  const [method, setMethod] = useState<ContactMethod>("email");

  if (variant === "billing") {
    const waText = restaurantName
      ? `Hello Zboun,\n\nI need help with billing / subscription for ${restaurantName}.`
      : "Hello Zboun,\n\nI need help with my Zboun billing / subscription.";
    const mailSubject = restaurantName
      ? `Zboun billing — ${restaurantName}`
      : "Zboun billing inquiry";
    const mailBody = restaurantName
      ? `Hello Zboun,\n\nI would like help with billing for ${restaurantName}.\n\n`
      : "Hello Zboun,\n\nI would like help with my subscription.\n\n";

    return (
      <section className="panel rounded-2xl p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Contact Zboun</h2>
        <p className="mt-2 text-sm text-slate-600">
          Renew your plan, ask about invoices, or get support — by email or WhatsApp.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <a
            href={buildMailtoUrl({ subject: mailSubject, body: mailBody })}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-violet-200 bg-violet-50 px-4 py-3.5 text-sm font-semibold text-violet-800 transition hover:border-violet-400 hover:bg-violet-100"
          >
            <MailIcon className="h-5 w-5 shrink-0" />
            <span>
              Email
              <span className="mt-0.5 block text-xs font-normal text-violet-600">{ZBOUN_OPS_EMAIL}</span>
            </span>
          </a>
          <a
            href={buildWhatsAppUrl(waText)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#25D366]/40 bg-[#25D366]/10 px-4 py-3.5 text-sm font-semibold text-[#128C7E] transition hover:border-[#25D366] hover:bg-[#25D366]/15"
          >
            <WhatsAppIcon className="h-5 w-5 shrink-0" />
            WhatsApp
          </a>
        </div>
      </section>
    );
  }

  return (
    <div>
      <MethodToggle method={method} onChange={setMethod} />
      <div role="tabpanel">
        {method === "email" ? (
          <ContactEmailForm restaurantName={restaurantName} />
        ) : (
          <ContactWhatsAppForm />
        )}
      </div>
    </div>
  );
}
