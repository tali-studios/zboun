import { signInAction } from "@/app-actions/auth";
import Image from "next/image";
import Link from "next/link";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8f8ff] px-4 py-12">
      {/* Background gradient blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[420px] w-[700px] rounded-full bg-gradient-to-br from-violet-300/35 via-fuchsia-200/20 to-transparent blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-fuchsia-300/20 blur-3xl"
      />

      <form
        action={signInAction}
        className="relative w-full max-w-sm rounded-3xl border border-violet-100 bg-white p-7 shadow-[0_20px_60px_rgba(120,84,255,0.16)] sm:p-8"
      >
        {/* Logo + back link */}
        <div className="mb-7 flex items-center justify-between">
          <Link href="/" className="flex rounded-xl outline-none transition-opacity hover:opacity-80">
            <Image
              src="/Logo.svg"
              alt="Zboun"
              width={120}
              height={36}
              className="h-8 w-auto object-contain"
              priority
              unoptimized
            />
          </Link>
          <Link
            href="/"
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-violet-300 hover:text-violet-700"
          >
            ← Home
          </Link>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign in</h1>
        <p className="mt-1 text-sm text-slate-500">Restaurant &amp; super admin dashboard.</p>

        {/* Errors */}
        {error === "invalid_credentials" && (
          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
            Invalid credentials. Please try again.
          </div>
        )}
        {error === "missing_profile" && (
          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            Account exists but is missing an app profile row in{" "}
            <code className="font-mono">public.users</code>. Please contact your admin.
          </div>
        )}
        {error === "missing_restaurant_link" && (
          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            No restaurant linked to your account. Set{" "}
            <code className="font-mono">restaurant_id</code> in{" "}
            <code className="font-mono">public.users</code>.
          </div>
        )}

        {/* Fields */}
        <div className="mt-5 space-y-3">
          <input
            type="email"
            name="email"
            required
            placeholder="Email address"
            className="ui-input"
          />
          <input
            type="password"
            name="password"
            required
            placeholder="Password"
            className="ui-input"
          />
          <button
            type="submit"
            className="mt-1 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-md shadow-violet-400/30 transition hover:brightness-110"
          >
            Sign in
          </button>
        </div>
      </form>
    </main>
  );
}
