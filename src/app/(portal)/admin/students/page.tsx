import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { PrimaryButtonLink, SecondaryButtonLink } from "@/components/ui/buttons";
import { SectionCard } from "@/components/ui/section-card";
import {
  getAdminStudentsData,
  type AdminStudentRow
} from "@/features/admin/queries";

const STUDENT_ACTIONS = [
  { label: "Open Player Profile", segment: "snapshot", primary: true },
  { label: "Add Lesson Note", segment: "lessons", primary: false },
  { label: "Practice Plan", segment: "practice-plans", primary: false },
  { label: "Goals", segment: "goals", primary: false },
  { label: "Priorities", segment: "priorities", primary: false }
];

function EmptyValue({ children = "Not assigned" }: { children?: string }) {
  return <span className="text-dogwood-ink/45">{children}</span>;
}

function StudentCard({ student }: { student: AdminStudentRow }) {
  return (
    <article className="rounded-lg border border-dogwood-green/10 bg-white/92 p-4 shadow-[0_12px_34px_rgba(24,35,29,0.05)]">
      <div className="grid gap-4 xl:grid-cols-[minmax(220px,1fr)_minmax(260px,0.9fr)_minmax(360px,auto)] xl:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold leading-tight text-dogwood-ink">
              {student.name}
            </h2>
            {student.juniorPlayer ? (
              <span className="rounded-full bg-dogwood-cream px-2 py-0.5 text-xs font-semibold uppercase text-dogwood-green">
                Junior
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-dogwood-ink/60">{student.email}</p>
        </div>

        <div className="grid gap-2 text-sm text-dogwood-ink/75 sm:grid-cols-2 xl:grid-cols-1">
          <p>
            <span className="text-xs font-semibold uppercase tracking-wide text-dogwood-ink/45">
              Coach
            </span>{" "}
            {student.assignedCoach ? (
              <span className="block font-medium text-dogwood-ink">
                {student.assignedCoach}
              </span>
            ) : (
              <span className="block">
                <EmptyValue />
              </span>
            )}
          </p>
          <p>
            <span className="text-xs font-semibold uppercase tracking-wide text-dogwood-ink/45">
              Program
            </span>{" "}
            {student.currentProgram ? (
              <span className="block font-medium text-dogwood-ink">
                {student.currentProgram}
              </span>
            ) : (
              <span className="block">
                <EmptyValue />
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 xl:justify-end">
          {STUDENT_ACTIONS.map((action) => (
            action.primary ? (
              <PrimaryButtonLink
                href={`/students/${student.id}/${action.segment}`}
                key={action.segment}
              >
                {action.label}
              </PrimaryButtonLink>
            ) : (
              <SecondaryButtonLink
                href={`/students/${student.id}/${action.segment}`}
                key={action.segment}
              >
                {action.label}
              </SecondaryButtonLink>
            )
          ))}
        </div>
      </div>
    </article>
  );
}

export default async function AdminStudentsPage() {
  const { students } = await getAdminStudentsData();

  return (
    <DashboardShell
      actions={
        <SecondaryButtonLink href="/admin/assignments">
          Manage assignments
        </SecondaryButtonLink>
      }
      description="The roster is the home base for opening player profiles, adding coaching notes, and moving into active development work."
      eyebrow="Admin"
      title="Players"
    >
      <SectionCard className="mb-5" title="Roster Filters">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_12rem]">
          <div className="rounded-md border border-dogwood-green/10 bg-dogwood-linen px-3 py-2.5 text-sm text-dogwood-ink/45">
            Search players by name or email
          </div>
          <div className="rounded-md border border-dogwood-green/10 bg-dogwood-linen px-3 py-2.5 text-sm text-dogwood-ink/45">
            Coach
          </div>
          <div className="rounded-md border border-dogwood-green/10 bg-dogwood-linen px-3 py-2.5 text-sm text-dogwood-ink/45">
            Program
          </div>
        </div>
      </SectionCard>

      {students.length ? (
        <div className="grid gap-3">
          {students.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      ) : (
        <EmptyState
          action={
            <SecondaryButtonLink href="/admin/users">
              Create first player profile
            </SecondaryButtonLink>
          }
          message="Create a student profile, then return here to open the player profile and begin development setup."
          title="No active players yet"
        />
      )}
    </DashboardShell>
  );
}
