import Link from "next/link";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  getParentAssessmentTypeLabel,
  getParentDashboardData,
  type ParentDashboardStudent
} from "@/features/parent/dashboard";

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

function DetailRow({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <p>
      <span className="text-dogwood-ink/55">{label}: </span>
      {children}
    </p>
  );
}

function WorkoutStatus({ student }: { student: ParentDashboardStudent }) {
  const { total, byState } = student.workoutStatus;

  if (!total) {
    return <EmptyValue>No visible workouts</EmptyValue>;
  }

  return (
    <span className="font-medium text-dogwood-ink">
      {byState.completed} completed, {byState.in_progress} in progress,{" "}
      {byState.not_started} not started
    </span>
  );
}

function LinkedPlayerCard({ student }: { student: ParentDashboardStudent }) {
  const lessonNote = student.latestLessonNote;
  const assessment = student.recentAssessment;
  const tournament = student.upcomingTournament;

  return (
    <article className="rounded-lg border border-dogwood-green/15 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-dogwood-green/10 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <Link
            className="text-xl font-semibold text-dogwood-ink hover:text-dogwood-leaf"
            href={`/students/${student.id}/snapshot`}
          >
            {student.name}
          </Link>
          <p className="mt-1 text-sm text-dogwood-ink/60">{student.email}</p>
        </div>
        <Link
          className="rounded-md bg-dogwood-green px-3 py-2 text-sm font-medium text-white"
          href={`/students/${student.id}/snapshot`}
        >
          Student Snapshot
        </Link>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-dogwood-ink/50">
            Development
          </h2>
          <div className="mt-3 grid gap-2 text-sm text-dogwood-ink/75">
            <DetailRow label="Program">
              {student.program ? (
                <span className="font-medium text-dogwood-ink">
                  {student.program.name}
                </span>
              ) : (
                <EmptyValue />
              )}
            </DetailRow>
            <DetailRow label="Active goals">
              {student.activeGoalsCount ? (
                <span className="font-medium text-dogwood-ink">
                  {student.activeGoalsCount}
                </span>
              ) : (
                <EmptyValue>No active goals</EmptyValue>
              )}
            </DetailRow>
            <DetailRow label="Practice plan">
              {student.currentPracticePlan ? (
                <span className="font-medium text-dogwood-ink">
                  {student.currentPracticePlan.title}
                </span>
              ) : (
                <EmptyValue>No current practice plan</EmptyValue>
              )}
            </DetailRow>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-dogwood-ink/50">
            Priorities
          </h2>
          {student.developmentPriorities.length ? (
            <ul className="mt-3 grid gap-1.5 text-sm text-dogwood-ink/75">
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
            <p className="mt-3 text-sm text-dogwood-ink/75">
              <EmptyValue>No current priorities</EmptyValue>
            </p>
          )}
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-dogwood-ink/50">
            Recent Updates
          </h2>
          <div className="mt-3 grid gap-2 text-sm text-dogwood-ink/75">
            <DetailRow label="Lesson note">
              {lessonNote ? (
                <span className="font-medium text-dogwood-ink">
                  {lessonNote.title} on {formatDate(lessonNote.lesson_date)}
                </span>
              ) : (
                <EmptyValue>No visible lesson notes</EmptyValue>
              )}
            </DetailRow>
            <DetailRow label="Assessment">
              {assessment ? (
                <span className="font-medium text-dogwood-ink">
                  {assessment.title} (
                  {getParentAssessmentTypeLabel(assessment.assessment_type)})
                </span>
              ) : (
                <EmptyValue>No visible assessments</EmptyValue>
              )}
            </DetailRow>
            <DetailRow label="Tournament">
              {tournament ? (
                <span className="font-medium text-dogwood-ink">
                  {tournament.event_name} on{" "}
                  {formatDate(tournament.start_date)}
                </span>
              ) : (
                <EmptyValue>No upcoming tournaments</EmptyValue>
              )}
            </DetailRow>
            <DetailRow label="Workout status">
              <WorkoutStatus student={student} />
            </DetailRow>
          </div>
        </section>
      </div>
    </article>
  );
}

export default async function ParentDashboardPage() {
  const { students } = await getParentDashboardData();

  return (
    <DashboardShell eyebrow="Parent" title="Parent Dashboard">
      <div className="mb-6 flex flex-col gap-2 border-b border-dogwood-green/10 pb-5 md:flex-row md:items-end md:justify-between">
        <p className="text-sm leading-6 text-dogwood-ink/70">
          Linked junior players and parent-visible development updates.
        </p>
        <p className="text-sm font-medium text-dogwood-ink/60">
          {students.length} {students.length === 1 ? "player" : "players"}
        </p>
      </div>

      {students.length ? (
        <div className="grid gap-4">
          {students.map((student) => (
            <LinkedPlayerCard key={student.id} student={student} />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-dogwood-green/20 bg-dogwood-cream/40 px-5 py-8 text-sm leading-6 text-dogwood-ink/65">
          No linked players are available yet.
        </div>
      )}
    </DashboardShell>
  );
}
