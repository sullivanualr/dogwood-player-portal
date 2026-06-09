import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  getAssessmentTypeLabel,
  getCoachDashboardData,
  type CoachDashboardStudent
} from "@/features/coach/dashboard";

const QUICK_ACTIONS = [
  { label: "Snapshot", path: "snapshot" },
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
    <article className="border-t border-dogwood-green/10 py-6 first:border-t-0 first:pt-0 last:pb-0">
      <div className="grid gap-5 xl:grid-cols-[minmax(180px,0.9fr)_minmax(0,1.5fr)_minmax(220px,1fr)]">
        <div>
          <Link
            className="text-lg font-semibold text-dogwood-ink hover:text-dogwood-leaf"
            href={`/students/${student.id}/snapshot`}
          >
            {student.name}
          </Link>
          <p className="mt-1 text-sm text-dogwood-ink/60">{student.email}</p>
          <p className="mt-3 text-sm text-dogwood-ink/75">
            Program:{" "}
            {student.program ? (
              <span className="font-medium text-dogwood-ink">
                {student.program.name}
              </span>
            ) : (
              <EmptyValue />
            )}
          </p>
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
              <Link
                className="rounded-md border border-dogwood-green/15 px-2.5 py-1.5 text-xs font-medium text-dogwood-ink hover:border-dogwood-leaf hover:text-dogwood-green"
                href={`/students/${student.id}/${action.path}`}
                key={action.path}
              >
                {action.label}
              </Link>
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
    <DashboardShell eyebrow="Coach" title="Coach Dashboard">
      <div className="mb-6 flex flex-col gap-2 border-b border-dogwood-green/10 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm leading-6 text-dogwood-ink/70">
            {canViewAsAdmin
              ? "Admin roster view for student development records."
              : "Assigned students and coaching workflow shortcuts."}
          </p>
        </div>
        <p className="text-sm font-medium text-dogwood-ink/60">
          {students.length} {students.length === 1 ? "student" : "students"}
        </p>
      </div>

      {students.length ? (
        <div>
          {students.map((student) => (
            <StudentSummary key={student.id} student={student} />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-dogwood-green/20 bg-dogwood-cream/40 px-5 py-8 text-sm leading-6 text-dogwood-ink/65">
          No assigned students are available yet.
        </div>
      )}
    </DashboardShell>
  );
}
