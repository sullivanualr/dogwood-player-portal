import Link from "next/link";
import { StudentRecordNav } from "@/components/app-shell/student-record-nav";
import { archiveGoal } from "@/features/goals/actions";
import { GoalForm } from "@/features/goals/goal-form";
import {
  getGoalsPageData,
  type StudentGoal
} from "@/features/goals/queries";
import { isStudentFeatureUnavailable } from "@/features/students/page-access";
import { StudentFeatureUnavailableState } from "@/features/students/unavailable-state";

type GoalsPageProps = {
  params: Promise<{
    studentId: string;
  }>;
};

export const dynamic = "force-dynamic";

function formatDate(date: string | null) {
  if (!date) {
    return "No target date";
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatGoalStatus(status: StudentGoal["status"]) {
  return `${status.charAt(0).toUpperCase()}${status.slice(1)}`;
}

function GoalCard({
  goal,
  studentId,
  canManage
}: {
  goal: StudentGoal;
  studentId: string;
  canManage: boolean;
}) {
  return (
    <article className="rounded-lg border border-dogwood-green/15 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-dogwood-ink">
              {goal.title}
            </h2>
            <span className="rounded-full bg-dogwood-green/10 px-2.5 py-1 text-xs font-semibold uppercase text-dogwood-ink/65">
              {formatGoalStatus(goal.status)}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-dogwood-ink/70">
            {goal.description || "No description provided."}
          </p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-medium text-dogwood-ink/55">Category</dt>
              <dd className="mt-1 text-dogwood-ink">
                {goal.category || "Not set"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-dogwood-ink/55">Target date</dt>
              <dd className="mt-1 text-dogwood-ink">
                {formatDate(goal.target_date)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-dogwood-ink/55">Progress</dt>
              <dd className="mt-1 text-dogwood-ink">
                {goal.progress_value}%
              </dd>
            </div>
          </dl>
        </div>

        {canManage && goal.status !== "archived" ? (
          <form action={archiveGoal}>
            <input name="studentId" type="hidden" value={studentId} />
            <input name="goalId" type="hidden" value={goal.id} />
            <button
              className="rounded-md border border-dogwood-green/20 px-3 py-2 text-sm font-medium text-dogwood-ink"
              type="submit"
            >
              Archive
            </button>
          </form>
        ) : null}
      </div>
      <StudentRecordNav active="goals" studentId={student.id} />

      {canManage ? (
        <details className="mt-5 rounded-md border border-dogwood-green/15 bg-dogwood-cream/50 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-dogwood-ink">
            Edit goal
          </summary>
          <div className="mt-4">
            <GoalForm goal={goal} studentId={studentId} />
          </div>
        </details>
      ) : null}
    </article>
  );
}

export default async function GoalsPage({ params }: GoalsPageProps) {
  const { studentId } = await params;
  const pageData = await getGoalsPageData(studentId);

  if (isStudentFeatureUnavailable(pageData)) {
    return <StudentFeatureUnavailableState status={pageData.status} />;
  }

  const { student, goals, canManage } = pageData;
  const fullName = `${student.firstName} ${student.lastName}`;

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-dogwood-leaf">
            Goals
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-dogwood-ink">
            {fullName}
          </h1>
          <p className="mt-2 text-sm leading-6 text-dogwood-ink/65">
            Active and historical player development goals.
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
        <details className="mb-6 rounded-lg border border-dogwood-green/15 bg-white p-5 shadow-sm">
          <summary className="cursor-pointer text-base font-semibold text-dogwood-ink">
            Create goal
          </summary>
          <div className="mt-5">
            <GoalForm studentId={student.id} />
          </div>
        </details>
      ) : null}

      {goals.length ? (
        <div className="grid gap-4">
          {goals.map((goal) => (
            <GoalCard
              canManage={canManage}
              goal={goal}
              key={goal.id}
              studentId={student.id}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-dogwood-green/20 bg-white px-5 py-8 text-sm leading-6 text-dogwood-ink/65">
          No active goals are available yet.
        </div>
      )}
    </section>
  );
}
