"use client";

import { useState } from "react";
import { Plus, Trash2, DollarSign, MapPin, Edit2, Check, X } from "lucide-react";

type DeliveryTier = {
  id: string;
  min_distance_km: number;
  max_distance_km: number;
  fee_usd: number;
  position: number;
};

type DeliveryType = "regular" | "fast";

type Props = {
  restaurantId: string;
  initialTiers?: DeliveryTier[];
  deliveryType?: DeliveryType;
  maxDeliveryRadius?: number;
};

export function DeliveryTiersPanel({ restaurantId, initialTiers = [], deliveryType = "regular", maxDeliveryRadius = 100 }: Props) {
  const [tiers, setTiers] = useState<DeliveryTier[]>(initialTiers);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newTier, setNewTier] = useState({
    min_distance_km: 0,
    max_distance_km: 5,
    fee_usd: 2,
  });
  const [editTier, setEditTier] = useState({
    min_distance_km: 0,
    max_distance_km: 5,
    fee_usd: 2,
  });

  // Check if a range overlaps with existing tiers (excluding the one being edited)
  const hasOverlap = (min: number, max: number, excludeId?: string) => {
    return tiers.some(tier => {
      if (excludeId && tier.id === excludeId) return false;
      
      // Check if ranges overlap
      // Overlap occurs if: new_min < existing_max AND new_max > existing_min
      return min < tier.max_distance_km && max > tier.min_distance_km;
    });
  };

  const addTier = () => {
    setError(null);
    
    // Validation
    if (newTier.max_distance_km <= newTier.min_distance_km) {
      setError("Maximum distance must be greater than minimum distance");
      return;
    }

    if (hasOverlap(newTier.min_distance_km, newTier.max_distance_km)) {
      setError(`Range ${newTier.min_distance_km}–${newTier.max_distance_km} km overlaps with an existing tier`);
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const newTierItem: DeliveryTier = {
      id: tempId,
      ...newTier,
      position: tiers.length,
    };
    setTiers([...tiers, newTierItem]);
    setNewTier({ min_distance_km: newTier.max_distance_km, max_distance_km: newTier.max_distance_km + 5, fee_usd: newTier.fee_usd + 1 });
    setIsAdding(false);
  };

  const startEdit = (tier: DeliveryTier) => {
    setEditingId(tier.id);
    setEditTier({
      min_distance_km: tier.min_distance_km,
      max_distance_km: tier.max_distance_km,
      fee_usd: tier.fee_usd,
    });
    setError(null);
  };

  const saveEdit = (id: string) => {
    setError(null);

    // Validation
    if (editTier.max_distance_km <= editTier.min_distance_km) {
      setError("Maximum distance must be greater than minimum distance");
      return;
    }

    if (hasOverlap(editTier.min_distance_km, editTier.max_distance_km, id)) {
      setError(`Range ${editTier.min_distance_km}–${editTier.max_distance_km} km overlaps with another tier`);
      return;
    }

    setTiers(tiers.map(t => t.id === id ? { ...t, ...editTier } : t));
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setError(null);
  };

  const removeTier = (id: string) => {
    setTiers(tiers.filter(t => t.id !== id));
    setError(null);
  };

  // Check if tiers cover the full delivery range
  const checkCoverage = () => {
    if (tiers.length === 0) return null;

    const sortedTiers = [...tiers].sort((a, b) => a.min_distance_km - b.min_distance_km);
    const issues: string[] = [];

    // Check if starts at 0
    if (sortedTiers[0].min_distance_km > 0.1) {
      issues.push(`Missing coverage from 0 to ${sortedTiers[0].min_distance_km} km`);
    }

    // Check for gaps between tiers
    for (let i = 0; i < sortedTiers.length - 1; i++) {
      const currentMax = sortedTiers[i].max_distance_km;
      const nextMin = sortedTiers[i + 1].min_distance_km;
      if (nextMin - currentMax > 0.1) {
        issues.push(`Gap from ${currentMax} to ${nextMin} km`);
      }
    }

    // Check if reaches max delivery radius
    const lastTier = sortedTiers[sortedTiers.length - 1];
    if (lastTier.max_distance_km < maxDeliveryRadius - 0.1) {
      issues.push(`Missing coverage from ${lastTier.max_distance_km} to ${maxDeliveryRadius} km (your max delivery distance)`);
    }

    return issues.length > 0 ? issues : null;
  };

  const coverageIssues = checkCoverage();
  const hasTiers = tiers.length > 0;
  const isFast = deliveryType === "fast";
  const prefix = isFast ? "fast_tier" : "tier";
  const title = isFast ? "Fast delivery distance tiers" : "Regular delivery distance tiers";
  const description = isFast
    ? "Set fast delivery fees based on distance (optional)"
    : "Set regular delivery fees based on distance (optional)";

  return (
    <div className="p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="panel-title">{title}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsAdding(true);
            setError(null);
          }}
          disabled={editingId !== null}
          className="flex items-center gap-1.5 rounded-xl border border-violet-200 bg-white px-3 py-2 text-xs font-semibold text-violet-700 shadow-sm transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
          title={editingId ? "Finish editing current tier first" : "Add tier"}
        >
          <Plus className="h-3.5 w-3.5" />
          Add tier
        </button>
      </div>

      {/* Explanation banner */}
      <div className="mb-3 rounded-lg border border-indigo-100 bg-indigo-50/50 px-3 py-2">
        <p className="text-xs font-semibold text-indigo-900">📍 Distance-based pricing</p>
        <p className="mt-1 text-xs leading-relaxed text-indigo-700">
          <strong>With tiers:</strong> Customers pay based on their distance from your store.
          <br />
          <strong>Without tiers (or gaps):</strong> The flat fee above is used as default/fallback.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <p className="text-xs font-semibold text-red-900">⚠️ Validation error</p>
          <p className="mt-0.5 text-xs text-red-700">{error}</p>
        </div>
      )}

      {/* Hidden inputs for form submission */}
      {tiers.map((tier, idx) => (
        <div key={tier.id}>
          <input type="hidden" name={`${prefix}_${idx}_id`} value={tier.id.startsWith('temp-') ? '' : tier.id} />
          <input type="hidden" name={`${prefix}_${idx}_min_km`} value={tier.min_distance_km} />
          <input type="hidden" name={`${prefix}_${idx}_max_km`} value={tier.max_distance_km} />
          <input type="hidden" name={`${prefix}_${idx}_fee`} value={tier.fee_usd} />
        </div>
      ))}
      <input type="hidden" name={`${prefix}s_count`} value={tiers.length} />

      {!hasTiers && !isAdding ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center">
          <MapPin className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm font-semibold text-slate-600">No distance tiers configured</p>
          <p className="mt-1 text-xs text-slate-400">
            All customers currently pay the flat delivery fee shown above.
            <br />
            Add tiers to charge different fees based on distance from your store.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tiers.map((tier) => (
            <div key={tier.id}>
              {editingId === tier.id ? (
                <div className="rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/30 p-3">
                  <p className="mb-2 text-xs font-semibold text-slate-700">Edit distance tier</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        From (km)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min={0}
                        value={editTier.min_distance_km}
                        onChange={(e) => setEditTier({ ...editTier, min_distance_km: Number(e.target.value) })}
                        className="ui-input w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        To (km)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min={editTier.min_distance_km + 0.5}
                        value={editTier.max_distance_km}
                        onChange={(e) => setEditTier({ ...editTier, max_distance_km: Number(e.target.value) })}
                        className="ui-input w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Fee ($)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min={0}
                        value={editTier.fee_usd}
                        onChange={(e) => setEditTier({ ...editTier, fee_usd: Number(e.target.value) })}
                        className="ui-input w-full text-sm"
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => saveEdit(tier.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                    >
                      <Check className="h-3 w-3" />
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      <X className="h-3 w-3" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
                  <div className="flex flex-1 items-center gap-3 text-sm">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <MapPin className="h-3.5 w-3.5 text-violet-500" aria-hidden />
                      <span className="font-semibold">{tier.min_distance_km} km</span>
                      <span className="text-slate-400">→</span>
                      <span className="font-semibold">{tier.max_distance_km} km</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-700">
                      <DollarSign className="h-3.5 w-3.5" aria-hidden />
                      <span className="font-bold">{tier.fee_usd.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(tier)}
                      className="rounded-lg border border-blue-200 bg-blue-50 p-1.5 text-blue-600 transition hover:bg-blue-100"
                      title="Edit tier"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeTier(tier.id)}
                      className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 transition hover:bg-red-100"
                      title="Remove tier"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isAdding && (
            <div className="rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/30 p-3">
              <p className="mb-2 text-xs font-semibold text-slate-700">New distance tier</p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    From (km)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min={0}
                    value={newTier.min_distance_km}
                    onChange={(e) => setNewTier({ ...newTier, min_distance_km: Number(e.target.value) })}
                    className="ui-input w-full text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    To (km)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min={newTier.min_distance_km + 0.5}
                    value={newTier.max_distance_km}
                    onChange={(e) => setNewTier({ ...newTier, max_distance_km: Number(e.target.value) })}
                    className="ui-input w-full text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Fee ($)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min={0}
                    value={newTier.fee_usd}
                    onChange={(e) => setNewTier({ ...newTier, fee_usd: Number(e.target.value) })}
                    className="ui-input w-full text-sm"
                  />
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={addTier}
                  disabled={newTier.max_distance_km <= newTier.min_distance_km}
                  className="flex-1 rounded-lg bg-violet-600 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {coverageIssues && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <p className="text-xs font-semibold text-amber-900">⚠️ Coverage gaps detected</p>
          <ul className="mt-1 space-y-0.5 text-xs text-amber-700">
            {coverageIssues.map((issue, idx) => (
              <li key={idx}>• {issue}</li>
            ))}
          </ul>
          <p className="mt-1.5 text-xs text-amber-700">
            Customers in uncovered ranges will pay the flat delivery fee above.
          </p>
        </div>
      )}

      {hasTiers && !coverageIssues && (
        <div className="mt-3 rounded-lg border border-green-100 bg-green-50/50 px-3 py-2">
          <p className="text-xs font-medium text-green-900">✓ Full coverage</p>
          <p className="mt-0.5 text-xs text-green-700">
            Your tiers cover the full delivery range (0–{maxDeliveryRadius} km). All customers will be charged based on distance.
          </p>
        </div>
      )}

      {hasTiers && (
        <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/50 px-3 py-2">
          <p className="text-xs font-medium text-blue-900">💡 How customers are charged</p>
          <p className="mt-0.5 text-xs leading-relaxed text-blue-700">
            <strong>Step 1:</strong> We calculate the customer's distance from your store
            <br />
            <strong>Step 2:</strong> We find the matching tier for that distance
            <br />
            <strong>Step 3:</strong> If a tier matches → use tier price. If no match → use flat fee as fallback.
          </p>
        </div>
      )}
    </div>
  );
}
