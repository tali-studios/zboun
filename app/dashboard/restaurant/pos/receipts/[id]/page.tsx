import { notFound, redirect } from "next/navigation";
import { PrintReceiptButton } from "@/components/print-receipt-button";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PosReceiptPage({ params }: Props) {
  const { id } = await params;
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

  const [{ data: restaurant }, { data: order }] = await Promise.all([
    supabase.from("restaurants").select("name, logo_url, phone, location").eq("id", appUser.restaurant_id).single(),
    supabase
      .from("pos_orders")
      .select("id, receipt_number, order_type, status, subtotal, tax_amount, total_amount, paid_amount, note, created_at")
      .eq("id", id)
      .eq("restaurant_id", appUser.restaurant_id)
      .maybeSingle(),
  ]);
  if (!order) notFound();

  const { data: items } = await supabase
    .from("pos_order_items")
    .select("id, item_name, qty, unit_price, line_total")
    .eq("order_id", order.id)
    .eq("restaurant_id", appUser.restaurant_id);

  return (
    <main className="min-h-screen bg-[#f8f8ff] p-4 print:bg-white print:p-0">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 print:rounded-none print:shadow-none print:ring-0">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-600">POS Customer Receipt</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">{restaurant?.name}</h1>
            <p className="mt-1 text-xs text-slate-500">{restaurant?.location ?? "Location not set"} · {restaurant?.phone ?? "Phone not set"}</p>
          </div>
          {restaurant?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={restaurant.logo_url} alt={`${restaurant.name} logo`} className="h-12 w-12 rounded-lg object-cover ring-1 ring-slate-200" />
          ) : null}
        </div>

        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
          <p><span className="font-semibold">Receipt #:</span> {order.receipt_number ?? "Pending"}</p>
          <p><span className="font-semibold">Order type:</span> {order.order_type.replace("_", " ")}</p>
          <p><span className="font-semibold">Date:</span> {new Date(order.created_at).toLocaleString()}</p>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Item</th>
                <th className="px-3 py-2">Qty</th>
                <th className="px-3 py-2">Unit</th>
                <th className="px-3 py-2">Line</th>
              </tr>
            </thead>
            <tbody>
              {(items ?? []).map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-3 py-2">{item.item_name}</td>
                  <td className="px-3 py-2">{Number(item.qty)}</td>
                  <td className="px-3 py-2">${Number(item.unit_price).toFixed(2)}</td>
                  <td className="px-3 py-2 font-semibold">${Number(item.line_total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 ml-auto w-full max-w-xs space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>${Number(order.subtotal).toFixed(2)}</span></div>
          <div className="flex justify-between"><span>VAT</span><span>${Number(order.tax_amount).toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-slate-900"><span>Total</span><span>${Number(order.total_amount).toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Paid</span><span>${Number(order.paid_amount).toFixed(2)}</span></div>
        </div>

        <div className="mt-6 flex gap-2 print:hidden">
          <a href="/dashboard/restaurant/pos/receipts" className="btn btn-secondary rounded-xl">Back</a>
          <PrintReceiptButton />
        </div>
      </div>
    </main>
  );
}
