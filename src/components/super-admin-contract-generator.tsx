"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

export type ContractRestaurantPreset = {
  id: string;
  name: string;
  adminEmail: string;
  effectiveDate: string | null;
  subscriptionEndDate: string | null;
};

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function defaultEffectiveDate() {
  return new Date().toISOString().slice(0, 10);
}

function defaultEndDate() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

type Props = {
  restaurants: ContractRestaurantPreset[];
};

export function SuperAdminContractGenerator({ restaurants }: Props) {
  const [selectedId, setSelectedId] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(defaultEffectiveDate);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState(defaultEndDate);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedRestaurants = useMemo(
    () => [...restaurants].sort((a, b) => a.name.localeCompare(b.name)),
    [restaurants],
  );

  function applyPreset(id: string) {
    setSelectedId(id);
    if (!id) return;
    const preset = sortedRestaurants.find((r) => r.id === id);
    if (!preset) return;
    setRestaurantName(preset.name);
    setAdminEmail(preset.adminEmail);
    setEffectiveDate(toDateInputValue(preset.effectiveDate) || defaultEffectiveDate());
    setSubscriptionEndDate(
      toDateInputValue(preset.subscriptionEndDate) || defaultEndDate(),
    );
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/super-admin/contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantName: restaurantName.trim(),
          adminEmail: adminEmail.trim(),
          effectiveDate,
          subscriptionEndDate,
        }),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Could not generate contract");
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? "zboun-service-agreement.pdf";

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate contract");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleGenerate} className="mt-4 space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block space-y-1 md:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Prefill from business (optional)
          </span>
          <select
            value={selectedId}
            onChange={(e) => applyPreset(e.target.value)}
            className="ui-select"
          >
            <option value="">— Enter details manually —</option>
            {sortedRestaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Restaurant legal name
          </span>
          <input
            type="text"
            required
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            placeholder="e.g. Al Baaklini Restaurant"
            className="ui-input"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Administrator email
          </span>
          <input
            type="email"
            required
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="admin@restaurant.com"
            className="ui-input"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Effective date
          </span>
          <input
            type="date"
            required
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            className="ui-input"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Subscription period ends
          </span>
          <input
            type="date"
            required
            value={subscriptionEndDate}
            onChange={(e) => setSubscriptionEndDate(e.target.value)}
            className="ui-input"
          />
        </label>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-success w-full rounded-xl disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Generating…
          </>
        ) : (
          "Generate contract"
        )}
      </button>
    </form>
  );
}
