"use client";

type StockRiskItem = {
  id: string;
  name: string;
  currentQty: number;
  minQty: number;
};

type ChannelStatusItem = {
  label: string;
  count: number;
  tone: "good" | "warn" | "danger" | "neutral";
};

type CustomerSignal = {
  label: string;
  value: string;
  tone?: "good" | "warn" | "neutral";
};

type DailyCloseItem = {
  label: string;
  status: "good" | "warn";
  detail: string;
};

type PurchaseSuggestion = {
  itemName: string;
  currentQty: number;
  targetQty: number;
  suggestedReorderQty: number;
};

type CampaignSuggestion = {
  title: string;
  detail: string;
};

type DailyCloseHistoryItem = {
  id: string;
  closedAt: string;
  closedByName: string;
  notes: string | null;
  queueOpen: number;
};

type DailyClosePayload = {
  posOpenOrders: number;
  ecommerceActiveOrders: number;
  ecommercePendingOrders: number;
  inventoryLowStock: number;
  inventoryOutOfStock: number;
  revenueToday: number;
  reactivationPool: number;
};

type Props = {
  businessName: string;
  posOpenOrders: number;
  ecommerceActiveOrders: number;
  ecommercePendingOrders: number;
  inventoryLowStock: number;
  inventoryOutOfStock: number;
  todayRetailRevenue: number;
  avgOrderValue: number;
  channelMixOnlineShare: number;
  stockRiskItems: StockRiskItem[];
  channelStatus: ChannelStatusItem[];
  customerSignals: CustomerSignal[];
  dailyCloseChecklist: DailyCloseItem[];
  purchaseSuggestions: PurchaseSuggestion[];
  campaignSuggestions: CampaignSuggestion[];
  dailyCloseHistory: DailyCloseHistoryItem[];
  closePayload: DailyClosePayload;
  markRetailDailyCloseAction: (fd: FormData) => Promise<void>;
};

function fmtMoney(value: number) {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function RetailOpsPanel({
  businessName,
  posOpenOrders,
  ecommerceActiveOrders,
  ecommercePendingOrders,
  inventoryLowStock,
  inventoryOutOfStock,
  todayRetailRevenue,
  avgOrderValue,
  channelMixOnlineShare,
  stockRiskItems,
  channelStatus,
  customerSignals,
  dailyCloseChecklist,
  purchaseSuggestions,
  campaignSuggestions,
  dailyCloseHistory,
  closePayload,
  markRetailDailyCloseAction,
}: Props) {
  return (
    <main className="min-h-screen bg-[#f8f8ff] p-3 sm:p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 via-violet-600 to-fuchsia-600 p-5 text-white shadow-lg shadow-violet-600/30 md:p-6">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-violet-200">Retail ops console</p>
              <h1 className="mt-1 text-xl font-bold md:text-2xl">{businessName}</h1>
              <p className="mt-0.5 text-xs text-violet-200 md:text-sm">Omnichannel sales, stock risk, and customer growth control center.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="/dashboard/business/pos" className="btn rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20">POS</a>
              <a href="/dashboard/business/inventory" className="btn rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20">Inventory</a>
              <a href="/dashboard/business/ecommerce" className="btn rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20">E-commerce</a>
              <a href="/dashboard/business" className="btn rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20">Dashboard</a>
            </div>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <article className="panel p-5"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Open POS</p><p className="mt-2 text-3xl font-bold tracking-tight text-violet-700">{posOpenOrders}</p></article>
          <article className="panel p-5"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Online active</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{ecommerceActiveOrders}</p></article>
          <article className="panel p-5"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Online pending</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{ecommercePendingOrders}</p></article>
          <article className="panel p-5"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Low / out stock</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{inventoryLowStock} / {inventoryOutOfStock}</p></article>
          <article className="panel p-5"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Revenue today</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{fmtMoney(todayRetailRevenue)}</p></article>
        </section>

        <section className="panel p-5">
          <h2 className="panel-title">Executive performance snapshot</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Average order value</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{fmtMoney(avgOrderValue)}</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Online mix</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{channelMixOnlineShare}%</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Inventory stress</p>
              <p className={`mt-2 text-2xl font-bold ${inventoryOutOfStock > 0 ? "text-red-700" : inventoryLowStock > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                {inventoryOutOfStock > 0 ? "High" : inventoryLowStock > 0 ? "Watch" : "Healthy"}
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Order pressure</p>
              <p className={`mt-2 text-2xl font-bold ${ecommercePendingOrders > 12 ? "text-amber-700" : "text-emerald-700"}`}>
                {ecommercePendingOrders > 12 ? "At risk" : "Controlled"}
              </p>
            </article>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="panel p-5">
            <h2 className="panel-title">Stock risk radar</h2>
            <div className="mt-4 space-y-2">
              {stockRiskItems.length === 0 ? (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">No immediate stock risks. Inventory looks healthy.</p>
              ) : (
                stockRiskItems.map((item) => (
                  <article key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                      <p className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${item.currentQty <= 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                        {item.currentQty <= 0 ? "out of stock" : "low stock"}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Current: {item.currentQty} · Minimum target: {item.minQty}</p>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="panel p-5">
            <h2 className="panel-title">Omnichannel pipeline</h2>
            <div className="mt-4 grid gap-2">
              {channelStatus.map((stage) => (
                <article key={stage.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-800">{stage.label}</p>
                    <p
                      className={`text-lg font-bold ${
                        stage.tone === "danger"
                          ? "text-red-700"
                          : stage.tone === "warn"
                            ? "text-amber-700"
                            : stage.tone === "good"
                              ? "text-emerald-700"
                              : "text-slate-900"
                      }`}
                    >
                      {stage.count}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="panel-title">Customer and loyalty signals</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {customerSignals.map((signal) => (
              <article key={signal.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{signal.label}</p>
                <p
                  className={`mt-2 text-2xl font-bold ${
                    signal.tone === "warn" ? "text-amber-700" : signal.tone === "good" ? "text-emerald-700" : "text-slate-900"
                  }`}
                >
                  {signal.value}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="panel-title">Retail daily close workflow</h2>
              <p className="mt-1 text-sm text-slate-600">End-of-day controls for finance, stock replenishment, and growth actions.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="/dashboard/business/pos" className="btn btn-secondary rounded-xl text-sm">Reconcile POS</a>
              <a href="/dashboard/business/inventory" className="btn btn-secondary rounded-xl text-sm">Approve purchases</a>
              <a href="/dashboard/business/crm" className="btn btn-secondary rounded-xl text-sm">Launch campaign</a>
              <form action={markRetailDailyCloseAction} className="flex items-start gap-2">
                <input type="hidden" name="pos_open_orders" value={closePayload.posOpenOrders} />
                <input type="hidden" name="ecommerce_active_orders" value={closePayload.ecommerceActiveOrders} />
                <input type="hidden" name="ecommerce_pending_orders" value={closePayload.ecommercePendingOrders} />
                <input type="hidden" name="inventory_low_stock" value={closePayload.inventoryLowStock} />
                <input type="hidden" name="inventory_out_of_stock" value={closePayload.inventoryOutOfStock} />
                <input type="hidden" name="revenue_today" value={closePayload.revenueToday} />
                <input type="hidden" name="reactivation_pool" value={closePayload.reactivationPool} />
                <input
                  name="notes"
                  placeholder="Close notes (optional)"
                  className="ui-input min-w-[200px]"
                />
                <button className="btn btn-primary rounded-xl text-sm">Mark close complete</button>
              </form>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Close checklist</p>
              <div className="mt-3 space-y-2">
                {dailyCloseChecklist.map((item) => (
                  <article key={item.label} className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                      <p className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${item.status === "good" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {item.status === "good" ? "ok" : "review"}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Purchase suggestions</p>
              <div className="mt-3 space-y-2">
                {purchaseSuggestions.length === 0 ? (
                  <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">No urgent replenishment required.</p>
                ) : (
                  purchaseSuggestions.map((item) => (
                    <article key={item.itemName} className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-sm font-semibold text-slate-800">{item.itemName}</p>
                      <p className="mt-1 text-xs text-slate-500">On hand: {item.currentQty} · Target: {item.targetQty}</p>
                      <p className="mt-1 text-xs font-semibold text-amber-700">Suggested reorder: {item.suggestedReorderQty}</p>
                    </article>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Campaign recommendations</p>
              <div className="mt-3 space-y-2">
                {campaignSuggestions.map((item) => (
                  <article key={item.title} className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Daily close history</p>
            <div className="mt-3 space-y-2">
              {dailyCloseHistory.length === 0 ? (
                <p className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600">No daily close entries yet.</p>
              ) : (
                dailyCloseHistory.map((entry) => (
                  <article key={entry.id} className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800">
                        {new Date(entry.closedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <p className="text-xs text-slate-500">By {entry.closedByName} · Queue open: {entry.queueOpen}</p>
                    </div>
                    {entry.notes ? <p className="mt-1 text-xs text-slate-600">{entry.notes}</p> : null}
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
