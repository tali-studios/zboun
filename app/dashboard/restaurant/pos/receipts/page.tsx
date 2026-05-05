import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PosReceiptsPage() {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) {
    redirect("/dashboard/login");
  }
  const supabase = await createServerSupabaseClient();
  const { data: addon } = await supabase
    .from("restaurant_addons")
    .select("is_enabled")
    .eq("restaurant_id", appUser.restaurant_id)
    .eq("addon_key", "pos")
    .maybeSingle();
  if (!addon?.is_enabled) {
    redirect("/dashboard/restaurant");
  }

  const { data: orders } = await supabase
    .from("pos_orders")
    .select("id, receipt_number, order_type, status, total_amount, created_at")
    .eq("restaurant_id", appUser.restaurant_id)
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <main className="min-h-screen bg-[#f8f8ff] p-3 sm:p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <header className="panel p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-600">Cloud POS</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Receipt Center</h1>
          <a href="/dashboard/restaurant/pos" className="mt-2 inline-flex text-sm font-semibold text-cyan-700 hover:underline">Back to POS →</a>
        </header>
        <section className="panel p-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="py-2">Receipt #</th>
                  <th className="py-2">Order type</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Created</th>
                  <th className="py-2">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {(orders ?? []).map((order) => (
                  <tr key={order.id} className="border-b border-slate-100">
                    <td className="py-2">{order.receipt_number ?? "Pending"}</td>
                    <td className="py-2 capitalize">{order.order_type.replace("_", " ")}</td>
                    <td className="py-2 capitalize">{order.status}</td>
                    <td className="py-2 font-semibold">${Number(order.total_amount).toFixed(2)}</td>
                    <td className="py-2">{new Date(order.created_at).toLocaleString()}</td>
                    <td className="py-2"><a href={`/dashboard/restaurant/pos/receipts/${order.id}`} className="text-cyan-700 hover:underline">Open</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
