import Link from "next/link";
import {
  EmptySnapshotState,
  SnapshotField,
  SnapshotSection
} from "@/components/dashboard/student-snapshot/snapshot-section";
import { StudentRecordNav } from "@/components/app-shell/student-record-nav";
import { ASSESSMENT_TYPE_OPTIONS } from "@/features/assessments/constants";
import { METRIC_CATEGORY_OPTIONS } from "@/features/metrics/constants";
import { getStudentSnapshot } from "@/features/students/snapshot";

type StudentSnapshotPageProps = {
  params: Promise<{
    studentId: string;
  }>;
};

const ASSESSMENT_TYPE_LABELS = new Map(
  ASSESSMENT_TYPE_OPTIONS.map((option) => [option.value, option.label])
);

const METRIC_CATEGORY_LABELS = new Map(
  METRIC_CATEGORY_OPTIONS.map((option) => [option.value, option.label])
);

function formatAssessmentScore(score: number | null, scoreUnit: string | null) {
  if (score === null) {
    return "Not scored yet";
  }

  return `${score}${scoreUnit ? ` ${scoreUnit}` : ""}`;
}

function formatMetricValue(value: number, unit: string | null) {
  return `${value}${unit ? ` ${unit}` : ""}`;
}

function formatDate(date: string | null) {
  if (!date) {
    return "Not set";
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatTournamentResult({
  score,
  finishPosition,
  fieldSize
}: {
  score: number | null;
  finishPosition: string | null;
  fieldSize: number | null;
}) {
  const parts = [
    score === null ? null : `Score ${score}`,
    finishPosition ? `Finish ${finishPosition}` : null,
    fieldSize === null ? null : `Field ${fieldSize}`
  ].filter(Boolean);

  return parts.length ? parts.join(" | ") : "Results have not been added yet.";
}

function statusLabel(value: string) {
  return value.replaceAll("_", " ");
}

export default async function StudentSnapshotPage({
  params
}: StudentSnapshotPageProps) {
  const { studentId } = await params;
  const snapshot = await getStudentSnapshot(studentId);
  const fullName = `${snapshot.student.firstName} ${snapshot.student.lastName}`;
  const coachName = snapshot.coach
    ? `${snapshot.coach.firstName} ${snapshot.coach.lastName}`
    : null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-6 overflow-hidden rounded-2xl bg-dogwood-green text-white shadow-[0_24px_70px_rgba(24,35,29,0.22)]">
        <div className="grid gap-6 px-5 py-6 sm:px-6 lg:grid-cols-[1fr_25rem] lg:px-7 lg:py-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/55">
              Player Snapshot
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
              {fullName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
              A focused view of current development priorities, training work,
              recent feedback, and performance signals.
            </p>
            {snapshot.canManageLessonNotes ? (
              <Link
                className="mt-5 inline-flex rounded-md bg-dogwood-cream px-4 py-2.5 text-sm font-semibold text-dogwood-green shadow-sm hover:bg-white"
                href={`/students/${snapshot.student.id}/lessons`}
              >
                Add Lesson Note
              </Link>
            ) : null}
          </div>
          <div className="grid content-start gap-3 text-sm text-white/75">
            <div className="rounded-lg bg-white/8 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
                Current coach
              </p>
              <p className="mt-1 font-medium text-white">
                {coachName ?? "No coach assigned yet"}
              </p>
            </div>
            <div className="rounded-lg bg-white/8 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
                Current program
              </p>
              <p className="mt-1 font-medium text-white">
                {snapshot.program?.name ?? "No active program yet"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-white/8 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
                  Goals
                </p>
                <p className="mt-1 text-2xl font-semibold text-white">
                  {snapshot.goals.length}
                </p>
              </div>
              <div className="rounded-lg bg-white/8 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
                  Priorities
                </p>
                <p className="mt-1 text-2xl font-semibold text-white">
                  {snapshot.developmentPriorities.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StudentRecordNav active="snapshot" studentId={snapshot.student.id} />

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <SnapshotSection title="My Profile">
          <dl className="grid gap-4 sm:grid-cols-2">
            <SnapshotField label="Email" value={snapshot.student.email} />
            <SnapshotField
              label="Junior player"
              value={
                snapshot.student.juniorPlayer === null
                  ? null
                  : snapshot.student.juniorPlayer
                    ? "Yes"
                    : "No"
              }
            />
            <SnapshotField
              label="Graduation year"
              value={snapshot.student.graduationYear}
            />
            <SnapshotField label="School" value={snapshot.student.school} />
            <SnapshotField
              label="Handedness"
              value={snapshot.student.handedness}
            />
            <SnapshotField label="Coach" value={coachName} />
          </dl>
        </SnapshotSection>

        <SnapshotSection title="My Program">
          {snapshot.program ? (
            <div>
              <p className="text-sm font-medium text-dogwood-ink">
                {snapshot.program.name}
              </p>
              <p className="mt-2 text-sm leading-6 text-dogwood-ink/65">
                {snapshot.program.description ||
                  "Your coach has not added a program description yet."}
              </p>
            </div>
          ) : (
            <EmptySnapshotState message="You do not have an active program assigned yet." />
          )}
        </SnapshotSection>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SnapshotSection title="Current Development Priorities">
          {snapshot.developmentPriorities.length ? (
            <div className="grid gap-3">
              {snapshot.developmentPriorities.map((priority) => (
                <div
                  className="rounded-md border border-dogwood-green/15 bg-dogwood-cream/50 p-4"
                  key={priority.id}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-dogwood-ink">
                      {priority.title}
                    </h3>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold uppercase text-dogwood-ink/60">
                      {priority.priority_level}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-dogwood-ink/65">
                    {priority.description ||
                      "Your coach has not added details for this priority yet."}
                  </p>
                  <p className="mt-3 text-xs font-medium text-dogwood-ink/55">
                    {priority.category || "General development"}
                  </p>
                </div>
              ))}
              <Link
                className="text-sm font-medium text-dogwood-leaf hover:text-dogwood-green"
                href={`/students/${snapshot.student.id}/priorities`}
              >
                View all priorities
              </Link>
            </div>
          ) : (
            <EmptySnapshotState message="You do not have current development priorities yet." />
          )}
        </SnapshotSection>

        <SnapshotSection title="Active Goals">
          {snapshot.goals.length ? (
            <div className="grid gap-3">
              {snapshot.goals.map((goal) => (
                <div
                  className="rounded-md border border-dogwood-green/15 bg-dogwood-cream/50 p-4"
                  key={goal.id}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-dogwood-ink">
                      {goal.title}
                    </h3>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold uppercase text-dogwood-ink/60">
                      {goal.progress_value}%
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-dogwood-ink/65">
                    {goal.description ||
                      "Your coach has not added goal details yet."}
                  </p>
                  <p className="mt-3 text-xs font-medium text-dogwood-ink/55">
                    {goal.target_date
                      ? `Target ${formatDate(goal.target_date)}`
                      : goal.category || "No target date yet"}
                  </p>
                </div>
              ))}
              <Link
                className="text-sm font-medium text-dogwood-leaf hover:text-dogwood-green"
                href={`/students/${snapshot.student.id}/goals`}
              >
                View all goals
              </Link>
            </div>
          ) : (
            <EmptySnapshotState message="You do not have active goals yet." />
          )}
        </SnapshotSection>

        <SnapshotSection title="Current Practice Plan">
          {snapshot.practicePlan ? (
            <div className="grid gap-3">
              <div className="rounded-md border border-dogwood-green/15 bg-dogwood-cream/50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-dogwood-ink">
                    {snapshot.practicePlan.title}
                  </h3>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold uppercase text-dogwood-ink/60">
                    {snapshot.practicePlan.items.length} items
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-dogwood-ink/65">
                  {snapshot.practicePlan.description ||
                    "Your coach has not added a description yet."}
                </p>
                {snapshot.practicePlan.items.length ? (
                  <ul className="mt-3 grid gap-2">
                    {snapshot.practicePlan.items.slice(0, 3).map((item) => (
                      <li
                        className="rounded-md bg-white px-3 py-2 text-sm text-dogwood-ink/75"
                        key={item.id}
                      >
                        {item.title}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-dogwood-ink/55">
                    No practice items have been added yet.
                  </p>
                )}
              </div>
              <Link
                className="text-sm font-medium text-dogwood-leaf hover:text-dogwood-green"
                href={`/students/${snapshot.student.id}/practice-plans`}
              >
                View practice plan
              </Link>
            </div>
          ) : (
            <EmptySnapshotState message="You do not have a current practice plan yet." />
          )}
        </SnapshotSection>

        <SnapshotSection title="Latest Lesson Note">
          {snapshot.lessonNote ? (
            <div className="grid gap-3">
              <div className="rounded-md border border-dogwood-green/15 bg-dogwood-cream/50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-dogwood-ink">
                    {snapshot.lessonNote.title}
                  </h3>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold uppercase text-dogwood-ink/60">
                    {formatDate(snapshot.lessonNote.lesson_date)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-dogwood-ink/65">
                  {snapshot.lessonNote.summary ||
                    "Your coach has not added a lesson summary yet."}
                </p>
                <p className="mt-3 text-xs font-medium text-dogwood-ink/55">
                  {snapshot.lessonNote.focus_area || "No focus area set yet"}
                </p>
              </div>
              <Link
                className="text-sm font-medium text-dogwood-leaf hover:text-dogwood-green"
                href={`/students/${snapshot.student.id}/lessons`}
              >
                View lesson notes
              </Link>
            </div>
          ) : (
            <EmptySnapshotState message="You do not have a visible lesson note yet." />
          )}
        </SnapshotSection>

        <SnapshotSection title="Recent Assessments">
          {snapshot.assessments.length ? (
            <div className="grid gap-3">
              {snapshot.assessments.map((assessment) => (
                <div
                  className="rounded-md border border-dogwood-green/15 bg-dogwood-cream/50 p-4"
                  key={assessment.id}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-dogwood-ink">
                      {assessment.title}
                    </h3>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold uppercase text-dogwood-ink/60">
                      {formatAssessmentScore(
                        assessment.score,
                        assessment.score_unit
                      )}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-dogwood-ink/65">
                    {assessment.summary ||
                      "There is no assessment summary yet."}
                  </p>
                  <p className="mt-3 text-xs font-medium text-dogwood-ink/55">
                    {ASSESSMENT_TYPE_LABELS.get(
                      assessment.assessment_type
                    ) ?? "Assessment"}{" "}
                    | {formatDate(assessment.assessment_date)}
                  </p>
                </div>
              ))}
              <Link
                className="text-sm font-medium text-dogwood-leaf hover:text-dogwood-green"
                href={`/students/${snapshot.student.id}/assessments`}
              >
                View assessments
              </Link>
            </div>
          ) : (
            <EmptySnapshotState message="You do not have visible assessment results yet." />
          )}
        </SnapshotSection>

        <SnapshotSection title="Recent Progress Metrics">
          {snapshot.progressMetrics.length ? (
            <div className="grid gap-3">
              {snapshot.progressMetrics.map((metric) => (
                <div
                  className="rounded-md border border-dogwood-green/15 bg-dogwood-cream/50 p-4"
                  key={metric.id}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-dogwood-ink">
                      {metric.metric_name}
                    </h3>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold uppercase text-dogwood-ink/60">
                      {formatMetricValue(metric.value, metric.unit)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-dogwood-ink/65">
                    {metric.notes || "There are no notes for this metric yet."}
                  </p>
                  <p className="mt-3 text-xs font-medium text-dogwood-ink/55">
                    {METRIC_CATEGORY_LABELS.get(metric.category) ?? "Metric"} |{" "}
                    {formatDateTime(metric.recorded_at)}
                  </p>
                </div>
              ))}
              <Link
                className="text-sm font-medium text-dogwood-leaf hover:text-dogwood-green"
                href={`/students/${snapshot.student.id}/metrics`}
              >
                View progress metrics
              </Link>
            </div>
          ) : (
            <EmptySnapshotState message="You do not have visible progress metrics yet." />
          )}
        </SnapshotSection>

        <SnapshotSection title="Upcoming Tournament">
          {snapshot.upcomingTournaments.length ? (
            <div className="grid gap-3">
              {snapshot.upcomingTournaments.slice(0, 1).map((tournament) => (
                <div
                  className="rounded-md border border-dogwood-green/15 bg-dogwood-cream/50 p-4"
                  key={tournament.id}
                >
                  <h3 className="text-sm font-semibold text-dogwood-ink">
                    {tournament.event_name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-dogwood-ink/65">
                    {tournament.preparation_notes ||
                      tournament.course_name ||
                      "No tournament notes have been added yet."}
                  </p>
                  <p className="mt-3 text-xs font-medium text-dogwood-ink/55">
                    {formatDate(tournament.start_date)}
                    {tournament.location ? ` | ${tournament.location}` : ""}
                  </p>
                </div>
              ))}
              <Link
                className="text-sm font-medium text-dogwood-leaf hover:text-dogwood-green"
                href={`/students/${snapshot.student.id}/tournaments`}
              >
                View tournaments
              </Link>
            </div>
          ) : (
            <EmptySnapshotState message="You do not have an upcoming tournament yet." />
          )}
        </SnapshotSection>

        <SnapshotSection title="Recent Tournament Results">
          {snapshot.recentTournamentResults.length ? (
            <div className="grid gap-3">
              {snapshot.recentTournamentResults.map((tournament) => (
                <div
                  className="rounded-md border border-dogwood-green/15 bg-dogwood-cream/50 p-4"
                  key={tournament.id}
                >
                  <h3 className="text-sm font-semibold text-dogwood-ink">
                    {tournament.event_name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-dogwood-ink/65">
                    {formatTournamentResult({
                      fieldSize: tournament.field_size,
                      finishPosition: tournament.finish_position,
                      score: tournament.score
                    })}
                  </p>
                  <p className="mt-3 text-xs font-medium text-dogwood-ink/55">
                    {formatDate(tournament.start_date)}
                    {tournament.course_name ? ` | ${tournament.course_name}` : ""}
                  </p>
                </div>
              ))}
              <Link
                className="text-sm font-medium text-dogwood-leaf hover:text-dogwood-green"
                href={`/students/${snapshot.student.id}/tournaments`}
              >
                View tournament results
              </Link>
            </div>
          ) : (
            <EmptySnapshotState message="You do not have recent tournament results yet." />
          )}
        </SnapshotSection>

        <SnapshotSection title="Latest Uploaded Video">
          {snapshot.latestVideo ? (
            <div className="grid gap-3">
              <div className="rounded-md border border-dogwood-green/15 bg-dogwood-cream/50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-dogwood-ink">
                    {snapshot.latestVideo.title}
                  </h3>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold uppercase text-dogwood-ink/60">
                    {snapshot.latestVideo.category}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-dogwood-ink/65">
                  {snapshot.latestVideo.description ||
                    snapshot.latestVideo.file_name}
                </p>
                <p className="mt-3 text-xs font-medium text-dogwood-ink/55">
                  {snapshot.latestVideo.mime_type}
                  {snapshot.latestVideo.duration_seconds === null
                    ? ""
                    : ` | ${snapshot.latestVideo.duration_seconds}s`}
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link
                  className="text-sm font-medium text-dogwood-leaf hover:text-dogwood-green"
                  href={`/api/storage/signed-url?type=video&id=${snapshot.latestVideo.id}`}
                >
                  View video
                </Link>
                <Link
                  className="text-sm font-medium text-dogwood-leaf hover:text-dogwood-green"
                  href={`/students/${snapshot.student.id}/files`}
                >
                  View files
                </Link>
              </div>
            </div>
          ) : (
            <EmptySnapshotState message="You do not have an uploaded video yet." />
          )}
        </SnapshotSection>

        <SnapshotSection title="Workout Status">
          {snapshot.workoutAssignments.length ? (
            <div className="grid gap-3">
              {snapshot.workoutAssignments.map((workout) => (
                <div
                  className="rounded-md border border-dogwood-green/15 bg-dogwood-cream/50 p-4"
                  key={workout.id}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-dogwood-ink">
                      {workout.title}
                    </h3>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold uppercase text-dogwood-ink/60">
                      {statusLabel(workout.completion_state)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-dogwood-ink/65">
                    {workout.frequency ||
                      workout.description ||
                      "No workout frequency has been set yet."}
                  </p>
                  <p className="mt-3 text-xs font-medium text-dogwood-ink/55">
                    Due {formatDate(workout.due_date)}
                  </p>
                </div>
              ))}
              <Link
                className="text-sm font-medium text-dogwood-leaf hover:text-dogwood-green"
                href={`/students/${snapshot.student.id}/fitness`}
              >
                View fitness and update workout status
              </Link>
            </div>
          ) : (
            <EmptySnapshotState message="You do not have workout assignments yet." />
          )}
        </SnapshotSection>
      </div>
    </section>
  );
}
