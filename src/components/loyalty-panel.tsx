"use client";

import { useState, useTransition, useMemo } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type LoyaltyProgram = {
  id: string;
  points_enabled: boolean;
  points_per_dollar: number;
  points_redeem_per_dollar: number;
  stamps_enabled: boolean;
  stamps_required: number;
  stamp_reward_desc: string | null;
  referral_enabled: boolean;
  referral_bonus_points: number;
  tiers_enabled: boolean;
  tier_silver_threshold: number;
  tier_gold_threshold: number;
  tier_platinum_threshold: number;
  is_active: boolean;
} | null;

type Member = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  points_balance: number;
  stamps_balance: number;
  lifetime_points: number;
  total_stamps_ever: number;
  tier: string;
  is_active: boolean;
  enrolled_at: string;
  last_activity_at: string | null;
  crm_customer_id: string | null;
};

type Transaction = {
  id: string;
  member_id: string;
  type: string;
  points_delta: number;
  stamps_delta: number;
  description: string | null;
  created_at: string;
  pos_order_id: string | null;
};

type CrmCustomer = {
  id: string;
  full_name: string;
  phone: string | null;
};

type Props = {
  restaurantName: string;
  program: LoyaltyProgram;
  members: Member[];
  transactions: Transaction[];
  crmCustomers: CrmCustomer[];
  upsertLoyaltyProgramAction: (fd: FormData) => Promise<void>;
  enrollMemberAction: (fd: FormData) => Promise<void>;
  updateMemberAction: (fd: FormData) => Promise<void>;
  earnPointsAction: (fd: FormData) => Promise<void>;
  redeemPointsAction: (fd: FormData) => Promise<void>;
  earnStampAction: (fd: FormData) => Promise<void>;
  adjustMemberAction: (fd: FormData) => Promise<void>;
  applyReferralBonusAction: (fd: FormData) => Promise<void>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtDateTime(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const TIER_STYLES: Record<string, string> = {
  standard: "bg-slate-100 text-slate-600",
  silver:   "bg-slate-200 text-slate-700",
  gold:     "bg-amber-100 text-amber-700",
  platinum: "bg-violet-100 text-violet-700",
};

const TX_STYLES: Record<string, { label: string; color: string }> = {
  earn_points:    { label: "Earned",       color: "text-teal-600" },
  redeem_points:  { label: "Redeemed",     color: "text-rose-600" },
  earn_stamp:     { label: "Stamp",        color: "text-blue-600" },
  stamp_reward:   { label: "Reward",       color: "text-amber-600" },
  referral_bonus: { label: "Referral",     color: "text-violet-600" },
  adjustment:     { label: "Adjustment",   color: "text-slate-500" },
  tier_upgrade:   { label: "Tier Up",      color: "text-violet-700" },
  expiry:         { label: "Expired",      color: "text-red-500" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function LoyaltyPanel({
  restaurantName,
  program,
  members,
  transactions,
  crmCustomers,
  upsertLoyaltyProgramAction,
  enrollMemberAction,
  updateMemberAction,
  earnPointsAction,
  redeemPointsAction,
  earnStampAction,
  adjustMemberAction,
  applyReferralBonusAction,
}: Props) {
  const [tab, setTab] = useState<"overview" | "members" | "transactions" | "program">("overview");
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [memberFilter, setMemberFilter] = useState<"all" | "active" | "inactive">("active");

  // Action modals
  const [actionMemberId, setActionMemberId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"earn_points" | "redeem_points" | "earn_stamp" | "adjust" | "referral" | "edit" | null>(null);

  // Enroll modal
  const [showEnroll, setShowEnroll] = useState(false);

  // Form values for action modal
  const [actionValue, setActionValue] = useState("");
  const [actionDesc, setActionDesc] = useState("");

  // Program form toggle values
  const [pointsEnabled, setPointsEnabled] = useState(program?.points_enabled ?? true);
  const [stampsEnabled, setStampsEnabled] = useState(program?.stamps_enabled ?? false);
  const [referralEnabled, setReferralEnabled] = useState(program?.referral_enabled ?? false);
  const [tiersEnabled, setTiersEnabled] = useState(program?.tiers_enabled ?? false);

  // ── Derived ───────────────────────────────────────────────────────────────
  const activeMembers = members.filter((m) => m.is_active);
  const totalPoints = activeMembers.reduce((s, m) => s + m.points_balance, 0);
  const tierCount = useMemo(() => {
    const c = { silver: 0, gold: 0, platinum: 0 };
    for (const m of activeMembers) {
      if (m.tier !== "standard") c[m.tier as keyof typeof c] = (c[m.tier as keyof typeof c] ?? 0) + 1;
    }
    return c;
  }, [activeMembers]);
  const cutoff30 = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const activeThisMonth = activeMembers.filter(
    (m) => m.last_activity_at && new Date(m.last_activity_at).getTime() > cutoff30,
  ).length;

  const memberMap = useMemo(() => Object.fromEntries(members.map((m) => [m.id, m])), [members]);

  const filteredMembers = useMemo(() => {
    let list = members;
    if (memberFilter === "active") list = list.filter((m) => m.is_active);
    if (memberFilter === "inactive") list = list.filter((m) => !m.is_active);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.full_name.toLowerCase().includes(q) ||
          (m.phone ?? "").includes(q) ||
          (m.email ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [members, memberFilter, search]);

  const actionMember = actionMemberId ? memberMap[actionMemberId] ?? null : null;

  // ── Helpers ───────────────────────────────────────────────────────────────
  function run(action: (fd: FormData) => Promise<void>, fd: FormData) {
    startTransition(async () => { await action(fd); });
  }

  function openAction(memberId: string, type: typeof actionType) {
    setActionMemberId(memberId);
    setActionType(type);
    setActionValue("");
    setActionDesc("");
  }

  function closeAction() {
    setActionMemberId(null);
    setActionType(null);
    setActionValue("");
    setActionDesc("");
  }

  function submitAction() {
    if (!actionMemberId || !actionType) return;
    const fd = new FormData();
    fd.set("member_id", actionMemberId);

    if (actionType === "earn_points") {
      fd.set("order_total", actionValue);
      run(earnPointsAction, fd);
    } else if (actionType === "redeem_points") {
      fd.set("points", actionValue);
      run(redeemPointsAction, fd);
    } else if (actionType === "earn_stamp") {
      run(earnStampAction, fd);
    } else if (actionType === "adjust") {
      fd.set("points_delta", actionValue);
      fd.set("stamps_delta", "0");
      fd.set("description", actionDesc || "Manual adjustment");
      run(adjustMemberAction, fd);
    } else if (actionType === "referral") {
      fd.set("referrer_id", actionMemberId);
      run(applyReferralBonusAction, fd);
    }
    closeAction();
  }

  function stampProgress(member: Member) {
    const required = program?.stamps_required ?? 10;
    const pct = Math.min(100, (member.stamps_balance / required) * 100);
    return { pct, current: member.stamps_balance, required };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <main className="container max-w-7xl space-y-6 py-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600">Loyalty</p>
            <h1 className="text-2xl font-bold text-slate-900">{restaurantName} — Loyalty Programme</h1>
            <p className="text-sm text-slate-500">Points, stamps, tiers, and referral rewards in one place.</p>
          </div>
          <a href="/dashboard/restaurant" className="btn btn-secondary rounded-xl text-sm">
            ← Dashboard
          </a>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
          {(["overview", "members", "transactions", "program"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold capitalize transition ${
                tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Overview ──────────────────────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard label="Total Members" value={activeMembers.length.toString()} color="violet" />
              <KpiCard label="Points in Circulation" value={totalPoints.toLocaleString()} color="amber" />
              <KpiCard label="Active This Month" value={activeThisMonth.toString()} color="teal" />
              <KpiCard
                label="Tier Breakdown"
                value={`${tierCount.gold + tierCount.platinum + tierCount.silver} non-standard`}
                sub={`${tierCount.platinum} Platinum · ${tierCount.gold} Gold · ${tierCount.silver} Silver`}
                color="indigo"
              />
            </div>

            {/* Top members */}
            <div className="panel p-5">
              <p className="mb-3 text-sm font-bold text-slate-700">Top Members by Lifetime Points</p>
              {activeMembers.length === 0 ? (
                <p className="text-sm text-slate-400">No members yet. Enroll your first customer in the Members tab.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        <th className="pb-2 pr-4">#</th>
                        <th className="pb-2 pr-4">Member</th>
                        <th className="pb-2 pr-4">Tier</th>
                        <th className="pb-2 pr-4">Balance</th>
                        <th className="pb-2 pr-4">Lifetime Pts</th>
                        <th className="pb-2 pr-4">Last Activity</th>
                        <th className="pb-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[...activeMembers]
                        .sort((a, b) => b.lifetime_points - a.lifetime_points)
                        .slice(0, 10)
                        .map((m, i) => (
                          <tr key={m.id} className="hover:bg-slate-50">
                            <td className="py-2 pr-4 text-slate-400">#{i + 1}</td>
                            <td className="py-2 pr-4">
                              <p className="font-semibold text-slate-800">{m.full_name}</p>
                              <p className="text-xs text-slate-400">{m.phone ?? m.email ?? "—"}</p>
                            </td>
                            <td className="py-2 pr-4">
                              <TierBadge tier={m.tier} />
                            </td>
                            <td className="py-2 pr-4 font-semibold text-violet-700">
                              {m.points_balance.toLocaleString()} pts
                            </td>
                            <td className="py-2 pr-4 text-slate-500">{m.lifetime_points.toLocaleString()}</td>
                            <td className="py-2 pr-4 text-slate-400">{fmtDate(m.last_activity_at)}</td>
                            <td className="py-2">
                              <button
                                onClick={() => { setTab("members"); setSearch(m.full_name); }}
                                className="text-xs font-semibold text-violet-600 hover:underline"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Program summary */}
            {!program && (
              <div className="panel border-amber-200 bg-amber-50 p-5">
                <p className="font-semibold text-amber-800">Programme not configured yet</p>
                <p className="mt-1 text-sm text-amber-700">
                  Go to the <button onClick={() => setTab("program")} className="font-bold underline">Programme</button> tab to configure points, stamps, tiers, and referrals.
                </p>
              </div>
            )}
            {program && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <ProgramCard
                  active={program.points_enabled}
                  label="Points Programme"
                  detail={`${program.points_per_dollar} pt / $1 · Redeem at ${program.points_redeem_per_dollar} pts/$1`}
                />
                <ProgramCard
                  active={program.stamps_enabled}
                  label="Stamp Card"
                  detail={`${program.stamps_required} stamps → ${program.stamp_reward_desc ?? "Reward"}`}
                />
                <ProgramCard
                  active={program.referral_enabled}
                  label="Referral Bonus"
                  detail={`+${program.referral_bonus_points} pts per referral`}
                />
                <ProgramCard
                  active={program.tiers_enabled}
                  label="Member Tiers"
                  detail={`Silver ${program.tier_silver_threshold} · Gold ${program.tier_gold_threshold} · Platinum ${program.tier_platinum_threshold}`}
                />
              </div>
            )}
          </div>
        )}

        {/* ── Members ───────────────────────────────────────────────────────── */}
        {tab === "members" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 gap-2">
                <input
                  type="search"
                  placeholder="Search by name, phone, or email…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="ui-input flex-1"
                />
                <select
                  value={memberFilter}
                  onChange={(e) => setMemberFilter(e.target.value as typeof memberFilter)}
                  className="ui-input w-36"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <button
                onClick={() => setShowEnroll(true)}
                className="btn btn-primary rounded-xl text-sm"
              >
                + Enroll Member
              </button>
            </div>

            <div className="panel overflow-hidden p-0">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3">Member</th>
                    <th className="px-4 py-3">Tier</th>
                    <th className="px-4 py-3">Points</th>
                    {program?.stamps_enabled && <th className="px-4 py-3">Stamps</th>}
                    <th className="px-4 py-3">Lifetime</th>
                    <th className="px-4 py-3">Last Activity</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">
                        {search || memberFilter !== "all" ? "No members match your search." : "No members yet."}
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((m) => {
                      const sp = stampProgress(m);
                      return (
                        <tr key={m.id} className={`hover:bg-slate-50 ${!m.is_active ? "opacity-50" : ""}`}>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-800">{m.full_name}</p>
                            <p className="text-xs text-slate-400">{m.phone ?? m.email ?? "—"}</p>
                          </td>
                          <td className="px-4 py-3">
                            <TierBadge tier={m.tier} />
                          </td>
                          <td className="px-4 py-3 font-semibold text-violet-700">
                            {m.points_balance.toLocaleString()}
                          </td>
                          {program?.stamps_enabled && (
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
                                  <div
                                    className="h-full rounded-full bg-violet-500 transition-all"
                                    style={{ width: `${sp.pct}%` }}
                                  />
                                </div>
                                <span className="text-xs text-slate-500">
                                  {sp.current}/{sp.required}
                                </span>
                              </div>
                            </td>
                          )}
                          <td className="px-4 py-3 text-slate-500">{m.lifetime_points.toLocaleString()}</td>
                          <td className="px-4 py-3 text-slate-400">{fmtDate(m.last_activity_at)}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {program?.points_enabled && (
                                <ActionBtn color="violet" onClick={() => openAction(m.id, "earn_points")}>
                                  + Points
                                </ActionBtn>
                              )}
                              {program?.points_enabled && m.points_balance > 0 && (
                                <ActionBtn color="rose" onClick={() => openAction(m.id, "redeem_points")}>
                                  Redeem
                                </ActionBtn>
                              )}
                              {program?.stamps_enabled && (
                                <ActionBtn color="blue" onClick={() => openAction(m.id, "earn_stamp")}>
                                  Stamp
                                </ActionBtn>
                              )}
                              {program?.referral_enabled && (
                                <ActionBtn color="amber" onClick={() => openAction(m.id, "referral")}>
                                  Referral
                                </ActionBtn>
                              )}
                              <ActionBtn color="slate" onClick={() => openAction(m.id, "adjust")}>
                                Adjust
                              </ActionBtn>
                              <ActionBtn color="slate" onClick={() => openAction(m.id, "edit")}>
                                Edit
                              </ActionBtn>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Transactions ──────────────────────────────────────────────────── */}
        {tab === "transactions" && (
          <div className="panel overflow-hidden p-0">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-bold text-slate-700">Recent Transactions</p>
              <p className="text-xs text-slate-400">Latest 200 loyalty events across all members.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Member</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Points</th>
                    <th className="px-4 py-3">Stamps</th>
                    <th className="px-4 py-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                        No transactions yet.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => {
                      const txStyle = TX_STYLES[tx.type] ?? { label: tx.type, color: "text-slate-500" };
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50">
                          <td className="px-4 py-2.5 text-xs text-slate-400">{fmtDateTime(tx.created_at)}</td>
                          <td className="px-4 py-2.5 font-medium text-slate-700">
                            {memberMap[tx.member_id]?.full_name ?? "—"}
                          </td>
                          <td className={`px-4 py-2.5 text-xs font-semibold ${txStyle.color}`}>
                            {txStyle.label}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-sm">
                            {tx.points_delta !== 0 ? (
                              <span className={tx.points_delta > 0 ? "text-teal-600" : "text-rose-600"}>
                                {tx.points_delta > 0 ? "+" : ""}{tx.points_delta}
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-sm">
                            {tx.stamps_delta !== 0 ? (
                              <span className={tx.stamps_delta > 0 ? "text-blue-600" : "text-rose-600"}>
                                {tx.stamps_delta > 0 ? "+" : ""}{tx.stamps_delta}
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-slate-500">{tx.description ?? "—"}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Programme Config ──────────────────────────────────────────────── */}
        {tab === "program" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              fd.set("points_enabled", String(pointsEnabled));
              fd.set("stamps_enabled", String(stampsEnabled));
              fd.set("referral_enabled", String(referralEnabled));
              fd.set("tiers_enabled", String(tiersEnabled));
              run(upsertLoyaltyProgramAction, fd);
            }}
            className="space-y-6"
          >
            {/* Points */}
            <div className="panel p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Points Programme</p>
                  <p className="text-xs text-slate-500">Customers earn points on every purchase and redeem for discounts.</p>
                </div>
                <Toggle enabled={pointsEnabled} onChange={setPointsEnabled} />
              </div>
              {pointsEnabled && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="ui-label">Points earned per $1 spent</label>
                    <input
                      name="points_per_dollar"
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="ui-input w-full"
                      defaultValue={program?.points_per_dollar ?? 1}
                    />
                    <p className="mt-1 text-xs text-slate-400">e.g. 1 = earn 1 point per dollar</p>
                  </div>
                  <div>
                    <label className="ui-label">Points needed to get $1 discount</label>
                    <input
                      name="points_redeem_per_dollar"
                      type="number"
                      step="1"
                      min="1"
                      className="ui-input w-full"
                      defaultValue={program?.points_redeem_per_dollar ?? 100}
                    />
                    <p className="mt-1 text-xs text-slate-400">e.g. 100 = 100 points = $1 off</p>
                  </div>
                </div>
              )}
            </div>

            {/* Stamps */}
            <div className="panel p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Stamp Card</p>
                  <p className="text-xs text-slate-500">Customers collect stamps on each visit, earn a reward on completion.</p>
                </div>
                <Toggle enabled={stampsEnabled} onChange={setStampsEnabled} />
              </div>
              {stampsEnabled && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="ui-label">Stamps required per card</label>
                    <input
                      name="stamps_required"
                      type="number"
                      min="2"
                      max="50"
                      className="ui-input w-full"
                      defaultValue={program?.stamps_required ?? 10}
                    />
                  </div>
                  <div>
                    <label className="ui-label">Reward description</label>
                    <input
                      name="stamp_reward_desc"
                      type="text"
                      className="ui-input w-full"
                      defaultValue={program?.stamp_reward_desc ?? ""}
                      placeholder="e.g. Free coffee on your 10th visit"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Referral */}
            <div className="panel p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Referral Bonus</p>
                  <p className="text-xs text-slate-500">Award points to members who refer new customers.</p>
                </div>
                <Toggle enabled={referralEnabled} onChange={setReferralEnabled} />
              </div>
              {referralEnabled && (
                <div>
                  <label className="ui-label">Bonus points per successful referral</label>
                  <input
                    name="referral_bonus_points"
                    type="number"
                    min="1"
                    className="ui-input w-full sm:w-48"
                    defaultValue={program?.referral_bonus_points ?? 50}
                  />
                </div>
              )}
            </div>

            {/* Tiers */}
            <div className="panel p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Member Tiers</p>
                  <p className="text-xs text-slate-500">
                    Automatically upgrade members based on their lifetime points: Standard → Silver → Gold → Platinum.
                  </p>
                </div>
                <Toggle enabled={tiersEnabled} onChange={setTiersEnabled} />
              </div>
              {tiersEnabled && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="ui-label">
                      <span className="text-slate-500">⬤</span> Silver threshold (pts)
                    </label>
                    <input
                      name="tier_silver_threshold"
                      type="number"
                      min="1"
                      className="ui-input w-full"
                      defaultValue={program?.tier_silver_threshold ?? 500}
                    />
                  </div>
                  <div>
                    <label className="ui-label">
                      <span className="text-amber-500">⬤</span> Gold threshold (pts)
                    </label>
                    <input
                      name="tier_gold_threshold"
                      type="number"
                      min="1"
                      className="ui-input w-full"
                      defaultValue={program?.tier_gold_threshold ?? 1500}
                    />
                  </div>
                  <div>
                    <label className="ui-label">
                      <span className="text-violet-500">⬤</span> Platinum threshold (pts)
                    </label>
                    <input
                      name="tier_platinum_threshold"
                      type="number"
                      min="1"
                      className="ui-input w-full"
                      defaultValue={program?.tier_platinum_threshold ?? 5000}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={isPending} className="btn btn-primary rounded-xl disabled:opacity-60">
                {isPending ? "Saving…" : "Save Programme Settings"}
              </button>
            </div>
          </form>
        )}
      </main>

      {/* ── Enroll Modal ──────────────────────────────────────────────────────── */}
      {showEnroll && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Enroll New Member</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                run(enrollMemberAction, fd);
                setShowEnroll(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="ui-label">Full Name *</label>
                <input name="full_name" className="ui-input w-full" required placeholder="Jane Doe" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="ui-label">Phone *</label>
                  <input name="phone" className="ui-input w-full" type="tel" placeholder="+961…" />
                </div>
                <div>
                  <label className="ui-label">Email</label>
                  <input name="email" className="ui-input w-full" type="email" placeholder="jane@…" />
                </div>
              </div>
              {crmCustomers.length > 0 && (
                <div>
                  <label className="ui-label">Link to CRM Profile (optional)</label>
                  <select name="crm_customer_id" className="ui-input w-full">
                    <option value="">— No link —</option>
                    {crmCustomers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.full_name}{c.phone ? ` · ${c.phone}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <p className="text-xs text-slate-400">At least one of phone or email is required.</p>
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button type="button" onClick={() => setShowEnroll(false)} className="btn btn-secondary rounded-xl text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={isPending} className="btn btn-primary rounded-xl text-sm disabled:opacity-60">
                  {isPending ? "Enrolling…" : "Enroll"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Action Modal ──────────────────────────────────────────────────────── */}
      {actionMember && actionType && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              {actionType === "earn_points" && "Award Points"}
              {actionType === "redeem_points" && "Redeem Points"}
              {actionType === "earn_stamp" && "Add Stamp"}
              {actionType === "adjust" && "Manual Adjustment"}
              {actionType === "referral" && "Apply Referral Bonus"}
              {actionType === "edit" && "Edit Member"}
            </h3>
            <p className="mt-0.5 text-sm text-slate-500">{actionMember.full_name}</p>

            {actionType === "edit" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  run(updateMemberAction, fd);
                  closeAction();
                }}
                className="mt-4 space-y-3"
              >
                <input type="hidden" name="id" value={actionMember.id} />
                <div>
                  <label className="ui-label">Full Name</label>
                  <input name="full_name" className="ui-input w-full" defaultValue={actionMember.full_name} required />
                </div>
                <div>
                  <label className="ui-label">Phone</label>
                  <input name="phone" className="ui-input w-full" defaultValue={actionMember.phone ?? ""} type="tel" />
                </div>
                <div>
                  <label className="ui-label">Email</label>
                  <input name="email" className="ui-input w-full" defaultValue={actionMember.email ?? ""} type="email" />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="is_active"
                    value="true"
                    defaultChecked={actionMember.is_active}
                    className="h-4 w-4 accent-violet-600"
                  />
                  Active member
                </label>
                <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                  <button type="button" onClick={closeAction} className="btn btn-secondary rounded-xl text-sm">Cancel</button>
                  <button type="submit" disabled={isPending} className="btn btn-primary rounded-xl text-sm disabled:opacity-60">Save</button>
                </div>
              </form>
            ) : (
              <div className="mt-4 space-y-3">
                {actionType === "earn_points" && (
                  <div>
                    <label className="ui-label">Purchase total ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="ui-input w-full"
                      value={actionValue}
                      onChange={(e) => setActionValue(e.target.value)}
                      placeholder="e.g. 45.00"
                    />
                    {program && actionValue && (
                      <p className="mt-1 text-xs text-violet-600">
                        Will earn {Math.floor(parseFloat(actionValue || "0") * program.points_per_dollar)} pts
                      </p>
                    )}
                  </div>
                )}
                {actionType === "redeem_points" && (
                  <div>
                    <label className="ui-label">Points to redeem (balance: {actionMember.points_balance})</label>
                    <input
                      type="number"
                      min="1"
                      max={actionMember.points_balance}
                      className="ui-input w-full"
                      value={actionValue}
                      onChange={(e) => setActionValue(e.target.value)}
                    />
                    {program && actionValue && (
                      <p className="mt-1 text-xs text-teal-600">
                        = ${(parseInt(actionValue || "0") / program.points_redeem_per_dollar).toFixed(2)} discount
                      </p>
                    )}
                  </div>
                )}
                {actionType === "earn_stamp" && (
                  <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    Add 1 stamp to {actionMember.full_name}&apos;s card.
                    Current: {actionMember.stamps_balance}/{program?.stamps_required ?? "?"} stamps.
                    {actionMember.stamps_balance + 1 >= (program?.stamps_required ?? 999) && (
                      <p className="mt-1 font-bold">🎉 This will complete their card and earn a reward!</p>
                    )}
                  </div>
                )}
                {actionType === "adjust" && (
                  <>
                    <div>
                      <label className="ui-label">Points adjustment (use negative to deduct)</label>
                      <input
                        type="number"
                        className="ui-input w-full"
                        value={actionValue}
                        onChange={(e) => setActionValue(e.target.value)}
                        placeholder="e.g. 50 or -20"
                      />
                    </div>
                    <div>
                      <label className="ui-label">Reason</label>
                      <input
                        type="text"
                        className="ui-input w-full"
                        value={actionDesc}
                        onChange={(e) => setActionDesc(e.target.value)}
                        placeholder="e.g. Goodwill gesture"
                      />
                    </div>
                  </>
                )}
                {actionType === "referral" && (
                  <div className="rounded-xl bg-violet-50 px-4 py-3 text-sm text-violet-700">
                    Award {program?.referral_bonus_points ?? 0} referral bonus points to {actionMember.full_name}.
                  </div>
                )}
                <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                  <button onClick={closeAction} className="btn btn-secondary rounded-xl text-sm">Cancel</button>
                  <button
                    onClick={submitAction}
                    disabled={
                      isPending ||
                      ((actionType === "earn_points" || actionType === "redeem_points" || actionType === "adjust") && !actionValue.trim())
                    }
                    className="btn btn-primary rounded-xl text-sm disabled:opacity-60"
                  >
                    {isPending ? "Saving…" : "Confirm"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, color,
}: {
  label: string; value: string; sub?: string;
  color: "violet" | "amber" | "teal" | "indigo";
}) {
  const colors = {
    violet: "border-violet-100 bg-violet-50 text-violet-700",
    amber:  "border-amber-100 bg-amber-50 text-amber-700",
    teal:   "border-teal-100 bg-teal-50 text-teal-700",
    indigo: "border-indigo-100 bg-indigo-50 text-indigo-700",
  };
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
      {sub && <p className="mt-0.5 text-xs opacity-60 truncate">{sub}</p>}
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TIER_STYLES[tier] ?? TIER_STYLES.standard}`}>
      {tier}
    </span>
  );
}

function ProgramCard({ active, label, detail }: { active: boolean; label: string; detail: string }) {
  return (
    <div className={`rounded-xl border p-4 ${active ? "border-violet-200 bg-violet-50" : "border-slate-100 bg-slate-50 opacity-60"}`}>
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${active ? "bg-violet-500" : "bg-slate-300"}`} />
        <p className={`text-sm font-semibold ${active ? "text-violet-800" : "text-slate-600"}`}>{label}</p>
      </div>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function ActionBtn({
  color, onClick, children,
}: {
  color: "violet" | "rose" | "blue" | "amber" | "slate";
  onClick: () => void;
  children: React.ReactNode;
}) {
  const colors = {
    violet: "bg-violet-100 text-violet-700 hover:bg-violet-200",
    rose:   "bg-rose-100 text-rose-700 hover:bg-rose-200",
    blue:   "bg-blue-100 text-blue-700 hover:bg-blue-200",
    amber:  "bg-amber-100 text-amber-700 hover:bg-amber-200",
    slate:  "bg-slate-100 text-slate-600 hover:bg-slate-200",
  };
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition ${colors[color]}`}
    >
      {children}
    </button>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? "bg-violet-600" : "bg-slate-200"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`}
      />
    </button>
  );
}
