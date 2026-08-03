"use client";

import { useState, useTransition } from "react";
import type { StockSyncPlatform, StockSyncSettingsRow, StockSyncEventRow } from "@/lib/stock-sync";

type MenuItemRow = {
  id: string;
  name: string;
  external_sku: string | null;
  track_stock: boolean;
  stock_quantity: number | null;
  is_available: boolean;
};

type UpdateSkuResult = { ok: true } | { ok: false; error: string };

type Props = {
  appUrl: string;
  settings: StockSyncSettingsRow | null;
  items: MenuItemRow[];
  events: StockSyncEventRow[];
  saveSettingsAction: (formData: FormData) => void | Promise<void>;
  regenerateApiKeyAction: () => void | Promise<void>;
  regenerateSecretAction: () => void | Promise<void>;
  updateSkuAction: (formData: FormData) => Promise<UpdateSkuResult>;
};

const PLATFORM_LABELS: Record<StockSyncPlatform, string> = {
  shopify: "Shopify",
  woocommerce: "WooCommerce",
  custom: "Custom website",
};

function CopyField({ label, value, secret = false }: { label: string; value: string; secret?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(!secret);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  const displayValue = revealed ? value : "•".repeat(Math.min(28, value.length || 10));

  return (
    <div>
      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 truncate rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700">
          {displayValue}
        </code>
        {secret ? (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50"
          >
            {revealed ? "Hide" : "Show"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={copy}
          className={`shrink-0 rounded-lg border px-2.5 py-2 text-xs font-semibold transition ${
            copied
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-violet-200 text-violet-700 hover:bg-violet-50"
          }`}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

function SkuRow({ item, updateSkuAction }: { item: MenuItemRow; updateSkuAction: Props["updateSkuAction"] }) {
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState(item.external_sku ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function submit() {
    setError(null);
    setSaved(false);
    const formData = new FormData();
    formData.set("id", item.id);
    formData.set("external_sku", value.trim());
    startTransition(async () => {
      const result = await updateSkuAction(formData);
      if (result.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-2 pr-3">
        <p className="text-sm font-medium text-slate-800">{item.name}</p>
        {item.track_stock ? (
          <p className="text-xs text-slate-400">
            {item.stock_quantity ?? 0} in stock · {item.is_available ? "Available" : "Unavailable"}
          </p>
        ) : (
          <p className="text-xs text-slate-400">Stock tracking off</p>
        )}
      </td>
      <td className="py-2">
        <div className="flex items-center gap-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); submit(); }
            }}
            placeholder="e.g. COKE-330"
            className="ui-input h-9 w-40 text-sm"
          />
          <button
            type="button"
            disabled={pending || value.trim() === (item.external_sku ?? "")}
            onClick={submit}
            className="h-9 shrink-0 rounded-lg border border-violet-200 px-3 text-xs font-semibold text-violet-700 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending ? "Saving…" : saved ? "Saved" : "Save"}
          </button>
        </div>
        {error ? <p className="mt-1 text-xs font-medium text-red-600">{error}</p> : null}
      </td>
    </tr>
  );
}

export function StockSyncPanel({
  appUrl,
  settings,
  items,
  events,
  saveSettingsAction,
  regenerateApiKeyAction,
  regenerateSecretAction,
  updateSkuAction,
}: Props) {
  const [platform, setPlatform] = useState<StockSyncPlatform>(settings?.platform ?? "custom");
  const [docsTab, setDocsTab] = useState<StockSyncPlatform>(settings?.platform ?? "custom");
  const [isEnabled, setIsEnabled] = useState(settings?.is_enabled ?? false);

  const inboundEndpoint = `${appUrl.replace(/\/$/, "")}/api/integrations/stock`;
  const apiKey = settings?.inbound_api_key ?? "";
  const outboundSecret = settings?.outbound_secret ?? "";

  const curlSnippet = `curl -X POST ${inboundEndpoint} \\
  -H "Authorization: Bearer ${apiKey || "YOUR_API_KEY"}" \\
  -H "Content-Type: application/json" \\
  -d '{"sku": "COKE-330", "quantity": 12}'`;

  const wooSnippet = `// WooCommerce: hook a stock change and forward it to Zboun
add_action('woocommerce_product_set_stock', function ($product) {
  wp_remote_post('${inboundEndpoint}', [
    'headers' => [
      'Authorization' => 'Bearer ${apiKey || "YOUR_API_KEY"}',
      'Content-Type'  => 'application/json',
    ],
    'body' => json_encode([
      'sku'      => $product->get_sku(),
      'quantity' => $product->get_stock_quantity(),
    ]),
  ]);
});`;

  const shopifySnippet = `// Shopify: forward an inventory_levels/update webhook to Zboun
// (map the Shopify variant SKU before calling this)
fetch("${inboundEndpoint}", {
  method: "POST",
  headers: {
    Authorization: "Bearer ${apiKey || "YOUR_API_KEY"}",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ sku: variantSku, quantity: available }),
});`;

  const docsSnippets: Record<StockSyncPlatform, { title: string; body: string }> = {
    custom: { title: "Any custom website / backend", body: curlSnippet },
    woocommerce: { title: "WordPress + WooCommerce", body: wooSnippet },
    shopify: { title: "Shopify (via webhook forwarder)", body: shopifySnippet },
  };

  return (
    <div className="space-y-6">
      {/* How it works */}
      <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">How two-way stock sync works</h2>
        <ol className="mt-3 space-y-1.5 text-sm text-slate-600">
          <li><span className="font-semibold text-violet-700">1.</span> Map each item's SKU below (same SKU used on your website).</li>
          <li><span className="font-semibold text-violet-700">2.</span> <span className="font-semibold">Your website → Zboun:</span> your site calls the inbound API whenever stock changes there.</li>
          <li><span className="font-semibold text-violet-700">3.</span> <span className="font-semibold">Zboun → your website:</span> Zboun pushes to your webhook URL whenever stock changes here (manual edit or a WhatsApp order).</li>
        </ol>
      </section>

      {/* Connection settings */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">Connection settings</h2>
        <form action={saveSettingsAction} className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Your platform
            </label>
            <select
              name="platform"
              value={platform}
              onChange={(e) => {
                const next = e.target.value as StockSyncPlatform;
                setPlatform(next);
                setDocsTab(next);
              }}
              className="ui-input w-full sm:w-64"
            >
              {(Object.keys(PLATFORM_LABELS) as StockSyncPlatform[]).map((key) => (
                <option key={key} value={key}>{PLATFORM_LABELS[key]}</option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="outbound_webhook_url"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500"
            >
              Your website's webhook URL (Zboun → your website)
            </label>
            <input
              id="outbound_webhook_url"
              name="outbound_webhook_url"
              type="url"
              placeholder="https://your-store.com/webhooks/zboun-stock"
              defaultValue={settings?.outbound_webhook_url ?? ""}
              className="ui-input w-full"
            />
            <p className="mt-1 text-xs text-slate-400">
              Leave blank if you only want your website to push into Zboun (one-way).
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">Enable stock sync</p>
              <p className="text-xs text-slate-500">Turn off anytime to pause both directions.</p>
            </div>
            <input type="hidden" name="is_enabled" value={isEnabled ? "true" : "false"} />
            <button
              type="button"
              onClick={() => setIsEnabled((v) => !v)}
              aria-pressed={isEnabled}
              className={`relative inline-flex h-7 w-12 shrink-0 items-center overflow-hidden rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 ${
                isEnabled ? "bg-violet-600 justify-end" : "bg-slate-300 justify-start"
              }`}
            >
              <span className="sr-only">{isEnabled ? "Disable" : "Enable"} stock sync</span>
              <span className="pointer-events-none h-6 w-6 shrink-0 rounded-full bg-white shadow" />
            </button>
          </div>

          <button
            type="submit"
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
          >
            Save connection settings
          </button>

          {settings ? (
            <p className="text-xs text-slate-400">
              Last received from your website: {settings.last_inbound_at ? new Date(settings.last_inbound_at).toLocaleString() : "never"}
              {" · "}
              Last sent to your website: {settings.last_outbound_at ? new Date(settings.last_outbound_at).toLocaleString() : "never"}
            </p>
          ) : null}
        </form>
      </section>

      {/* Inbound credentials */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">Inbound: your website → Zboun</h2>
        <p className="mt-1 text-xs text-slate-500">
          Give your developer this endpoint and API key so your website can push stock updates into Zboun.
        </p>
        <div className="mt-4 space-y-3">
          <CopyField label="Endpoint URL" value={inboundEndpoint} />
          <CopyField label="API key" value={apiKey} secret />
        </div>
        <form action={regenerateApiKeyAction} className="mt-3">
          <button
            type="submit"
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            Regenerate API key
          </button>
        </form>
      </section>

      {/* Outbound secret */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">Outbound: Zboun → your website</h2>
        <p className="mt-1 text-xs text-slate-500">
          Zboun signs each push with this secret in the <code className="font-mono">X-Zboun-Signature</code> header
          (HMAC-SHA256 of the raw JSON body) so your website can verify it's really from Zboun.
        </p>
        <div className="mt-4">
          <CopyField label="Webhook secret" value={outboundSecret} secret />
        </div>
        <form action={regenerateSecretAction} className="mt-3">
          <button
            type="submit"
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            Regenerate secret
          </button>
        </form>
      </section>

      {/* Integration docs */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">Integration snippet</h2>
        <div className="mt-3 flex gap-1.5">
          {(Object.keys(PLATFORM_LABELS) as StockSyncPlatform[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setDocsTab(key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                docsTab === key ? "bg-violet-600 text-white" : "border border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              {PLATFORM_LABELS[key]}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs font-semibold text-slate-600">{docsSnippets[docsTab].title}</p>
        <pre className="mt-1.5 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
          <code>{docsSnippets[docsTab].body}</code>
        </pre>
      </section>

      {/* SKU mapping */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">Map item SKUs</h2>
        <p className="mt-1 text-xs text-slate-500">
          Enter the same SKU your website uses for each product. Only mapped items sync.
        </p>
        {items.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No menu items yet.</p>
        ) : (
          <table className="mt-4 w-full">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                <th className="pb-2 pr-3">Item</th>
                <th className="pb-2">SKU</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <SkuRow key={item.id} item={item} updateSkuAction={updateSkuAction} />
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Recent activity */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">Recent sync activity</h2>
        {events.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No sync events yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                  <th className="pb-2 pr-3">When</th>
                  <th className="pb-2 pr-3">Direction</th>
                  <th className="pb-2 pr-3">SKU</th>
                  <th className="pb-2 pr-3">Qty</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-3 text-xs text-slate-500">{new Date(event.created_at).toLocaleString()}</td>
                    <td className="py-2 pr-3 text-xs font-medium text-slate-700">
                      {event.direction === "inbound" ? "Website → Zboun" : "Zboun → Website"}
                    </td>
                    <td className="py-2 pr-3 text-xs font-mono text-slate-600">{event.sku ?? "—"}</td>
                    <td className="py-2 pr-3 text-xs tabular-nums text-slate-600">{event.quantity ?? "—"}</td>
                    <td className="py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          event.status === "success"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-600"
                        }`}
                        title={event.error_message ?? undefined}
                      >
                        {event.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
