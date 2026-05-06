"use client";

import { useState, useTransition, useMemo } from "react";

type Vehicle = { id: string; plate_number: string; make: string|null; model: string|null; vehicle_type: string; year: number|null; color: string|null; status: string; insurance_expiry: string|null; notes: string|null; is_active: boolean; created_at: string; updated_at: string };
type Driver = { id: string; full_name: string; phone: string; license_number: string|null; license_expiry: string|null; vehicle_id: string|null; status: string; notes: string|null; is_active: boolean; created_at: string; updated_at: string };
type Delivery = { id: string; driver_id: string|null; vehicle_id: string|null; customer_name: string; customer_phone: string|null; delivery_address: string; status: string; delivery_fee: number; distance_km: number|null; notes: string|null; assigned_at: string; picked_up_at: string|null; delivered_at: string|null; created_at: string };
type VehicleLog = { id: string; vehicle_id: string; log_type: string; description: string; amount: number|null; odometer_km: number|null; log_date: string; created_at: string };

type Props = {
  restaurantName: string; vehicles: Vehicle[]; drivers: Driver[];
  deliveries: Delivery[]; vehicleLogs: VehicleLog[];
  createVehicleAction: (fd: FormData) => Promise<void>;
  updateVehicleAction: (fd: FormData) => Promise<void>;
  updateVehicleStatusAction: (fd: FormData) => Promise<void>;
  deleteVehicleAction: (fd: FormData) => Promise<void>;
  createDriverAction: (fd: FormData) => Promise<void>;
  updateDriverAction: (fd: FormData) => Promise<void>;
  updateDriverStatusAction: (fd: FormData) => Promise<void>;
  deleteDriverAction: (fd: FormData) => Promise<void>;
  createDeliveryAction: (fd: FormData) => Promise<void>;
  updateDeliveryStatusAction: (fd: FormData) => Promise<void>;
  addVehicleLogAction: (fd: FormData) => Promise<void>;
};

const VSTATUS = { available:"bg-teal-100 text-teal-700", on_delivery:"bg-blue-100 text-blue-700", maintenance:"bg-amber-100 text-amber-700", inactive:"bg-slate-100 text-slate-500" };
const DSTATUS = { available:"bg-teal-100 text-teal-700", on_delivery:"bg-blue-100 text-blue-700", off_duty:"bg-amber-100 text-amber-700", inactive:"bg-slate-100 text-slate-500" };
const DLSTATUS:Record<string,string> = { assigned:"bg-amber-100 text-amber-700", picked_up:"bg-violet-100 text-violet-700", in_transit:"bg-blue-100 text-blue-700", delivered:"bg-teal-100 text-teal-700", failed:"bg-red-100 text-red-600", cancelled:"bg-slate-100 text-slate-500" };

function fmtDate(d: string|null) { if(!d) return "—"; return new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}); }
function fmtDT(d: string|null) { if(!d) return "—"; return new Date(d).toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}); }
function fmtMoney(n: number|null) { if(n===null) return "—"; return `$${Number(n).toFixed(2)}`; }
const TODAY = new Date().toISOString().split("T")[0];

export function FleetPanel({ restaurantName, vehicles, drivers, deliveries, vehicleLogs,
  createVehicleAction, updateVehicleAction, updateVehicleStatusAction, deleteVehicleAction,
  createDriverAction, updateDriverAction, updateDriverStatusAction, deleteDriverAction,
  createDeliveryAction, updateDeliveryStatusAction, addVehicleLogAction }: Props) {
  const [tab, setTab] = useState<"overview"|"deliveries"|"vehicles"|"drivers">("overview");
  const [isPending, startTransition] = useTransition();
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle|null>(null);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [editDriver, setEditDriver] = useState<Driver|null>(null);
  const [showAddDelivery, setShowAddDelivery] = useState(false);
  const [showAddLog, setShowAddLog] = useState<string|null>(null);

  const vehicleMap = useMemo(()=>Object.fromEntries(vehicles.map(v=>[v.id,v])),[vehicles]);
  const driverMap  = useMemo(()=>Object.fromEntries(drivers.map(d=>[d.id,d])),[drivers]);

  const activeDeliveries = deliveries.filter(d=>!["delivered","failed","cancelled"].includes(d.status));
  const todayDelivered = deliveries.filter(d=>d.status==="delivered"&&d.delivered_at?.startsWith(TODAY)).length;
  const availableDrivers = drivers.filter(d=>d.is_active&&d.status==="available").length;
  const totalFees = deliveries.filter(d=>d.status==="delivered").reduce((s,d)=>s+Number(d.delivery_fee),0);

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
              <p className="text-xs font-bold uppercase tracking-widest text-violet-200">Fleet Management</p>
              <h1 className="mt-1 text-xl font-bold md:text-2xl">{restaurantName}</h1>
              <p className="mt-0.5 text-xs text-violet-200 md:text-sm">Drivers, vehicles, deliveries, and maintenance logs.</p>
            </div>
            <a href="/dashboard/restaurant" className="btn rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20">← Dashboard</a>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          {(["overview","deliveries","vehicles","drivers"] as const).map((t) => (
            <button key={t} onClick={()=>setTab(t)} className={`flex-1 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold capitalize transition ${tab===t?"bg-violet-600 text-white":"text-slate-600 hover:bg-slate-100"}`}>{t}</button>
          ))}
        </nav>

        {/* Overview */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {label:"Active Deliveries",value:String(activeDeliveries.length),cls:"border-violet-100 bg-violet-50 text-violet-600 text-violet-700"},
                {label:"Delivered Today",value:String(todayDelivered),cls:"border-teal-100 bg-teal-50 text-teal-600 text-teal-700"},
                {label:"Available Drivers",value:String(availableDrivers),cls:"border-blue-100 bg-blue-50 text-blue-600 text-blue-700"},
                {label:"Total Delivery Fees",value:fmtMoney(totalFees)!,cls:"border-fuchsia-100 bg-fuchsia-50 text-fuchsia-600 text-fuchsia-700"},
              ].map((k,i)=>{
                const [bc,bg,tc,tv] = k.cls.split(" ");
                return (
                <div key={k.label} className={`panel p-5`}>
                  <p className={`text-xs font-semibold uppercase tracking-wide text-slate-400`}>{k.label}</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">{k.value}</p>
                </div>
                );
              })}
            </div>
            {activeDeliveries.length > 0 && (
              <div className="panel p-5">
                <p className="mb-3 text-sm font-bold text-slate-700">Active Deliveries ({activeDeliveries.length})</p>
                <div className="space-y-2">
                  {activeDeliveries.map((d) => (
                    <div key={d.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <div>
                        <p className="font-semibold text-slate-800">{d.customer_name}</p>
                        <p className="text-xs text-slate-500">{d.delivery_address}</p>
                        <p className="text-xs text-slate-400">{driverMap[d.driver_id??""]?.full_name??""} · {vehicleMap[d.vehicle_id??""]?.plate_number??""}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${DLSTATUS[d.status]??"bg-slate-100 text-slate-500"}`}>{d.status.replace(/_/g," ")}</span>
                        <p className="text-xs text-slate-400">{fmtDT(d.assigned_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Deliveries */}
        {tab === "deliveries" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={()=>setShowAddDelivery(true)} className="btn btn-primary rounded-xl text-sm">+ Assign Delivery</button>
            </div>
            <div className="panel overflow-hidden p-0">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50"><tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3">Customer</th><th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Driver</th><th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assigned</th><th className="px-4 py-3">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {deliveries.length === 0
                    ? <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">No deliveries yet.</td></tr>
                    : deliveries.map((d) => {
                      const canProgress = !["delivered","failed","cancelled"].includes(d.status);
                      const nextMap: Record<string,string> = {assigned:"picked_up",picked_up:"in_transit",in_transit:"delivered"};
                      return (
                        <tr key={d.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3"><p className="font-semibold text-slate-800">{d.customer_name}</p><p className="text-xs text-slate-400">{d.customer_phone??""}</p></td>
                          <td className="px-4 py-3 text-sm text-slate-600 max-w-[150px] truncate">{d.delivery_address}</td>
                          <td className="px-4 py-3 text-slate-600">{driverMap[d.driver_id??""]?.full_name??"—"}</td>
                          <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${DLSTATUS[d.status]??"bg-slate-100 text-slate-500"}`}>{d.status.replace(/_/g," ")}</span></td>
                          <td className="px-4 py-3 text-xs text-slate-400">{fmtDT(d.assigned_at)}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {canProgress && nextMap[d.status] && (
                                <button onClick={()=>{const fd=new FormData();fd.set("id",d.id);fd.set("status",nextMap[d.status]);run(updateDeliveryStatusAction,fd);}}
                                  className="rounded-lg bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-200 capitalize">{nextMap[d.status].replace(/_/g," ")}</button>
                              )}
                              {canProgress && (
                                <button onClick={()=>{const fd=new FormData();fd.set("id",d.id);fd.set("status","failed");run(updateDeliveryStatusAction,fd);}}
                                  className="rounded-lg bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-600 hover:bg-red-200">Failed</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vehicles */}
        {tab === "vehicles" && (
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <button onClick={()=>{setEditVehicle(null);setShowAddVehicle(true);}} className="btn btn-primary rounded-xl text-sm">+ Add Vehicle</button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.length === 0
                ? <div className="panel p-8 col-span-3 text-center text-sm text-slate-400">No vehicles. Add your first vehicle.</div>
                : vehicles.map((v) => (
                  <div key={v.id} className={`panel p-4 ${!v.is_active?"opacity-60":""}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-900">{v.plate_number}</p>
                        <p className="text-xs text-slate-500">{[v.year,v.make,v.model,v.color].filter(Boolean).join(" · ")}</p>
                        <p className="text-xs text-slate-400 capitalize">{v.vehicle_type}</p>
                      </div>
                      <select defaultValue={v.status} onChange={e=>{const fd=new FormData();fd.set("id",v.id);fd.set("status",e.target.value);run(updateVehicleStatusAction,fd);}}
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase cursor-pointer ${(VSTATUS as Record<string,string>)[v.status]??"bg-slate-100 text-slate-500"}`}>
                        {["available","on_delivery","maintenance","inactive"].map(s=><option key={s} value={s} className="capitalize">{s.replace(/_/g," ")}</option>)}
                      </select>
                    </div>
                    {v.insurance_expiry && <p className="mt-1.5 text-xs text-slate-400">Insurance: {fmtDate(v.insurance_expiry)}</p>}
                    <div className="mt-2 flex gap-2 border-t border-slate-100 pt-2">
                      <button onClick={()=>{setEditVehicle(v);setShowAddVehicle(true);}} className="text-xs text-violet-600 hover:underline">Edit</button>
                      <button onClick={()=>setShowAddLog(v.id)} className="text-xs text-slate-500 hover:text-slate-700">+ Log</button>
                      <button onClick={()=>{const fd=new FormData();fd.set("id",v.id);run(deleteVehicleAction,fd);}} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                    </div>
                    {vehicleLogs.filter(l=>l.vehicle_id===v.id).slice(0,2).map((l) => (
                      <p key={l.id} className="mt-1 text-[10px] text-slate-400 truncate">📋 {l.log_date} · {l.description}{l.amount!=null?` · $${l.amount}`:""}</p>
                    ))}
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* Drivers */}
        {tab === "drivers" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={()=>{setEditDriver(null);setShowAddDriver(true);}} className="btn btn-primary rounded-xl text-sm">+ Add Driver</button>
            </div>
            <div className="panel overflow-hidden p-0">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50"><tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3">Driver</th><th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">License</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {drivers.length === 0
                    ? <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">No drivers yet.</td></tr>
                    : drivers.map((d) => (
                      <tr key={d.id} className={`hover:bg-slate-50 ${!d.is_active?"opacity-50":""}`}>
                        <td className="px-4 py-3"><p className="font-semibold text-slate-800">{d.full_name}</p><p className="text-xs text-slate-400">{d.phone}</p></td>
                        <td className="px-4 py-3 text-slate-600">{vehicleMap[d.vehicle_id??""]?.plate_number??"—"}</td>
                        <td className="px-4 py-3 text-slate-500"><p>{d.license_number??"—"}</p>{d.license_expiry&&<p className="text-xs text-slate-400">Exp: {fmtDate(d.license_expiry)}</p>}</td>
                        <td className="px-4 py-3">
                          <select defaultValue={d.status} onChange={e=>{const fd=new FormData();fd.set("id",d.id);fd.set("status",e.target.value);run(updateDriverStatusAction,fd);}}
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase cursor-pointer ${(DSTATUS as Record<string,string>)[d.status]??"bg-slate-100 text-slate-500"}`}>
                            {["available","on_delivery","off_duty","inactive"].map(s=><option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            <button onClick={()=>{setEditDriver(d);setShowAddDriver(true);}} className="text-xs text-violet-600 hover:underline">Edit</button>
                            <button onClick={()=>{const fd=new FormData();fd.set("id",d.id);run(deleteDriverAction,fd);}} className="text-xs text-red-400 hover:text-red-600">Del</button>
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
      </div>
      </main>

      {/* Assign Delivery Modal */}
      {showAddDelivery && (
        <Modal title="Assign Delivery" onClose={()=>setShowAddDelivery(false)}>
          <form onSubmit={e=>{e.preventDefault();run(createDeliveryAction,new FormData(e.currentTarget));setShowAddDelivery(false);}} className="space-y-3">
            <div><label className="ui-label">Customer Name *</label><input name="customer_name" className="ui-input w-full" required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="ui-label">Phone</label><input name="customer_phone" className="ui-input w-full" type="tel" /></div>
              <div><label className="ui-label">Delivery Fee ($)</label><input name="delivery_fee" className="ui-input w-full" type="number" step="0.01" min="0" defaultValue={0} /></div>
            </div>
            <div><label className="ui-label">Delivery Address *</label><input name="delivery_address" className="ui-input w-full" required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="ui-label">Driver</label>
                <select name="driver_id" className="ui-input w-full">
                  <option value="">— TBD —</option>
                  {drivers.filter(d=>d.is_active).map(d=><option key={d.id} value={d.id}>{d.full_name} ({d.status.replace(/_/g," ")})</option>)}
                </select>
              </div>
              <div><label className="ui-label">Vehicle</label>
                <select name="vehicle_id" className="ui-input w-full">
                  <option value="">— TBD —</option>
                  {vehicles.filter(v=>v.is_active).map(v=><option key={v.id} value={v.id}>{v.plate_number} ({v.status.replace(/_/g," ")})</option>)}
                </select>
              </div>
            </div>
            <div><label className="ui-label">Notes</label><input name="notes" className="ui-input w-full" /></div>
            <ModalFooter onClose={()=>setShowAddDelivery(false)} isPending={isPending} label="Assign" />
          </form>
        </Modal>
      )}

      {/* Add/Edit Vehicle Modal */}
      {showAddVehicle && (
        <Modal title={editVehicle?"Edit Vehicle":"Add Vehicle"} onClose={()=>{setShowAddVehicle(false);setEditVehicle(null);}}>
          <form onSubmit={e=>{e.preventDefault();const fd=new FormData(e.currentTarget);if(editVehicle){fd.set("id",editVehicle.id);run(updateVehicleAction,fd);}else run(createVehicleAction,fd);setShowAddVehicle(false);setEditVehicle(null);}} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="ui-label">Plate Number *</label><input name="plate_number" className="ui-input w-full" required defaultValue={editVehicle?.plate_number??""} /></div>
              <div><label className="ui-label">Type</label>
                <select name="vehicle_type" className="ui-input w-full" defaultValue={editVehicle?.vehicle_type??"motorcycle"}>
                  {["motorcycle","car","van","truck","bicycle","other"].map(t=><option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div><label className="ui-label">Make</label><input name="make" className="ui-input w-full" defaultValue={editVehicle?.make??""} /></div>
              <div><label className="ui-label">Model</label><input name="model" className="ui-input w-full" defaultValue={editVehicle?.model??""} /></div>
              <div><label className="ui-label">Year</label><input name="year" className="ui-input w-full" type="number" defaultValue={editVehicle?.year??""} /></div>
              <div><label className="ui-label">Color</label><input name="color" className="ui-input w-full" defaultValue={editVehicle?.color??""} /></div>
              <div className="col-span-2"><label className="ui-label">Insurance Expiry</label><input name="insurance_expiry" className="ui-input w-full" type="date" defaultValue={editVehicle?.insurance_expiry??""} /></div>
            </div>
            <ModalFooter onClose={()=>{setShowAddVehicle(false);setEditVehicle(null);}} isPending={isPending} label={editVehicle?"Save":"Add"} />
          </form>
        </Modal>
      )}

      {/* Add/Edit Driver Modal */}
      {showAddDriver && (
        <Modal title={editDriver?"Edit Driver":"Add Driver"} onClose={()=>{setShowAddDriver(false);setEditDriver(null);}}>
          <form onSubmit={e=>{e.preventDefault();const fd=new FormData(e.currentTarget);if(editDriver){fd.set("id",editDriver.id);run(updateDriverAction,fd);}else run(createDriverAction,fd);setShowAddDriver(false);setEditDriver(null);}} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className="ui-label">Full Name *</label><input name="full_name" className="ui-input w-full" required defaultValue={editDriver?.full_name??""} /></div>
              <div><label className="ui-label">Phone *</label><input name="phone" className="ui-input w-full" required type="tel" defaultValue={editDriver?.phone??""} /></div>
              <div><label className="ui-label">License Number</label><input name="license_number" className="ui-input w-full" defaultValue={editDriver?.license_number??""} /></div>
              <div><label className="ui-label">License Expiry</label><input name="license_expiry" className="ui-input w-full" type="date" defaultValue={editDriver?.license_expiry??""} /></div>
              <div><label className="ui-label">Default Vehicle</label>
                <select name="vehicle_id" className="ui-input w-full" defaultValue={editDriver?.vehicle_id??""}>
                  <option value="">— None —</option>
                  {vehicles.filter(v=>v.is_active).map(v=><option key={v.id} value={v.id}>{v.plate_number}</option>)}
                </select>
              </div>
            </div>
            <ModalFooter onClose={()=>{setShowAddDriver(false);setEditDriver(null);}} isPending={isPending} label={editDriver?"Save":"Add"} />
          </form>
        </Modal>
      )}

      {/* Add Vehicle Log Modal */}
      {showAddLog && (
        <Modal title="Add Vehicle Log" onClose={()=>setShowAddLog(null)}>
          <form onSubmit={e=>{e.preventDefault();const fd=new FormData(e.currentTarget);fd.set("vehicle_id",showAddLog);run(addVehicleLogAction,fd);setShowAddLog(null);}} className="space-y-3">
            <div><label className="ui-label">Log Type</label>
              <select name="log_type" className="ui-input w-full">
                {["fuel","mileage","maintenance","inspection","incident","other"].map(t=><option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div><label className="ui-label">Description *</label><input name="description" className="ui-input w-full" required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="ui-label">Amount ($)</label><input name="amount" className="ui-input w-full" type="number" step="0.01" min="0" /></div>
              <div><label className="ui-label">Odometer (km)</label><input name="odometer_km" className="ui-input w-full" type="number" step="0.1" min="0" /></div>
              <div className="col-span-2"><label className="ui-label">Date</label><input name="log_date" className="ui-input w-full" type="date" defaultValue={TODAY} /></div>
            </div>
            <ModalFooter onClose={()=>setShowAddLog(null)} isPending={isPending} label="Add Log" />
          </form>
        </Modal>
      )}
    </>
  );
}

function Modal({title,children,onClose}:{title:string;children:React.ReactNode;onClose:()=>void}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalFooter({onClose,isPending,label}:{onClose:()=>void;isPending:boolean;label:string}) {
  return (
    <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
      <button type="button" onClick={onClose} className="btn btn-secondary rounded-xl text-sm">Cancel</button>
      <button type="submit" disabled={isPending} className="btn btn-primary rounded-xl text-sm disabled:opacity-60">{isPending?"Saving…":label}</button>
    </div>
  );
}

