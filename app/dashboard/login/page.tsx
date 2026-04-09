import { signInAction } from "@/app-actions/auth";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form
        action={signInAction}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
      >
        <h1 className="text-2xl font-bold text-slate-900">Dashboard login</h1>
        <p className="mt-1 text-sm text-slate-600">For super admins and restaurant admins.</p>
        {error && <p className="mt-4 text-sm text-red-600">Invalid credentials.</p>}
        <div className="mt-4 space-y-3">
          <input
            type="email"
            name="email"
            required
            placeholder="Email"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />
          <input
            type="password"
            name="password"
            required
            placeholder="Password"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />
          <button className="w-full rounded-xl bg-slate-900 py-3 font-semibold text-white">
            Sign in
          </button>
        </div>
      </form>
    </main>
  );
}
