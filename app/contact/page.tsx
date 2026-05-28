import { ZbounContactOptions } from "@/components/zboun-contact-options";
import { SiteFooter } from "@/components/site-footer";
import { BackToTopButton } from "@/components/back-to-top-button";
import Image from "next/image";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f8ff]">
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="shrink-0 outline-none transition-opacity hover:opacity-80" aria-label="Zboun home">
              <Image
                src="/Logo.svg"
                alt="Zboun"
                width={120}
                height={34}
                className="h-8 w-auto"
                unoptimized
                priority
              />
            </Link>
            <span className="text-slate-300" aria-hidden>/</span>
            <p className="text-sm font-semibold text-slate-600">Contact us</p>
          </div>

          <div aria-hidden />
        </div>
      </header>
      <main className="container flex flex-1 flex-col items-center justify-center py-12 pt-16 md:py-16 md:pt-20">
        <div className="w-full max-w-xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600">Get in touch</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Contact us
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Reach us by email or WhatsApp — we&apos;ll get your ordering page live quickly.
            </p>
          </div>

          {/* Form card */}
          <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-[0_12px_40px_rgba(120,84,255,0.1)] sm:p-8">
            <ZbounContactOptions variant="page" />
          </div>
        </div>
      </main>

      <SiteFooter />
      <BackToTopButton />
    </div>
  );
}
