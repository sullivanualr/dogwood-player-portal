import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { PrimaryButtonLink, SecondaryButtonLink } from "@/components/ui/buttons";
import { SectionCard } from "@/components/ui/section-card";
import { SetupChecklist } from "@/components/ui/setup-checklist";
import { StatCard } from "@/components/ui/stat-card";
import { getAdminDashboardData } from "@/features/admin/queries";
import { requireRole } from "@/lib/auth/server";

const ADMIN_LINKS = [
  {
    href: "/admin/students",
    title: "Open player roster",
    description: "View player profiles and development workflows.",
    primary: true
  },
  {
    href: "/coach",
    title: "Review coach dashboard",
    description: "Scan assigned players and coaching action links.",
    primary: false
  },
  {
    href: "/admin/programs",
    title: "Manage programs",
    description: "Create and maintain development program options.",
    primary: false
  },
  {
    href: "/admin/assignments",
    title: "Manage assignments",
    description: "Connect players with coaches, parents, PT, and programs.",
    primary: false
  },
  {
    href: "/admin/users",
    title: "Manage users",
    description: "Create profiles and assign portal roles.",
    primary: false
  }
];

export default async function AdminDashboardPage() {
  await requireRole("admin");
  const data = await getAdminDashboardData();
  const checklistItems = [
    {
      label: "Create programs",
      complete: data.setup.hasPrograms,
      href: "/admin/programs"
    },
    {
      label: "Add coaches",
      complete: data.setup.hasCoaches,
      href: "/admin/users"
    },
    {
      label: "Add players",
      complete: data.setup.hasPlayers,
      href: "/admin/users"
    },
    {
      label: "Assign coach",
      complete: data.setup.hasCoachAssignments,
      href: "/admin/assignments"
    },
    {
      label: "Assign program",
      complete: data.setup.hasProgramAssignments,
      href: "/admin/assignments"
    },
    {
      label: "Add first priority",
      complete: data.setup.hasPriorities,
      href: "/admin/students"
    },
    {
      label: "Add first practice plan",
      complete: data.setup.hasPracticePlans,
      href: "/admin/students"
    }
  ];

  return (
    <DashboardShell
      description="A focused operating view for setting up players, assigning support teams, and keeping the development system moving."
      eyebrow="Admin"
      title="Dashboard"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          detail="Active student profiles in the player roster."
          label="Active Players"
          value={data.activePlayers}
        />
        <StatCard
          detail="Profiles with the coach role assigned."
          label="Coaches"
          value={data.coaches}
        />
        <StatCard
          detail="Players who need an active coach assignment."
          label="Players Missing Coach"
          tone={data.playersMissingCoach ? "attention" : "default"}
          value={data.playersMissingCoach}
        />
        <StatCard
          detail="Players who need an active program enrollment."
          label="Players Missing Program"
          tone={data.playersMissingProgram ? "attention" : "default"}
          value={data.playersMissingProgram}
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <SectionCard
          description="Start from the roster, then move into the player profile or the right setup area."
          title="Operating Shortcuts"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {ADMIN_LINKS.map((item) => (
              <div
                className="rounded-lg border border-dogwood-green/10 bg-dogwood-linen/70 p-4"
                key={item.href}
              >
                <h2 className="text-base font-semibold text-dogwood-ink">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-dogwood-ink/62">
                  {item.description}
                </p>
                <div className="mt-4">
                  {item.primary ? (
                    <PrimaryButtonLink href={item.href}>Open</PrimaryButtonLink>
                  ) : (
                    <SecondaryButtonLink href={item.href}>Open</SecondaryButtonLink>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          description="Complete the foundation for a useful first player profile."
          title="Setup Checklist"
        >
          <SetupChecklist items={checklistItems} />
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title="Recent Activity">
          <EmptyState
            message="Activity will appear here once player records are created and updated. For now, use the roster and setup links to prepare the first profiles."
            title="No recent activity yet"
          />
        </SectionCard>
      </div>
    </DashboardShell>
  );
}
