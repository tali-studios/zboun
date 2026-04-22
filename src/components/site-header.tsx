 "use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SiteHeaderProps = {
  largeLogo?: boolean;
};

export function SiteHeader({
  largeLogo = false,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const tabs = [
    { href: "/", label: "Browse", isActive: pathname === "/" },
    { href: "/for-restaurants", label: "Join Us", isActive: pathname === "/for-restaurants" },
    { href: "/contact", label: "Contact", isActive: pathname === "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-violet-100/80 bg-white/80 backdrop-blur-2xl">
      <div className="container flex flex-col items-center gap-3 py-3 md:flex-row md:justify-between md:py-3.5">

        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center outline-none transition-opacity hover:opacity-85 focus-visible:opacity-85"
        >
          <Image
            src="/Logo.svg"
            alt="Zboun"
            width={largeLogo ? 200 : 160}
            height={largeLogo ? 56 : 44}
            priority
            unoptimized
            className={`w-auto object-contain ${largeLogo ? "h-9 sm:h-10 md:h-11" : "h-8 sm:h-9"}`}
          />
        </Link>

        {/* Unified 3-tab navbar */}
        <nav
          className="grid w-full max-w-[460px] grid-cols-3 gap-1 rounded-full bg-slate-100/80 p-1"
          aria-label="Main"
        >
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`rounded-full px-3 py-2 text-center text-sm font-semibold transition ${
                tab.isActive
                  ? "bg-violet-600 text-white"
                  : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
