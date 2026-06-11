import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/auth/server";
import Link from "next/link";

const ADMIN_LINKS = [
  {
    href: "/admin/students",
    title: "Students",
    description: "Open player profiles and development workflows."
  },
  {
    href: "/coach",
    title: "Coach Dashboard",
    description: "Review the coaching roster and player action links."
  },
  {
    href: "/admin/programs",
    title: "Programs",
    description: "Manage active player development programs."
  },
  {
    href: "/admin/assignments",
    title: "Assignments",
    description: "Connect students with coaches, parents, PT, and programs."
  },
  {
    href: "/admin/users",
    title: "Users",
    description: "Create profiles and assign roles."
  }
];

export default async function AdminDashboardPage() {
  await requireRole("admin");

  return (
    <DashboardShell eyebrow="Admin" title="Admin Dashboard">
      <div className="max-w-3xl">
        <p className="text-sm leading-6 text-dogwood-ink/70">
          Use the sidebar for daily navigation. These shortcuts are here for
          setup tasks and roster review.
        </p>
      </div>
      <div className="mt-6 divide-y divide-dogwood-green/10 rounded-lg border border-dogwood-green/10 bg-white">
        {ADMIN_LINKS.map((item) => (
          <Link
            className="grid gap-2 px-4 py-4 hover:bg-dogwood-cream/40 sm:grid-cols-[12rem_1fr] sm:items-center sm:px-5"
            href={item.href}
            key={item.href}
          >
            <h2 className="text-base font-semibold text-dogwood-ink">
              {item.title}
            </h2>
            <p className="text-sm leading-6 text-dogwood-ink/65">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
