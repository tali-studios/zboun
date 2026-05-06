"use client";

import { useState, useTransition, useMemo } from "react";

type Plan = { id: string; name: string; description: string|null; price: number; billing_cycle: string; duration_days: number|null; max_guests: number; benefits: string[]|null; color: string; is_active: boolean };
type Member = { id: string; plan_id: string|null; full_name: string; phone: string|null; email: string|null; member_number: string|null; joined_at: string; expiry_date: string|null; status: string; total_visits: number; total_spent: number; crm_customer_id: string|null; loyalty_member_id: string|null; notes: string|null; created_at: string; updated_at: string };
type CheckIn = { id: string; member_id: string; guests_count: number; notes: string|null; checked_in_at: string };
type Invoice = { id: string; member_id: string; invoice_number: string|null; period_start: string|null; period_end: string|null; amount: number; status: string; paid_at: string|null; notes: string|null; created_at: string };
type CrmCustomer = { id: string; full_name: string; phone: string|null };
type LoyaltyMember = { id: string; full_name: string; phone: string|null };

type Props = {
  restaurantName: string; plans: Plan[]; members: Member[];
  checkIns: CheckIn[]; invoices: Invoice[];
  crmCustomers: CrmCustomer[]; loyaltyMembers: LoyaltyMember[];
  createPlanAction: (fd: FormData) => Promise<void>;
  updatePlanAction: (fd: FormData) => Promise<void>;
  deletePlanAction: (fd: FormData) => Promise<void>;
  enrollMemberAction: (fd: FormData) => Promise<void>;
  updateMemberAction: (fd: FormData) => Promise<void>;
  checkInMemberAction: (fd: FormData) => Promise<void>;
  createInvoiceAction: (fd: FormData) => Promise<void>;
  markInvoicePaidAction: (fd: FormData) => Promise<void>;
};

const MSTATUS_COLORS: Record<string,string> = { active:"bg-teal-100 text-teal-700", suspended:"bg-amber-100 text-amber-700", expired:"bg-red-100 text-red-600", cancelled:"bg-slate-100 text-slate-500" };
const ISTATUS_COLORS: Record<string,string> = { unpaid:"bg-amber-100 text-amber-700", paid:"bg-teal-100 text-teal-700", waived:"bg-slate-100 text-slate-500", refunded:"bg-red-100 text-red-600" };

function fmtDate(d: string|null) { if(!d) return "—"; return new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}); }
function fmtDT(d: string|null) { if(!d) return "—"; return new Date(d).toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}); }
function fmtMoney(n: number) { return `$${Number(n).toFixed(2)}`; }

export function ClubPanel({ restaurantName, plans, members, checkIns, invoices,
  crmCustomers, loyaltyMembers,
  createPlanAction, updatePlanAction, deletePlanAction,
  enrollMemberAction, updateMemberAction, checkInMemberAction,
  createInvoiceAction, markInvoicePaidAction }: Props) {
  const [tab, setTab] = useState<"overview"|"members"|"invoices"|"plans">("overview");
  const [isPending, startTransition] = useTransition();
  const [showEnroll, setShowEnroll] = useState(false);
  const [editMember, setEditMember] = useState<Member|null>(null);
  const [viewMember, setViewMember] = useState<Member|null>(null);
  const [showCheckIn, setShowCheckIn] = useState<Member|null>(null);
  const [showAddInvoice, setShowAddInvoice] = useState<Member|null>(null);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan|null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const planMap = useMemo(()=>Object.fromEntries(plans.map(p=>[p.id,p])),[plans]);

  const filteredMembers = useMemo(()=>{
    let m = members;
    if(statusFilter!=="all") m = m.filter(x=>x.status===statusFilter);
    if(search) m = m.filter(x=>x.full_name.toLowerCase().includes(search.toLowerCase())||x.phone?.includes(search)||x.member_number?.includes(search));
    return m;
  },[members,statusFilter,search]);

  const activeCount = members.filter(m=>m.status==="active").length;
  const expiredCount = members.filter(m=>m.status==="expired").length;
  const thisMonth = new Date(); thisMonth.setDate(1); thisMonth.setHours(0,0,0,0);
  const newThisMonth = members.filter(m=>new Date(m.joined_at)>=thisMonth).length;
  const outstandingInvoices = invoices.filter(i=>i.status==="unpaid").length;
  const todayCheckins = checkIns.filter(c=>c.checked_in_at.startsWith(new Date().toISOString().split("T")[0])).length;

  function run(action:(fd:FormData)=>Promise<void>,fd:FormData){startTransition(async()=>{await action(fd);})}

  return (
    <>
      <main className="min-h-screen bg-[#f8f8ff] p-3 sm:p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Header */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 via-violet-600 to-fuchsia-600 p-5 text-white shadow-lg shadow-violet-600/30 md:p-6">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-violet-200">Club Management</p>
              <h1 className="mt-1 text-xl font-bold md:text-2xl">{restaurantName}</h1>
              <p className="mt-0.5 text-xs text-violet-200 md:text-sm">Membership plans, check-ins, and subscription invoicing.</p>
            </div>
            <a href="/dashboard/restaurant" className="btn rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20">← Dashboard</a>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          {(["overview","members","invoices","plans"] as const).map((t) => (
            <button key={t} onClick={()=>setTab(t)} className={`flex-1 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold capitalize transition ${tab===t?"bg-violet-600 text-white":"text-slate-600 hover:bg-slate-100"}`}>{t}</button>
          ))}
        </nav>

        {/* Overview */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {label:"Active Members",value:String(activeCount)},
                {label:"New This Month",value:String(newThisMonth)},
                {label:"Check-ins Today",value:String(todayCheckins)},
                {label:"Outstanding Invoices",value:String(outstandingInvoices)},
              ].map(k=>(
                <div key={k.label} className="panel p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{k.label}</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">{k.value}</p>
                </div>
              ))}
            </div>
            {/* Plan summary */}
            {plans.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {plans.filter(p=>p.is_active).map((p)=>{
                  const planMembers = members.filter(m=>m.plan_id===p.id&&m.status==="active");
                  return (
                    <div key={p.id} className="panel p-4 border-l-4" style={{borderLeftColor:p.color}}>
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900">{p.name}</p>
                        <p className="text-sm font-bold text-slate-700">{fmtMoney(p.price)}<span className="text-xs font-normal text-slate-400"> /{p.billing_cycle.replace("_"," ")}</span></p>
                      </div>
                      <p className="text-xs text-slate-400">{planMembers.length} active member{planMembers.length!==1?"s":""}</p>
                      {p.benefits && <ul className="mt-1 space-y-0.5">{p.benefits.slice(0,3).map((b,i)=><li key={i} className="text-xs text-slate-500 flex items-center gap-1"><span className="text-green-500">✓</span>{b}</li>)}</ul>}
                    </div>
                  );
                })}
              </div>
            )}
            {/* Recent check-ins */}
            {checkIns.length > 0 && (
              <div className="panel p-5">
                <p className="mb-3 text-sm font-bold text-slate-700">Recent Check-ins</p>
                <div className="space-y-1.5">
                  {checkIns.slice(0,6).map((c)=>{
                    const m = members.find(x=>x.id===c.member_id);
                    return (
                      <div key={c.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                        <span className="font-semibold text-slate-700">{m?.full_name??"Unknown"} <span className="text-slate-400 font-normal">+{c.guests_count-1} guest{c.guests_count-1!==1?"s":""}</span></span>
                        <span className="text-xs text-slate-400">{fmtDT(c.checked_in_at)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Members */}
        {tab === "members" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, phone, card…" className="ui-input flex-1 min-w-[200px]" />
              <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="ui-input">
                <option value="all">All Statuses</option>
                {["active","suspended","expired","cancelled"].map(s=><option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
              <button onClick={()=>setShowEnroll(true)} className="btn btn-primary rounded-xl text-sm">+ Enroll Member</button>
            </div>
            <div className="panel overflow-hidden p-0">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50"><tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3">Member</th><th className="px-4 py-3">Card #</th><th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Expiry</th><th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Visits</th><th className="px-4 py-3">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.length === 0
                    ? <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">No members found.</td></tr>
                    : filteredMembers.map((m)=>(
                      <tr key={m.id} className={`hover:bg-slate-50 ${m.status!=="active"?"opacity-60":""}`}>
                        <td className="px-4 py-3"><p className="font-semibold text-slate-800">{m.full_name}</p><p className="text-xs text-slate-400">{m.phone??m.email??""}</p></td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{m.member_number??"—"}</td>
                        <td className="px-4 py-3 text-slate-600">{planMap[m.plan_id??""]?.name??"—"}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(m.expiry_date)}</td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${MSTATUS_COLORS[m.status]??"bg-slate-100 text-slate-500"}`}>{m.status}</span></td>
                        <td className="px-4 py-3 text-slate-600">{m.total_visits}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            <button onClick={()=>setViewMember(m)} className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-200">View</button>
                            <button onClick={()=>setShowCheckIn(m)} className="rounded-lg bg-teal-100 px-2 py-0.5 text-[11px] font-semibold text-teal-700 hover:bg-teal-200">Check-in</button>
                            <button onClick={()=>{setEditMember(m);setShowEnroll(true);}} className="rounded-lg bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-700 hover:bg-violet-200">Edit</button>
                            <button onClick={()=>setShowAddInvoice(m)} className="rounded-lg bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-200">Invoice</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Invoices */}
        {tab === "invoices" && (
          <div className="panel overflow-hidden p-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50"><tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">Invoice #</th><th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Period</th><th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.length === 0
                  ? <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">No invoices yet.</td></tr>
                  : invoices.map((inv)=>{
                    const m = members.find(x=>x.id===inv.member_id);
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{inv.invoice_number??"—"}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{m?.full_name??"—"}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(inv.period_start)} – {fmtDate(inv.period_end)}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{fmtMoney(inv.amount)}</td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${ISTATUS_COLORS[inv.status]??"bg-slate-100 text-slate-500"}`}>{inv.status}</span></td>
                        <td className="px-4 py-3">
                          {inv.status === "unpaid" && (
                            <button onClick={()=>{const fd=new FormData();fd.set("id",inv.id);fd.set("amount",String(inv.amount));run(markInvoicePaidAction,fd);}}
                              className="rounded-lg bg-teal-100 px-2 py-0.5 text-[11px] font-semibold text-teal-700 hover:bg-teal-200">Mark Paid</button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        )}

        {/* Plans */}
        {tab === "plans" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={()=>{setEditPlan(null);setShowAddPlan(true);}} className="btn btn-primary rounded-xl text-sm">+ Create Plan</button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {plans.length === 0
                ? <div className="panel p-8 col-span-3 text-center text-sm text-slate-400">No membership plans yet. Create your first plan!</div>
                : plans.map((p)=>{
                  const pMembers = members.filter(m=>m.plan_id===p.id);
                  return (
                    <div key={p.id} className={`panel p-5 border-t-4 ${!p.is_active?"opacity-50":""}`} style={{borderTopColor:p.color}}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-lg font-bold text-slate-900">{p.name}</p>
                          <p className="text-sm text-slate-400">{p.billing_cycle.replace("_"," ")}</p>
                        </div>
                        <p className="text-xl font-bold text-slate-800">{fmtMoney(p.price)}</p>
                      </div>
                      {p.description && <p className="mt-1.5 text-sm text-slate-500">{p.description}</p>}
                      {p.benefits && p.benefits.length > 0 && (
                        <ul className="mt-2 space-y-0.5">
                          {p.benefits.map((b,i)=><li key={i} className="flex items-center gap-1.5 text-sm text-slate-600"><span className="text-green-500">✓</span>{b}</li>)}
                        </ul>
                      )}
                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                        <p className="text-xs text-slate-400">{pMembers.filter(m=>m.status==="active").length} active · {pMembers.length} total</p>
                        <div className="flex gap-1.5">
                          <button onClick={()=>{setEditPlan(p);setShowAddPlan(true);}} className="text-xs text-violet-600 hover:underline">Edit</button>
                          <button onClick={()=>{const fd=new FormData();fd.set("id",p.id);run(deletePlanAction,fd);}} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                        </div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>
        )}
      </div>
      </main>

      {/* Enroll / Edit Member Modal */}
      {showEnroll && (
        <Modal title={editMember?"Edit Member":"Enroll Member"} onClose={()=>{setShowEnroll(false);setEditMember(null);}}>
          <form onSubmit={e=>{e.preventDefault();const fd=new FormData(e.currentTarget);if(editMember){fd.set("id",editMember.id);run(updateMemberAction,fd);}else run(enrollMemberAction,fd);setShowEnroll(false);setEditMember(null);}} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className="ui-label">Full Name *</label><input name="full_name" className="ui-input w-full" required defaultValue={editMember?.full_name??""} /></div>
              <div><label className="ui-label">Phone</label><input name="phone" className="ui-input w-full" type="tel" defaultValue={editMember?.phone??""} /></div>
              <div><label className="ui-label">Email</label><input name="email" className="ui-input w-full" type="email" defaultValue={editMember?.email??""} /></div>
              <div className="col-span-2"><label className="ui-label">Membership Plan</label>
                <select name="plan_id" className="ui-input w-full" defaultValue={editMember?.plan_id??""}>
                  <option value="">— No plan —</option>
                  {plans.filter(p=>p.is_active).map(p=><option key={p.id} value={p.id}>{p.name} — {fmtMoney(p.price)}/{p.billing_cycle.replace("_"," ")}</option>)}
                </select>
              </div>
              {editMember && <>
                <div><label className="ui-label">Expiry Date</label><input name="expiry_date" className="ui-input w-full" type="date" defaultValue={editMember?.expiry_date??""} /></div>
                <div><label className="ui-label">Status</label>
                  <select name="status" className="ui-input w-full" defaultValue={editMember?.status??"active"}>
                    {["active","suspended","expired","cancelled"].map(s=><option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                </div>
              </>}
              {!editMember && <>
                <div><label className="ui-label">Link CRM Customer</label>
                  <select name="crm_customer_id" className="ui-input w-full">
                    <option value="">— None —</option>
                    {crmCustomers.map(c=><option key={c.id} value={c.id}>{c.full_name}</option>)}
                  </select>
                </div>
                <div><label className="ui-label">Link Loyalty Member</label>
                  <select name="loyalty_member_id" className="ui-input w-full">
                    <option value="">— None —</option>
                    {loyaltyMembers.map(l=><option key={l.id} value={l.id}>{l.full_name}</option>)}
                  </select>
                </div>
              </>}
              <div className="col-span-2"><label className="ui-label">Notes</label><textarea name="notes" className="ui-input w-full" rows={2} defaultValue={editMember?.notes??""} /></div>
            </div>
            <ModalFooter onClose={()=>{setShowEnroll(false);setEditMember(null);}} isPending={isPending} label={editMember?"Save":"Enroll"} />
          </form>
        </Modal>
      )}

      {/* Check-in Modal */}
      {showCheckIn && (
        <Modal title={`Check-in — ${showCheckIn.full_name}`} onClose={()=>setShowCheckIn(null)}>
          <form onSubmit={e=>{e.preventDefault();const fd=new FormData(e.currentTarget);fd.set("member_id",showCheckIn.id);run(checkInMemberAction,fd);setShowCheckIn(null);}} className="space-y-3">
            <div><label className="ui-label">Guests (incl. member)</label><input name="guests_count" type="number" min="1" max={planMap[showCheckIn.plan_id??""]?.max_guests??10} defaultValue={1} className="ui-input w-full" /></div>
            <div><label className="ui-label">Notes</label><input name="notes" className="ui-input w-full" /></div>
            <ModalFooter onClose={()=>setShowCheckIn(null)} isPending={isPending} label="Check In" />
          </form>
        </Modal>
      )}

      {/* Add Invoice Modal */}
      {showAddInvoice && (
        <Modal title={`New Invoice — ${showAddInvoice.full_name}`} onClose={()=>setShowAddInvoice(null)}>
          <form onSubmit={e=>{e.preventDefault();const fd=new FormData(e.currentTarget);fd.set("member_id",showAddInvoice.id);run(createInvoiceAction,fd);setShowAddInvoice(null);}} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="ui-label">Period Start</label><input name="period_start" type="date" className="ui-input w-full" /></div>
              <div><label className="ui-label">Period End</label><input name="period_end" type="date" className="ui-input w-full" /></div>
              <div className="col-span-2"><label className="ui-label">Amount ($) *</label><input name="amount" type="number" step="0.01" min="0" className="ui-input w-full" required defaultValue={planMap[showAddInvoice.plan_id??""]?.price??0} /></div>
            </div>
            <ModalFooter onClose={()=>setShowAddInvoice(null)} isPending={isPending} label="Create Invoice" />
          </form>
        </Modal>
      )}

      {/* Create / Edit Plan Modal */}
      {showAddPlan && (
        <Modal title={editPlan?"Edit Plan":"Create Plan"} onClose={()=>{setShowAddPlan(false);setEditPlan(null);}}>
          <form onSubmit={e=>{e.preventDefault();const fd=new FormData(e.currentTarget);if(editPlan){fd.set("id",editPlan.id);run(updatePlanAction,fd);}else run(createPlanAction,fd);setShowAddPlan(false);setEditPlan(null);}} className="space-y-3">
            <div><label className="ui-label">Plan Name *</label><input name="name" className="ui-input w-full" required defaultValue={editPlan?.name??""} /></div>
            <div><label className="ui-label">Description</label><input name="description" className="ui-input w-full" defaultValue={editPlan?.description??""} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="ui-label">Price ($)</label><input name="price" type="number" step="0.01" min="0" className="ui-input w-full" required defaultValue={editPlan?.price??0} /></div>
              <div><label className="ui-label">Billing Cycle</label>
                <select name="billing_cycle" className="ui-input w-full" defaultValue={editPlan?.billing_cycle??"monthly"}>
                  {["monthly","quarterly","annual","one_time"].map(b=><option key={b} value={b} className="capitalize">{b.replace("_"," ")}</option>)}
                </select>
              </div>
              <div><label className="ui-label">Duration (days)</label><input name="duration_days" type="number" min="1" className="ui-input w-full" defaultValue={editPlan?.duration_days??""} placeholder="Blank = unlimited" /></div>
              <div><label className="ui-label">Max Guests</label><input name="max_guests" type="number" min="1" className="ui-input w-full" defaultValue={editPlan?.max_guests??1} /></div>
              <div><label className="ui-label">Color</label><input name="color" type="color" className="h-10 w-full cursor-pointer rounded-xl border border-slate-200" defaultValue={editPlan?.color??"#6366f1"} /></div>
            </div>
            <div><label className="ui-label">Benefits (one per line)</label>
              <textarea name="benefits" className="ui-input w-full" rows={3} defaultValue={editPlan?.benefits?.join("\n")??""} placeholder="Priority seating&#10;10% F&B discount" />
            </div>
            <ModalFooter onClose={()=>{setShowAddPlan(false);setEditPlan(null);}} isPending={isPending} label={editPlan?"Save":"Create"} />
          </form>
        </Modal>
      )}

      {/* View Member Modal */}
      {viewMember && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
            <div className="mb-4 flex items-start justify-between gap-2">
              <div>
                <p className="font-mono text-xs text-slate-400">{viewMember.member_number??"—"}</p>
                <h3 className="text-lg font-bold text-slate-900">{viewMember.full_name}</h3>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${MSTATUS_COLORS[viewMember.status]}`}>{viewMember.status}</span>
              </div>
              <button onClick={()=>setViewMember(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><p className="text-xs text-slate-400">Phone</p><p>{viewMember.phone??"—"}</p></div>
              <div><p className="text-xs text-slate-400">Email</p><p>{viewMember.email??"—"}</p></div>
              <div><p className="text-xs text-slate-400">Plan</p><p>{planMap[viewMember.plan_id??""]?.name??"—"}</p></div>
              <div><p className="text-xs text-slate-400">Joined</p><p>{fmtDate(viewMember.joined_at)}</p></div>
              <div><p className="text-xs text-slate-400">Expiry</p><p>{fmtDate(viewMember.expiry_date)}</p></div>
              <div><p className="text-xs text-slate-400">Visits</p><p className="font-semibold">{viewMember.total_visits}</p></div>
              <div><p className="text-xs text-slate-400">Total Spent</p><p className="font-semibold">{fmtMoney(viewMember.total_spent)}</p></div>
            </div>
            {viewMember.notes && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">📝 {viewMember.notes}</p>}
            <div className="mt-3 border-t border-slate-100 pt-3">
              <p className="mb-1.5 text-xs font-bold text-slate-400">Recent Invoices</p>
              {invoices.filter(i=>i.member_id===viewMember.id).slice(0,4).map(inv=>(
                <div key={inv.id} className="flex items-center justify-between text-xs py-1">
                  <span className="font-mono text-slate-500">{inv.invoice_number??"—"}</span>
                  <span className="font-semibold">{fmtMoney(inv.amount)}</span>
                  <span className={`rounded-full px-1.5 font-bold uppercase ${ISTATUS_COLORS[inv.status]}`}>{inv.status}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={()=>{setShowCheckIn(viewMember);setViewMember(null);}} className="btn btn-secondary rounded-xl text-sm">Check-in</button>
              <button onClick={()=>setViewMember(null)} className="btn btn-secondary rounded-xl text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Modal({title,children,onClose}:{title:string;children:React.ReactNode;onClose:()=>void}){
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-bold text-slate-900">{title}</h3><button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button></div>
        {children}
      </div>
    </div>
  );
}

function ModalFooter({onClose,isPending,label}:{onClose:()=>void;isPending:boolean;label:string}){
  return (
    <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
      <button type="button" onClick={onClose} className="btn btn-secondary rounded-xl text-sm">Cancel</button>
      <button type="submit" disabled={isPending} className="btn btn-primary rounded-xl text-sm disabled:opacity-60">{isPending?"Saving…":label}</button>
    </div>
  );
}

