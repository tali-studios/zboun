import { ContactWhatsAppForm } from "@/components/contact-whatsapp-form";
import { SiteFooter } from "@/components/site-footer";

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f8ff]">
      <main className="container flex flex-1 flex-col items-center justify-center py-12 pt-16 md:py-16 md:pt-20">
        <div className="w-full max-w-xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600">Get in touch</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Contact us
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Tell us about your restaurant and we&apos;ll get your ordering page live quickly.
            </p>
          </div>

          {/* Form card */}
          <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-[0_12px_40px_rgba(120,84,255,0.1)] sm:p-8">
            <ContactWhatsAppForm />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
