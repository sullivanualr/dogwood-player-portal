import Link from "next/link";
import {
  archiveFitnessPlan,
  archiveWorkoutAssignment
} from "@/features/fitness/actions";
import {
  FitnessPlanForm,
  WorkoutAssignmentForm,
  WorkoutCompletionForm
} from "@/features/fitness/fitness-forms";
import {
  getFitnessPageData,
  type FitnessPlan,
  type WorkoutAssignment
} from "@/features/fitness/queries";

type FitnessPageProps = {
  params: Promise<{
    studentId: string;
  }>;
};

export const dynamic = "force-dynamic";

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

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not completed";
  }

  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function formatLabel(value: string) {
  return value
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function FitnessPlanCard({
  fitnessPlan,
  studentId,
  canManage
}: {
  fitnessPlan: FitnessPlan;
  studentId: string;
  canManage: boolean;
}) {
  return (
    <article className="rounded-lg border border-dogwood-green/15 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-dogwood-ink">
              {fitnessPlan.title}
            </h2>
            <span className="rounded-full bg-dogwood-green/10 px-2.5 py-1 text-xs font-semibold uppercase text-dogwood-ink/65">
              {formatLabel(fitnessPlan.status)}
            </span>
            <span className="rounded-full bg-dogwood-cream px-2.5 py-1 text-xs font-semibold uppercase text-dogwood-ink/65">
              {formatLabel(fitnessPlan.visibility)}
            </span>
          </div>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-dogwood-ink/70">
            {fitnessPlan.description || "No description provided."}
          </p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-dogwood-ink/55">Assigned</dt>
              <dd className="mt-1 text-dogwood-ink">
                {formatDate(fitnessPlan.assigned_date)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-dogwood-ink/55">Due</dt>
              <dd className="mt-1 text-dogwood-ink">
                {formatDate(fitnessPlan.due_date)}
              </dd>
            </div>
          </dl>
        </div>

        {canManage && fitnessPlan.status !== "archived" ? (
          <form action={archiveFitnessPlan}>
            <input name="studentId" type="hidden" value={studentId} />
            <input
              name="fitnessPlanId"
              type="hidden"
              value={fitnessPlan.id}
            />
            <button
              className="rounded-md border border-dogwood-green/20 px-3 py-2 text-sm font-medium text-dogwood-ink"
              type="submit"
            >
              Archive
            </button>
          </form>
        ) : null}
      </div>

      {canManage ? (
        <details className="mt-5 rounded-md border border-dogwood-green/15 bg-dogwood-cream/50 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-dogwood-ink">
            Edit fitness plan
          </summary>
          <div className="mt-4">
            <FitnessPlanForm
              fitnessPlan={fitnessPlan}
              studentId={studentId}
            />
          </div>
        </details>
      ) : null}
    </article>
  );
}

function WorkoutAssignmentCard({
  workoutAssignment,
  studentId,
  canManage,
  canUpdateOwnCompletion
}: {
  workoutAssignment: WorkoutAssignment;
  studentId: string;
  canManage: boolean;
  canUpdateOwnCompletion: boolean;
}) {
  const canShowCompletionForm =
    canUpdateOwnCompletion && workoutAssignment.status !== "archived";

  return (
    <article className="rounded-lg border border-dogwood-green/15 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-dogwood-ink">
              {workoutAssignment.title}
            </h2>
            <span className="rounded-full bg-dogwood-green/10 px-2.5 py-1 text-xs font-semibold uppercase text-dogwood-ink/65">
              {formatLabel(workoutAssignment.status)}
            </span>
            <span className="rounded-full bg-dogwood-cream px-2.5 py-1 text-xs font-semibold uppercase text-dogwood-ink/65">
              {formatLabel(workoutAssignment.completion_state)}
            </span>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold uppercase text-dogwood-ink/65">
              {formatLabel(workoutAssignment.visibility)}
            </span>
          </div>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-dogwood-ink/70">
            {workoutAssignment.description || "No description provided."}
          </p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="font-medium text-dogwood-ink/55">Assigned</dt>
              <dd className="mt-1 text-dogwood-ink">
                {formatDate(workoutAssignment.assigned_date)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-dogwood-ink/55">Due</dt>
              <dd className="mt-1 text-dogwood-ink">
                {formatDate(workoutAssignment.due_date)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-dogwood-ink/55">Frequency</dt>
              <dd className="mt-1 text-dogwood-ink">
                {workoutAssignment.frequency || "Not set"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-dogwood-ink/55">Completed</dt>
              <dd className="mt-1 text-dogwood-ink">
                {formatDateTime(workoutAssignment.completed_at)}
              </dd>
            </div>
          </dl>
          <p className="mt-4 whitespace-pre-line text-sm leading-6 text-dogwood-ink/70">
            {workoutAssignment.exercise_details || "No exercise details set."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canShowCompletionForm ? (
            <WorkoutCompletionForm
              studentId={studentId}
              workoutAssignment={workoutAssignment}
            />
          ) : null}
          {canManage && workoutAssignment.status !== "archived" ? (
            <form action={archiveWorkoutAssignment}>
              <input name="studentId" type="hidden" value={studentId} />
              <input
                name="workoutAssignmentId"
                type="hidden"
                value={workoutAssignment.id}
              />
              <button
                className="rounded-md border border-dogwood-green/20 px-3 py-2 text-sm font-medium text-dogwood-ink"
                type="submit"
              >
                Archive
              </button>
            </form>
          ) : null}
        </div>
      </div>

      {canManage ? (
        <details className="mt-5 rounded-md border border-dogwood-green/15 bg-dogwood-cream/50 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-dogwood-ink">
            Edit workout
          </summary>
          <div className="mt-4">
            <WorkoutAssignmentForm
              studentId={studentId}
              workoutAssignment={workoutAssignment}
            />
          </div>
        </details>
      ) : null}
    </article>
  );
}

export default async function FitnessPage({ params }: FitnessPageProps) {
  const { studentId } = await params;
  const {
    student,
    fitnessPlans,
    workoutAssignments,
    canManage,
    canUpdateOwnCompletion
  } = await getFitnessPageData(studentId);
  const fullName = `${student.firstName} ${student.lastName}`;

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-dogwood-leaf">
            Fitness
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-dogwood-ink">
            {fullName}
          </h1>
          <p className="mt-2 text-sm leading-6 text-dogwood-ink/65">
            Fitness plans and workout assignments for player development.
          </p>
        </div>
        <Link
          className="text-sm font-medium text-dogwood-leaf hover:text-dogwood-green"
          href={`/students/${student.id}/snapshot`}
        >
          Back to snapshot
        </Link>
      </div>

      {canManage ? (
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <details className="rounded-lg border border-dogwood-green/15 bg-white p-5 shadow-sm">
            <summary className="cursor-pointer text-base font-semibold text-dogwood-ink">
              Create fitness plan
            </summary>
            <div className="mt-5">
              <FitnessPlanForm studentId={student.id} />
            </div>
          </details>
          <details className="rounded-lg border border-dogwood-green/15 bg-white p-5 shadow-sm">
            <summary className="cursor-pointer text-base font-semibold text-dogwood-ink">
              Create workout
            </summary>
            <div className="mt-5">
              <WorkoutAssignmentForm studentId={student.id} />
            </div>
          </details>
        </div>
      ) : null}

      <div className="grid gap-8">
        <section>
          <h2 className="mb-4 text-xl font-semibold text-dogwood-ink">
            Workout assignments
          </h2>
          {workoutAssignments.length ? (
            <div className="grid gap-4">
              {workoutAssignments.map((workoutAssignment) => (
                <WorkoutAssignmentCard
                  canManage={canManage}
                  canUpdateOwnCompletion={canUpdateOwnCompletion}
                  key={workoutAssignment.id}
                  studentId={student.id}
                  workoutAssignment={workoutAssignment}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-dogwood-green/20 bg-white px-5 py-8 text-sm leading-6 text-dogwood-ink/65">
              No visible workout assignments are available yet.
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-dogwood-ink">
            Fitness plans
          </h2>
          {fitnessPlans.length ? (
            <div className="grid gap-4">
              {fitnessPlans.map((fitnessPlan) => (
                <FitnessPlanCard
                  canManage={canManage}
                  fitnessPlan={fitnessPlan}
                  key={fitnessPlan.id}
                  studentId={student.id}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-dogwood-green/20 bg-white px-5 py-8 text-sm leading-6 text-dogwood-ink/65">
              No visible fitness plans are available yet.
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
