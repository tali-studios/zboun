import type { SuperAdminOrderStoreRow } from "@/lib/super-admin-orders-data";

type Props = {
  stores: SuperAdminOrderStoreRow[];
};

function formatUsd(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function SuperAdminOrdersByStore({ stores }: Props) {
  if (stores.length === 0) {
    return (
      <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
        No orders on the platform yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
            <th className="px-3 py-2.5">Store</th>
            <th className="px-3 py-2.5 text-right">Orders</th>
            <th className="px-3 py-2.5 text-right">Delivered</th>
            <th className="px-3 py-2.5 text-right">Cancelled</th>
            <th className="px-3 py-2.5 text-right">GMV</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {stores.map((store) => (
            <tr key={store.restaurantId} className="hover:bg-violet-50/40">
              <td className="px-3 py-3">
                <p className="font-semibold text-slate-900">{store.name}</p>
                {store.slug ? (
                  <p className="text-xs text-slate-400">/{store.slug}</p>
                ) : null}
              </td>
              <td className="px-3 py-3 text-right font-bold tabular-nums text-slate-900">
                {store.count}
              </td>
              <td className="px-3 py-3 text-right tabular-nums text-emerald-700">
                {store.delivered}
              </td>
              <td className="px-3 py-3 text-right tabular-nums text-rose-700">
                {store.cancelled}
              </td>
              <td className="px-3 py-3 text-right tabular-nums text-slate-700">
                {formatUsd(store.gmvUsd)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
