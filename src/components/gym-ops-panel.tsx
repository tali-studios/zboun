"use client";

import { useMemo, useState, useTransition } from "react";

type Trainer = {
  id: string;
  full_name: string;
  specialty: string | null;
  salary_type: string;
  base_salary: number;
  session_rate: number;
  is_active: boolean;
};
type PtPackage = { id: string; name: string; session_count: number; price: number; valid_days: number | null; is_active: boolean };
type ClubMember = { id: string; full_name: string; phone: string | null };
type MemberPackage = { id: string; club_member_id: string | null; member_name: string; package_id: string; purchased_sessions: number; used_sessions: number; remaining_sessions: number; status: string; expiry_date: string | null };
type PtSession = { id: string; trainer_id: string; club_member_id: string | null; member_name: string; scheduled_at: string; status: string; price: number; payment_status: string; session_type: string };
type Payout = { id: string; trainer_id: string; period_start: string; period_end: string; total_amount: number; status: string; paid_at: string | null };

type Props = {
  restaurantName: string;
  trainers: Trainer[];
  ptPackages: PtPackage[];
  clubMembers: ClubMember[];
  memberPackages: MemberPackage[];
  ptSessions: PtSession[];
  trainerPayouts: Payout[];
  createTrainerAction: (fd: FormData) => Promise<void>;
  updateTrainerAction: (fd: FormData) => Promise<void>;
  createPackageAction: (fd: FormData) => Promise<void>;
  createMemberPackageAction: (fd: FormData) => Promise<void>;
  createPtSessionAction: (fd: FormData) => Promise<void>;
  updatePtSessionStatusAction: (fd: FormData) => Promise<void>;
  createTrainerPayoutAction: (fd: FormData) => Promise<void>;
  autoCreateTrainerPayoutAction: (fd: FormData) => Promise<void>;
  markTrainerPayoutPaidAction: (fd: FormData) => Promise<void>;
};

export function GymOpsPanel({
  restaurantName,
  trainers,
  ptPackages,
  clubMembers,
  memberPackages,
  ptSessions,
  trainerPayouts,
  createTrainerAction,
  updateTrainerAction,
  createPackageAction,
  createMemberPackageAction,
  createPtSessionAction,
  updatePtSessionStatusAction,
  createTrainerPayoutAction,
  autoCreateTrainerPayoutAction,
  markTrainerPayoutPaidAction,
}: Props) {
  const [tab, setTab] = useState<"overview" | "trainers" | "sessions" | "packages" | "payroll">("overview");
  const [isPending, startTransition] = useTransition();
  const [editTrainerId, setEditTrainerId] = useState<string | null>(null);

  const trainerMap = useMemo(
    () => Object.fromEntries(trainers.map((trainer) => [trainer.id, trainer])),
    [trainers],
  );

  const scheduledSessions = ptSessions.filter((session) => session.status === "scheduled").length;
  const completedSessions = ptSessions.filter((session) => session.status === "completed").length;
  const unpaidSessions = ptSessions.filter((session) => session.payment_status === "unpaid").length;
  const weekStart = new Date();
  const day = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - day + (day === 0 ? -6 : 1));
  weekStart.setHours(0, 0, 0, 0);
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return date;
  });
  const weeklySessions = ptSessions.filter((session) => {
    const sessionDate = new Date(session.scheduled_at);
    const end = new Date(weekStart);
    end.setDate(weekStart.getDate() + 7);
    return sessionDate >= weekStart && sessionDate < end;
  });

  const monthlyPayrollDue = trainerPayouts
    .filter((payout) => payout.status !== "paid")
    .reduce((sum, payout) => sum + Number(payout.total_amount), 0);

  function run(action: (fd: FormData) => Promise<void>, formData: FormData) {
    startTransition(async () => {
      await action(formData);
    });
  }

  return (
    <main className="min-h-screen bg-[#f8f8ff] p-3 sm:p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 via-violet-600 to-fuchsia-600 p-5 text-white shadow-lg shadow-violet-600/30 md:p-6">
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-violet-200">Gym Operations</p>
              <h1 className="mt-1 text-xl font-bold md:text-2xl">{restaurantName}</h1>
              <p className="mt-0.5 text-xs text-violet-200">Trainers, PT sessions, attendance, and payroll operations.</p>
            </div>
            <a href="/dashboard/business" className="btn rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20">Back to dashboard</a>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          {(["overview", "trainers", "sessions", "packages", "payroll"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`flex-1 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold capitalize ${tab === item ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {item}
            </button>
          ))}
        </nav>

        {tab === "overview" && (
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Active trainers" value={String(trainers.filter((trainer) => trainer.is_active).length)} />
            <KpiCard label="Scheduled sessions" value={String(scheduledSessions)} />
            <KpiCard label="Completed sessions" value={String(completedSessions)} />
            <KpiCard label="Unpaid sessions" value={String(unpaidSessions)} />
            <KpiCard label="Payroll due" value={`$${monthlyPayrollDue.toFixed(2)}`} />
          </section>
        )}

        {tab === "trainers" && (
          <section className="grid gap-4 lg:grid-cols-3">
            <form
              id="auto-payout-form"
              onSubmit={(event) => {
                event.preventDefault();
                run(createTrainerAction, new FormData(event.currentTarget));
                event.currentTarget.reset();
              }}
              className="panel p-5 lg:col-span-1"
            >
              <h2 className="panel-title">Add trainer</h2>
              <div className="mt-3 space-y-2">
                <input name="full_name" required placeholder="Full name" className="ui-input" />
                <input name="specialty" placeholder="Specialty" className="ui-input" />
                <select name="salary_type" className="ui-select">
                  <option value="base">Base salary</option>
                  <option value="per_session">Per session</option>
                  <option value="hybrid">Hybrid</option>
                </select>
                <input name="base_salary" type="number" step="0.01" min="0" placeholder="Base salary" className="ui-input" />
                <input name="session_rate" type="number" step="0.01" min="0" placeholder="Session rate" className="ui-input" />
                <button disabled={isPending} className="btn btn-primary w-full rounded-xl">Save trainer</button>
              </div>
            </form>
            <div className="panel overflow-hidden p-0 lg:col-span-2">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
                  <tr><th className="px-4 py-3">Trainer</th><th className="px-4 py-3">Comp model</th><th className="px-4 py-3">Rate</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {trainers.map((trainer) => (
                    <tr key={trainer.id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{trainer.full_name}</p>
                        <p className="text-xs text-slate-500">{trainer.specialty ?? "General coach"}</p>
                      </td>
                      <td className="px-4 py-3 capitalize">{trainer.salary_type.replace("_", " ")}</td>
                      <td className="px-4 py-3">${Number(trainer.base_salary).toFixed(2)} + ${Number(trainer.session_rate).toFixed(2)}/session</td>
                      <td className="px-4 py-3">{trainer.is_active ? "Active" : "Inactive"}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setEditTrainerId(trainer.id)} className="rounded-lg bg-violet-100 px-2 py-1 text-xs font-semibold text-violet-700">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === "sessions" && (
          <section className="grid gap-4 lg:grid-cols-3">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                run(createPtSessionAction, new FormData(event.currentTarget));
                event.currentTarget.reset();
              }}
              className="panel p-5"
            >
              <h2 className="panel-title">Book PT session</h2>
              <div className="mt-3 space-y-2">
                <select name="trainer_id" required className="ui-select">
                  <option value="">Select trainer</option>
                  {trainers.filter((trainer) => trainer.is_active).map((trainer) => <option key={trainer.id} value={trainer.id}>{trainer.full_name}</option>)}
                </select>
                <input name="member_name" required placeholder="Client name" className="ui-input" />
                <select name="club_member_id" className="ui-select">
                  <option value="">No linked member</option>
                  {clubMembers.map((member) => <option key={member.id} value={member.id}>{member.full_name}</option>)}
                </select>
                <input name="member_phone" placeholder="Client phone" className="ui-input" />
                <select name="package_id" className="ui-select">
                  <option value="">No package</option>
                  {ptPackages.filter((pkg) => pkg.is_active).map((pkg) => <option key={pkg.id} value={pkg.id}>{pkg.name}</option>)}
                </select>
                <input name="scheduled_at" type="datetime-local" required className="ui-input" />
                <input name="duration_mins" type="number" min="15" step="15" defaultValue={60} className="ui-input" />
                <input name="price" type="number" step="0.01" min="0" placeholder="Session price" className="ui-input" />
                <button disabled={isPending} className="btn btn-primary w-full rounded-xl">Create session</button>
              </div>
            </form>
            <div className="panel overflow-hidden p-0 lg:col-span-2">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
                  <tr><th className="px-4 py-3">Session</th><th className="px-4 py-3">Trainer</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ptSessions.map((session) => (
                    <tr key={session.id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{session.member_name}</p>
                        <p className="text-xs text-slate-500">{new Date(session.scheduled_at).toLocaleString()}</p>
                      </td>
                      <td className="px-4 py-3">{trainerMap[session.trainer_id]?.full_name ?? "—"}</td>
                      <td className="px-4 py-3 capitalize">{session.status.replace("_", " ")}</td>
                      <td className="px-4 py-3">{session.payment_status === "paid" ? "Paid" : `Unpaid ($${Number(session.price).toFixed(2)})`}</td>
                      <td className="px-4 py-3">
                        {session.status !== "completed" ? (
                          <button
                            onClick={() => {
                              const formData = new FormData();
                              formData.set("id", session.id);
                              formData.set("status", "completed");
                              formData.set("payment_status", session.payment_status);
                              run(updatePtSessionStatusAction, formData);
                            }}
                            className="rounded-lg bg-teal-100 px-2 py-1 text-xs font-semibold text-teal-700"
                          >
                            Complete
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500">Done</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === "packages" && (
          <section className="grid gap-4 lg:grid-cols-3">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                run(createMemberPackageAction, new FormData(event.currentTarget));
                event.currentTarget.reset();
              }}
              className="panel p-5"
            >
              <h2 className="panel-title">Assign package to member</h2>
              <div className="mt-3 space-y-2">
                <select name="package_id" required className="ui-select">
                  <option value="">Select package</option>
                  {ptPackages.filter((pkg) => pkg.is_active).map((pkg) => <option key={pkg.id} value={pkg.id}>{pkg.name} ({pkg.session_count} sessions)</option>)}
                </select>
                <select name="club_member_id" className="ui-select">
                  <option value="">No linked club member</option>
                  {clubMembers.map((member) => <option key={member.id} value={member.id}>{member.full_name}</option>)}
                </select>
                <input name="member_name" required placeholder="Member name" className="ui-input" />
                <input name="member_phone" placeholder="Member phone" className="ui-input" />
                <input name="purchased_sessions" type="number" min="1" defaultValue={8} className="ui-input" />
                <input name="expiry_date" type="date" className="ui-input" />
                <button disabled={isPending} className="btn btn-primary w-full rounded-xl">Assign package</button>
              </div>
            </form>
            <div className="panel p-5 lg:col-span-2">
              <h2 className="panel-title">Weekly trainer calendar</h2>
              <div className="mt-3 grid gap-2 md:grid-cols-7">
                {weekDays.map((dayDate) => (
                  <div key={dayDate.toISOString()} className="rounded-xl border border-slate-200 bg-slate-50 p-2">
                    <p className="text-xs font-semibold text-slate-500">{dayDate.toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}</p>
                    <div className="mt-2 space-y-1">
                      {weeklySessions
                        .filter((session) => new Date(session.scheduled_at).toDateString() === dayDate.toDateString())
                        .slice(0, 6)
                        .map((session) => (
                          <p key={session.id} className="rounded bg-white px-2 py-1 text-[11px] text-slate-700">
                            {new Date(session.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {trainerMap[session.trainer_id]?.full_name ?? "Trainer"}
                          </p>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
              <h3 className="mt-5 text-sm font-semibold text-slate-800">Package consumption</h3>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-[11px] uppercase tracking-wide text-slate-500">
                    <tr><th className="py-2">Member</th><th className="py-2">Package</th><th className="py-2">Used</th><th className="py-2">Remaining</th><th className="py-2">Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {memberPackages.map((pkg) => (
                      <tr key={pkg.id}>
                        <td className="py-2">{pkg.member_name}</td>
                        <td className="py-2">{ptPackages.find((p) => p.id === pkg.package_id)?.name ?? "—"}</td>
                        <td className="py-2">{pkg.used_sessions}/{pkg.purchased_sessions}</td>
                        <td className="py-2 font-semibold">{pkg.remaining_sessions}</td>
                        <td className="py-2 capitalize">{pkg.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {tab === "payroll" && (
          <section className="grid gap-4 lg:grid-cols-3">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                run(createTrainerPayoutAction, new FormData(event.currentTarget));
                event.currentTarget.reset();
              }}
              className="panel p-5"
            >
              <h2 className="panel-title">Create payout</h2>
              <div className="mt-3 space-y-2">
                <select name="trainer_id" required className="ui-select">
                  <option value="">Select trainer</option>
                  {trainers.map((trainer) => <option key={trainer.id} value={trainer.id}>{trainer.full_name}</option>)}
                </select>
                <input name="period_start" type="date" required className="ui-input" />
                <input name="period_end" type="date" required className="ui-input" />
                <input name="base_amount" type="number" step="0.01" min="0" placeholder="Base amount" className="ui-input" />
                <input name="session_amount" type="number" step="0.01" min="0" placeholder="Session amount" className="ui-input" />
                <input name="bonus_amount" type="number" step="0.01" min="0" placeholder="Bonus amount" className="ui-input" />
                <button disabled={isPending} className="btn btn-primary w-full rounded-xl">Save payout</button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    const formData = new FormData();
                    const form = document.getElementById("auto-payout-form") as HTMLFormElement | null;
                    if (!form) return;
                    const source = new FormData(form);
                    formData.set("trainer_id", String(source.get("trainer_id") ?? ""));
                    formData.set("period_start", String(source.get("period_start") ?? ""));
                    formData.set("period_end", String(source.get("period_end") ?? ""));
                    run(autoCreateTrainerPayoutAction, formData);
                  }}
                  className="btn btn-secondary w-full rounded-xl"
                >
                  Auto-calc from sessions
                </button>
              </div>
            </form>
            <div className="panel overflow-hidden p-0 lg:col-span-2">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
                  <tr><th className="px-4 py-3">Trainer</th><th className="px-4 py-3">Period</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {trainerPayouts.map((payout) => (
                    <tr key={payout.id}>
                      <td className="px-4 py-3">{trainerMap[payout.trainer_id]?.full_name ?? "—"}</td>
                      <td className="px-4 py-3">{payout.period_start} to {payout.period_end}</td>
                      <td className="px-4 py-3">${Number(payout.total_amount).toFixed(2)}</td>
                      <td className="px-4 py-3 capitalize">{payout.status}</td>
                      <td className="px-4 py-3">
                        {payout.status !== "paid" ? (
                          <button
                            onClick={() => {
                              const formData = new FormData();
                              formData.set("id", payout.id);
                              run(markTrainerPayoutPaidAction, formData);
                            }}
                            className="rounded-lg bg-teal-100 px-2 py-1 text-xs font-semibold text-teal-700"
                          >
                            Mark paid
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500">{payout.paid_at ? new Date(payout.paid_at).toLocaleDateString() : "Paid"}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {editTrainerId ? (
          <section className="panel p-5">
            <h2 className="panel-title">Edit trainer</h2>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                formData.set("id", editTrainerId);
                run(updateTrainerAction, formData);
                setEditTrainerId(null);
              }}
              className="mt-3 grid gap-2 md:grid-cols-4"
            >
              <input name="full_name" defaultValue={trainerMap[editTrainerId]?.full_name ?? ""} className="ui-input" />
              <input name="specialty" defaultValue={trainerMap[editTrainerId]?.specialty ?? ""} className="ui-input" />
              <input name="base_salary" defaultValue={trainerMap[editTrainerId]?.base_salary ?? 0} type="number" step="0.01" className="ui-input" />
              <input name="session_rate" defaultValue={trainerMap[editTrainerId]?.session_rate ?? 0} type="number" step="0.01" className="ui-input" />
              <select name="salary_type" defaultValue={trainerMap[editTrainerId]?.salary_type ?? "base"} className="ui-select md:col-span-2">
                <option value="base">Base salary</option>
                <option value="per_session">Per session</option>
                <option value="hybrid">Hybrid</option>
              </select>
              <button className="btn btn-primary rounded-xl">Save trainer</button>
              <button type="button" onClick={() => setEditTrainerId(null)} className="btn btn-secondary rounded-xl">Cancel</button>
            </form>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="panel p-5">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
    </article>
  );
}
