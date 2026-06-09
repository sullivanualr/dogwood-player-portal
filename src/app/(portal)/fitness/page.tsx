import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/auth/server";

export default async function FitnessDashboardPage() {
  await requireRole("fitness_pt");

  return (
    <DashboardShell eyebrow="Fitness/PT" title="Fitness/PT Dashboard">
      <p className="text-sm leading-6 text-dogwood-ink/75">
        Assigned students, fitness plans, movement screens, and workout shells
        will be implemented in later phases.
      </p>
    </DashboardShell>
  );
}
