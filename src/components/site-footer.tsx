import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-14 border-t border-slate-200/80 bg-white/80">
      <div className="container flex flex-col gap-5 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-slate-900">Zboun</p>
          <p className="mt-1">Turn your menu into instant WhatsApp orders.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/" className="hover:text-slate-900">
            Home
          </Link>
          <Link href="/contact" className="hover:text-slate-900">
            Contact
          </Link>
          <a href="https://wa.me/96171212734" className="hover:text-slate-900">
            WhatsApp
          </a>
        </div>
        <p className="text-xs text-slate-500">© {new Date().getFullYear()} Zboun. All rights reserved.</p>
      </div>
    </footer>
  );
}
