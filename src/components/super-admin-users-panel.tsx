"use client";

import { useState, useMemo, useTransition, type ReactNode } from "react";
import { Ban, KeyRound, ShieldCheck, Trash2 } from "lucide-react";
import {
  deletePlatformUserAction,
  setPlatformUserPasswordAction,
  togglePlatformUserBlockedAction,
} from "@/app-actions/superadmin";
import { SuperAdminSetPasswordModal } from "@/components/super-admin-set-password-modal";

type UserRow = {
  id: string;
  email: string;
  role: "superadmin" | "restaurant_admin" | "customer" | "unknown";
  name: string;
  created_at: string | null;
  last_sign_in_at: string | null;
  is_blocked: boolean;
};

type Props = {
  users: UserRow[];
  currentUserId: string;
};

type SortKey = "name" | "email" | "role" | "status" | "created_at" | "last_sign_in_at";
type SortDir = "asc" | "desc";
type RoleFilter = "all" | UserRow["role"];
type StatusFilter = "all" | "active" | "blocked";

function formatDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function roleBadgeClass(role: UserRow["role"]) {
  if (role === "superadmin") return "bg-violet-100 text-violet-700 border border-violet-200";
  if (role === "restaurant_admin") return "bg-blue-100 text-blue-700 border border-blue-200";
  if (role === "customer") return "bg-emerald-100 text-emerald-700 border border-emerald-200";
  return "bg-slate-100 text-slate-600 border border-slate-200";
}

function roleLabel(role: UserRow["role"]) {
  if (role === "superadmin") return "Super Admin";
  if (role === "restaurant_admin") return "Restaurant";
  if (role === "customer") return "Customer";
  return "Unknown";
}

const ROLE_ORDER: Record<UserRow["role"], number> = {
  superadmin: 0,
  restaurant_admin: 1,
  customer: 2,
  unknown: 3,
};

function IconActionButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  className: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition hover:brightness-95 ${className}`}
    >
      {children}
    </button>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className={`ml-1 inline-flex flex-col gap-[1px] ${active ? "opacity-100" : "opacity-30"}`}>
      <span className={`block h-0 w-0 border-x-[4px] border-b-[5px] border-x-transparent ${active && dir === "asc" ? "border-b-violet-600" : "border-b-slate-400"}`} />
      <span className={`block h-0 w-0 border-x-[4px] border-t-[5px] border-x-transparent ${active && dir === "desc" ? "border-t-violet-600" : "border-t-slate-400"}`} />
    </span>
  );
}

function ConfirmModal({
  title,
  message,
  confirmLabel,
  confirmClass,
  onConfirm,
  onCancel,
  loading,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50 ${confirmClass}`}
          >
            {loading ? "Processing…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SuperAdminUsersPanel({ users, currentUserId }: Props) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [confirmBlock, setConfirmBlock] = useState<UserRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UserRow | null>(null);
  const [passwordUser, setPasswordUser] = useState<UserRow | null>(null);
  const [isPending, startTransition] = useTransition();

  // Stats
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => !u.is_blocked).length;
    const blocked = users.filter((u) => u.is_blocked).length;
    const superAdmins = users.filter((u) => u.role === "superadmin").length;
    const restaurantAdmins = users.filter((u) => u.role === "restaurant_admin").length;
    const customers = users.filter((u) => u.role === "customer").length;
    return { total, active, blocked, superAdmins, restaurantAdmins, customers };
  }, [users]);

  const filtered = useMemo(() => {
    let result = [...users];

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      );
    }

    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }

    if (statusFilter === "active") result = result.filter((u) => !u.is_blocked);
    if (statusFilter === "blocked") result = result.filter((u) => u.is_blocked);

    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = (a.name || "").localeCompare(b.name || "");
      else if (sortKey === "email") cmp = a.email.localeCompare(b.email);
      else if (sortKey === "role") cmp = ROLE_ORDER[a.role] - ROLE_ORDER[b.role];
      else if (sortKey === "status") cmp = Number(a.is_blocked) - Number(b.is_blocked);
      else if (sortKey === "created_at") {
        cmp = new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime();
      } else if (sortKey === "last_sign_in_at") {
        cmp = new Date(a.last_sign_in_at ?? 0).getTime() - new Date(b.last_sign_in_at ?? 0).getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [users, search, roleFilter, statusFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function handleBlock(user: UserRow) {
    const fd = new FormData();
    fd.append("id", user.id);
    fd.append("is_blocked", String(user.is_blocked));
    startTransition(() => {
      togglePlatformUserBlockedAction(fd).finally(() => setConfirmBlock(null));
    });
  }

  function handleDelete(user: UserRow) {
    const fd = new FormData();
    fd.append("id", user.id);
    startTransition(() => {
      deletePlatformUserAction(fd).finally(() => setConfirmDelete(null));
    });
  }

  function handlePassword(user: UserRow, password: string, confirmPassword: string) {
    const fd = new FormData();
    fd.append("id", user.id);
    fd.append("password", password);
    fd.append("confirm_password", confirmPassword);
    startTransition(() => {
      setPlatformUserPasswordAction(fd).finally(() => setPasswordUser(null));
    });
  }

  const ROLE_FILTERS: { label: string; value: RoleFilter }[] = [
    { label: "All roles", value: "all" },
    { label: "Super Admin", value: "superadmin" },
    { label: "Restaurant", value: "restaurant_admin" },
    { label: "Customer", value: "customer" },
  ];

  const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Blocked", value: "blocked" },
  ];

  const Th = ({ label, sortable, sk }: { label: string; sortable?: boolean; sk?: SortKey }) => (
    <th
      className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500 ${sortable ? "cursor-pointer select-none hover:text-slate-700" : ""}`}
      onClick={sortable && sk ? () => toggleSort(sk) : undefined}
    >
      <span className="inline-flex items-center gap-0.5">
        {label}
        {sortable && sk && <SortIcon active={sortKey === sk} dir={sortDir} />}
      </span>
    </th>
  );

  return (
    <>
      {confirmBlock && (
        <ConfirmModal
          title={confirmBlock.is_blocked ? "Unblock user?" : "Block user?"}
          message={
            confirmBlock.is_blocked
              ? `Allow ${confirmBlock.email} to sign in again?`
              : `${confirmBlock.email} will be prevented from signing in.`
          }
          confirmLabel={confirmBlock.is_blocked ? "Unblock" : "Block"}
          confirmClass={confirmBlock.is_blocked ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-500 hover:bg-amber-600"}
          onConfirm={() => handleBlock(confirmBlock)}
          onCancel={() => setConfirmBlock(null)}
          loading={isPending}
        />
      )}
      {confirmDelete && (
        <ConfirmModal
          title="Delete user account?"
          message={`This permanently deletes ${confirmDelete.email} and all associated data. This cannot be undone.`}
          confirmLabel="Delete permanently"
          confirmClass="bg-red-600 hover:bg-red-700"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
          loading={isPending}
        />
      )}
      {passwordUser && (
        <SuperAdminSetPasswordModal
          subtitle={`${passwordUser.name || passwordUser.email} · ${passwordUser.email}`}
          onSubmit={(password, confirmPassword) => handlePassword(passwordUser, password, confirmPassword)}
          onCancel={() => setPasswordUser(null)}
          loading={isPending}
        />
      )}

      <section className="panel overflow-hidden">
        {/* Header */}
        <div className="border-b border-slate-100 p-4 md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="panel-title">Users management</h2>
              <p className="mt-0.5 text-xs text-slate-400">{stats.total} total accounts</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: "Total", value: stats.total, color: "text-slate-900" },
              { label: "Active", value: stats.active, color: "text-emerald-700" },
              { label: "Blocked", value: stats.blocked, color: "text-red-600" },
              { label: "Customers", value: stats.customers, color: "text-emerald-700" },
              { label: "Biz admins", value: stats.restaurantAdmins, color: "text-blue-700" },
              { label: "Super admins", value: stats.superAdmins, color: "text-violet-700" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{s.label}</p>
                <p className={`mt-0.5 text-lg font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Search + filters */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative flex-1">
              <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600"
                >
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {ROLE_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setRoleFilter(f.value)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    roleFilter === f.value
                      ? "border-violet-300 bg-violet-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex gap-1.5">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    statusFilter === f.value
                      ? f.value === "blocked"
                        ? "border-red-300 bg-red-500 text-white"
                        : f.value === "active"
                          ? "border-emerald-300 bg-emerald-600 text-white"
                          : "border-violet-300 bg-violet-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          {(search || roleFilter !== "all" || statusFilter !== "all") && (
            <p className="mt-2 text-xs text-slate-400">
              Showing {filtered.length} of {users.length} users
              {search && ` matching "${search}"`}
            </p>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <Th label="Name" sortable sk="name" />
                <Th label="Email" sortable sk="email" />
                <Th label="Role" sortable sk="role" />
                <Th label="Status" sortable sk="status" />
                <Th label="Created" sortable sk="created_at" />
                <Th label="Last sign in" sortable sk="last_sign_in_at" />
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">
                    {search || roleFilter !== "all" || statusFilter !== "all"
                      ? "No users match your filters."
                      : "No users found."}
                  </td>
                </tr>
              ) : (
                filtered.map((user) => {
                  const isSelf = user.id === currentUserId;
                  return (
                    <tr
                      key={user.id}
                      className={`transition hover:bg-slate-50/60 ${isSelf ? "bg-violet-50/40" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-bold text-slate-600 uppercase">
                            {(user.name || user.email)[0] ?? "?"}
                          </div>
                          <span className="font-medium text-slate-800">{user.name || <span className="italic text-slate-400">No name</span>}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold ${roleBadgeClass(user.role)}`}>
                          {roleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {user.is_blocked ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatDate(user.created_at)}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatDate(user.last_sign_in_at)}</td>
                      <td className="px-4 py-3">
                        {isSelf ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-semibold text-violet-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                            Current user
                          </span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <IconActionButton
                              label="Set password"
                              onClick={() => setPasswordUser(user)}
                              className="border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100"
                            >
                              <KeyRound className="h-4 w-4" strokeWidth={2.25} />
                            </IconActionButton>
                            <IconActionButton
                              label={user.is_blocked ? "Unblock user" : "Block user"}
                              onClick={() => setConfirmBlock(user)}
                              className={
                                user.is_blocked
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                              }
                            >
                              {user.is_blocked ? (
                                <ShieldCheck className="h-4 w-4" strokeWidth={2.25} />
                              ) : (
                                <Ban className="h-4 w-4" strokeWidth={2.25} />
                              )}
                            </IconActionButton>
                            <IconActionButton
                              label="Delete user"
                              onClick={() => setConfirmDelete(user)}
                              className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={2.25} />
                            </IconActionButton>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-2.5">
            <p className="text-xs text-slate-400">
              {filtered.length} {filtered.length === 1 ? "user" : "users"} shown
              {filtered.length < users.length && ` · ${users.length - filtered.length} hidden by filters`}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
