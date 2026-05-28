import {
  deletePlatformUserAction,
  togglePlatformUserBlockedAction,
} from "@/app-actions/superadmin";

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

function formatDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function roleBadge(role: UserRow["role"]) {
  if (role === "superadmin") return "bg-violet-100 text-violet-700";
  if (role === "restaurant_admin") return "bg-blue-100 text-blue-700";
  if (role === "customer") return "bg-emerald-100 text-emerald-700";
  return "bg-slate-100 text-slate-600";
}

function roleLabel(role: UserRow["role"]) {
  if (role === "superadmin") return "Super Admin";
  if (role === "restaurant_admin") return "Restaurant Admin";
  if (role === "customer") return "Customer";
  return "Unknown";
}

export function SuperAdminUsersPanel({ users, currentUserId }: Props) {
  return (
    <section className="panel p-4 md:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="panel-title">Users management</h2>
        <p className="text-xs text-slate-500">{users.length} total users</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="min-w-[980px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2.5">Name</th>
              <th className="px-3 py-2.5">Email</th>
              <th className="px-3 py-2.5">Role</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Created</th>
              <th className="px-3 py-2.5">Last sign in</th>
              <th className="px-3 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              return (
                <tr key={user.id}>
                  <td className="px-3 py-3 font-medium text-slate-800">{user.name || "—"}</td>
                  <td className="px-3 py-3 text-slate-600">{user.email}</td>
                  <td className="px-3 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${roleBadge(user.role)}`}>
                      {roleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {user.is_blocked ? (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">
                        Blocked
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-slate-500">{formatDate(user.created_at)}</td>
                  <td className="px-3 py-3 text-slate-500">{formatDate(user.last_sign_in_at)}</td>
                  <td className="px-3 py-3">
                    {isSelf ? (
                      <span className="text-xs text-slate-400">Current user</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <form action={togglePlatformUserBlockedAction}>
                          <input type="hidden" name="id" value={user.id} />
                          <input type="hidden" name="is_blocked" value={String(user.is_blocked)} />
                          <button
                            type="submit"
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                              user.is_blocked
                                ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                            }`}
                          >
                            {user.is_blocked ? "Unblock" : "Block"}
                          </button>
                        </form>

                        <form action={deletePlatformUserAction}>
                          <input type="hidden" name="id" value={user.id} />
                          <button
                            type="submit"
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

