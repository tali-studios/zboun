import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight text-slate-900">
          Zboun
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium text-slate-700">
          <Link href="/contact" className="hover:text-slate-900">
            Contact
          </Link>
          <Link
            href="/dashboard/login"
            className="rounded-full bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight text-slate-900">
          Zboun
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium text-slate-700">
          <Link href="/contact" className="hover:text-slate-900">
            Contact
          </Link>
          <Link
            href="/dashboard/login"
            className="rounded-full bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
