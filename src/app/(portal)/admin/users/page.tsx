import Link from "next/link";
import { AssignRoleForm, CreateUserForm } from "@/features/admin/forms";
import { getAdminUsersData } from "@/features/admin/queries";

function formatRoles(roles: string[]) {
  return roles.length ? roles.map((role) => role.replace("_", "/")).join(", ") : "None";
}

export default async function AdminUsersPage() {
  const { profiles } = await getAdminUsersData();
  const userOptions = profiles.map((profile) => ({
    id: profile.id,
    label: `${profile.first_name} ${profile.last_name} (${profile.email})`
  }));

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-dogwood-leaf">
            Admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-dogwood-ink">
            Users
          </h1>
          <p className="mt-2 text-sm leading-6 text-dogwood-ink/65">
            Create test users, profile records, and role assignments.
          </p>
        </div>
        <Link
          className="text-sm font-medium text-dogwood-leaf hover:text-dogwood-green"
          href="/admin"
        >
          Back to admin
        </Link>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <details className="rounded-lg border border-dogwood-green/15 bg-white p-5 shadow-sm">
          <summary className="cursor-pointer text-base font-semibold text-dogwood-ink">
            Create user
          </summary>
          <div className="mt-5">
            <CreateUserForm />
          </div>
        </details>
        <details className="rounded-lg border border-dogwood-green/15 bg-white p-5 shadow-sm">
          <summary className="cursor-pointer text-base font-semibold text-dogwood-ink">
            Assign role
          </summary>
          <div className="mt-5">
            <AssignRoleForm users={userOptions} />
          </div>
        </details>
      </div>

      <div className="overflow-hidden rounded-lg border border-dogwood-green/15 bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-dogwood-cream text-dogwood-ink">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Roles</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr className="border-t border-dogwood-green/10" key={profile.id}>
                <td className="px-4 py-3 text-dogwood-ink">
                  {profile.first_name} {profile.last_name}
                </td>
                <td className="px-4 py-3 text-dogwood-ink/70">
                  {profile.email}
                </td>
                <td className="px-4 py-3 text-dogwood-ink/70">
                  {formatRoles(profile.roles)}
                </td>
                <td className="px-4 py-3 text-dogwood-ink/70">
                  {profile.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
