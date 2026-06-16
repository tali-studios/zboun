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
      <header className="border-b border-slate-200/70 bg-white/95 backdrop-blur-md">
        <div className="container flex h-14 items-center">
          <Link href="/" className="shrink-0" aria-label="Zboun home">
            <Image src="/Logo.svg" alt="Zboun" width={100} height={28} className="h-7 w-auto" unoptimized />
          </Link>
        </div>
      </header>

      <main className="container flex flex-1 flex-col py-8 sm:py-12">
        <AppInstallPanel installUrl={installUrl} />
      </main>

      <SiteFooter />
    </div>
  );
}
