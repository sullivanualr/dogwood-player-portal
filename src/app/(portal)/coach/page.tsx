import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { PrimaryButtonLink, SecondaryButtonLink } from "@/components/ui/buttons";
import { SectionCard } from "@/components/ui/section-card";
import {
  getAssessmentTypeLabel,
  getCoachDashboardData,
  type CoachDashboardStudent
} from "@/features/coach/dashboard";

const QUICK_ACTIONS = [
  { label: "Priorities", path: "priorities" },
  { label: "Goals", path: "goals" },
  { label: "Practice Plans", path: "practice-plans" },
  { label: "Lessons", path: "lessons" },
  { label: "Assessments", path: "assessments" },
  { label: "Metrics", path: "metrics" },
  { label: "Tournaments", path: "tournaments" },
  { label: "Files", path: "files" },
  { label: "Fitness", path: "fitness" }
];

function formatDate(value: string | null) {
  if (!value) {
    return "None";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

function EmptyValue({ children = "None" }: { children?: string }) {
  return <span className="text-dogwood-ink/45">{children}</span>;
}

function StudentSummary({ student }: { student: CoachDashboardStudent }) {
  const latestLessonDate = student.latestLessonNote?.lesson_date ?? null;
  const upcomingTournament = student.upcomingTournament;
  const recentAssessment = student.recentAssessment;

  return (
    <article className="rounded-lg border border-dogwood-green/10 bg-white/92 p-5 shadow-[0_12px_34px_rgba(24,35,29,0.05)]">
      <div className="grid gap-5 xl:grid-cols-[minmax(200px,0.8fr)_minmax(0,1.3fr)_minmax(260px,1fr)]">
        <div>
          <Link
            className="text-xl font-semibold leading-tight text-dogwood-ink hover:text-dogwood-leaf"
            href={`/students/${student.id}/snapshot`}
          >
            {student.name}
          </Link>
          <p className="mt-1 text-sm text-dogwood-ink/60">{student.email}</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-dogwood-ink/45">
            Program
          </p>
          <p className="mt-1 text-sm text-dogwood-ink/75">
            {student.program ? (
              <span className="font-medium text-dogwood-ink">
                {student.program.name}
              </span>
            ) : (
              <EmptyValue />
            )}
          </p>
          <PrimaryButtonLink
            className="mt-4"
            href={`/students/${student.id}/snapshot`}
          >
            Open Player Profile
          </PrimaryButtonLink>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-dogwood-ink/50">
              Current priorities
            </h2>
            {student.developmentPriorities.length ? (
              <ul className="mt-2 grid gap-1.5 text-sm text-dogwood-ink/75">
                {student.developmentPriorities.map((priority) => (
                  <li key={priority.id}>
                    {priority.title}
                    <span className="ml-2 text-xs uppercase text-dogwood-ink/45">
                      {priority.priority_level}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm">
                <EmptyValue />
              </p>
            )}
          </div>

          <div className="grid gap-3 text-sm text-dogwood-ink/75">
            <p>
              Latest lesson:{" "}
              <span className="font-medium text-dogwood-ink">
                {formatDate(latestLessonDate)}
              </span>
            </p>
            <p>
              Practice plan:{" "}
              {student.currentPracticePlan ? (
                <span className="font-medium text-dogwood-ink">
                  {student.currentPracticePlan.title}
                </span>
              ) : (
                <EmptyValue />
              )}
            </p>
            <p>
              Active goals:{" "}
              <span className="font-medium text-dogwood-ink">
                {student.activeGoalsCount}
              </span>
            </p>
          </div>
        </div>

        <div className="grid gap-3 text-sm text-dogwood-ink/75">
          <p>
            Upcoming tournament:{" "}
            {upcomingTournament ? (
              <span className="font-medium text-dogwood-ink">
                {upcomingTournament.event_name} on{" "}
                {formatDate(upcomingTournament.start_date)}
              </span>
            ) : (
              <EmptyValue />
            )}
          </p>
          <p>
            Recent assessment:{" "}
            {recentAssessment ? (
              <span className="font-medium text-dogwood-ink">
                {recentAssessment.title} (
                {getAssessmentTypeLabel(recentAssessment.assessment_type)})
              </span>
            ) : (
              <EmptyValue />
            )}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {QUICK_ACTIONS.map((action) => (
              <SecondaryButtonLink
                className="px-2.5 py-1.5 text-xs"
                href={`/students/${student.id}/${action.path}`}
                key={action.path}
              >
                {action.label}
              </SecondaryButtonLink>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export default async function CoachDashboardPage() {
  const { students, canViewAsAdmin } = await getCoachDashboardData();

  return (
    <DashboardShell
      description={
        canViewAsAdmin
          ? "Admin roster view for coaching workflows, player profiles, and active development signals."
          : "Assigned players, current development signals, and quick access to coaching workflows."
      }
      eyebrow="Coach"
      title="Coach Dashboard"
    >
      <SectionCard
        actions={
          <p className="text-sm font-medium text-dogwood-ink/60">
            {students.length} {students.length === 1 ? "player" : "players"}
          </p>
        }
        title="Player Queue"
      >
        {students.length ? (
          <div className="grid gap-3">
            {students.map((student) => (
              <StudentSummary key={student.id} student={student} />
            ))}
          </div>
        ) : (
          <EmptyState
            message="Once players are assigned to this coach, their profile links and development context will appear here."
            title="No assigned players yet"
          />
        )}
      </SectionCard>
    </DashboardShell>
  );
}
