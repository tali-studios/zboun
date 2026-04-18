import { signInAction } from "@/app-actions/auth";
import Image from "next/image";
import Link from "next/link";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-emerald-50/80 via-white to-slate-100 px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-8 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 bottom-8 h-56 w-56 rounded-full bg-slate-400/20 blur-3xl"
      />

      <form
        action={signInAction}
        className="relative w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.28)] backdrop-blur-sm sm:p-8"
      >
        <div className="mb-5 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex rounded-xl bg-white px-2 py-1.5 shadow-sm ring-1 ring-slate-200 transition hover:opacity-90"
          >
            <Image
              src="/zboun_logo.svg"
              alt="Zboun"
              width={130}
              height={38}
              className="h-8 w-auto object-contain"
              priority
              unoptimized
            />
          </Link>
          <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-800">
            Back to website
          </Link>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard login</h1>
        <p className="mt-1 text-sm text-slate-600">For super admins and restaurant admins.</p>
        {error === "invalid_credentials" && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            Invalid credentials.
          </p>
        )}
        {error === "missing_profile" && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Your account exists in Supabase Auth, but it’s missing the app profile row in{" "}
            <code className="font-mono">public.users</code>. Create that row (role + restaurant_id)
            and try again.
          </p>
        )}
        <div className="mt-4 space-y-3">
          <input
            type="email"
            name="email"
            required
            placeholder="Email"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
          <input
            type="password"
            name="password"
            required
            placeholder="Password"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
          <button className="w-full rounded-xl bg-slate-900 py-3 font-semibold text-white transition hover:bg-slate-800">
            Sign in
          </button>
        </div>
      </form>
    </main>
  );
}
