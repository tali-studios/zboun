import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

/** Legacy dashboard login URL — one shared login at /login. */
export default async function DashboardLoginPage({ searchParams }: Props) {
  const { error, next } = await searchParams;
  const params = new URLSearchParams();
  if (error) params.set("error", error);
  if (next) params.set("next", next);
  const query = params.toString();
  redirect(query ? `/login?${query}` : "/login");
}
