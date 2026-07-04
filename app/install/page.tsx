import Image from "next/image";
import Link from "next/link";
import { AppInstallPanel } from "@/components/app-install-panel";
import { SiteFooter } from "@/components/site-footer";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default function InstallAppPage() {
  const installUrl = `${getSiteUrl()}/install`;

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f8ff]">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container flex h-16 items-center justify-between gap-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              className="shrink-0 outline-none transition-opacity hover:opacity-85 focus-visible:opacity-85"
              aria-label="Zboun home"
            >
              <Image
                src="/Logo.svg?v=3"
                alt="Zboun"
                width={120}
                height={34}
                className="h-9 w-auto object-contain"
                unoptimized
                priority
              />
            </Link>
            <span className="text-slate-300" aria-hidden>
              /
            </span>
            <p className="truncate text-sm font-semibold text-slate-600">Add to home screen</p>
          </div>
        </div>
      </header>

      <main className="container flex flex-1 flex-col py-8 sm:py-12">
        <AppInstallPanel installUrl={installUrl} />
      </main>

      <SiteFooter />
    </div>
  );
}
