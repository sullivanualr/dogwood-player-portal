import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/auth/server";
import Link from "next/link";

export default async function AdminDashboardPage() {
  await requireRole("admin");

  return (
    <DashboardShell eyebrow="Admin" title="Admin Dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            href: "/admin/users",
            title: "Users",
            description: "Create profiles and assign roles."
          },
          {
            href: "/admin/programs",
            title: "Programs",
            description: "Create, edit, and archive programs."
          },
          {
            href: "/admin/assignments",
            title: "Assignments",
            description: "Assign coaches, parents, Fitness/PT, and programs."
          }
        ].map((item) => (
          <Link
            className="rounded-lg border border-dogwood-green/15 bg-white p-5 shadow-sm hover:border-dogwood-leaf"
            href={item.href}
            key={item.href}
          >
            <h2 className="text-base font-semibold text-dogwood-ink">
              {item.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-dogwood-ink/65">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
