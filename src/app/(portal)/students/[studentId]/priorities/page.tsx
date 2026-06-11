import Link from "next/link";
import { StudentRecordNav } from "@/components/app-shell/student-record-nav";
import {
  archiveDevelopmentPriority,
  moveDevelopmentPriority
} from "@/features/priorities/actions";
import { DevelopmentPriorityForm } from "@/features/priorities/priority-form";
import {
  getDevelopmentPrioritiesPageData,
  type DevelopmentPriority
} from "@/features/priorities/queries";

type DevelopmentPrioritiesPageProps = {
  params: Promise<{
    studentId: string;
  }>;
};

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

function formatPriorityLevel(priorityLevel: DevelopmentPriority["priority_level"]) {
  return `${priorityLevel.charAt(0).toUpperCase()}${priorityLevel.slice(1)}`;
}

function PriorityCard({
  priority,
  studentId,
  canManage,
  isFirst,
  isLast
}: {
  priority: DevelopmentPriority;
  studentId: string;
  canManage: boolean;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <article className="rounded-lg border border-dogwood-green/15 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-dogwood-ink">
              {priority.title}
            </h2>
            <span className="rounded-full bg-dogwood-cream px-2.5 py-1 text-xs font-semibold uppercase text-dogwood-ink/65">
              {formatPriorityLevel(priority.priority_level)}
            </span>
            <span className="rounded-full bg-dogwood-green/10 px-2.5 py-1 text-xs font-semibold uppercase text-dogwood-ink/65">
              {priority.status}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-dogwood-ink/70">
            {priority.description || "No description provided."}
          </p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-medium text-dogwood-ink/55">Category</dt>
              <dd className="mt-1 text-dogwood-ink">
                {priority.category || "Not set"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-dogwood-ink/55">Target date</dt>
              <dd className="mt-1 text-dogwood-ink">
                {formatDate(priority.target_date)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-dogwood-ink/55">Sort order</dt>
              <dd className="mt-1 text-dogwood-ink">{priority.sort_order}</dd>
            </div>
          </dl>
        </div>

        {canManage ? (
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <form action={moveDevelopmentPriority}>
              <input name="studentId" type="hidden" value={studentId} />
              <input name="priorityId" type="hidden" value={priority.id} />
              <input name="direction" type="hidden" value="up" />
              <button
                className="rounded-md border border-dogwood-green/20 px-3 py-2 text-sm font-medium text-dogwood-ink disabled:cursor-not-allowed disabled:opacity-40"
                disabled={isFirst}
                type="submit"
              >
                Move up
              </button>
            </form>
            <form action={moveDevelopmentPriority}>
              <input name="studentId" type="hidden" value={studentId} />
              <input name="priorityId" type="hidden" value={priority.id} />
              <input name="direction" type="hidden" value="down" />
              <button
                className="rounded-md border border-dogwood-green/20 px-3 py-2 text-sm font-medium text-dogwood-ink disabled:cursor-not-allowed disabled:opacity-40"
                disabled={isLast}
                type="submit"
              >
                Move down
              </button>
            </form>
            {priority.status !== "archived" ? (
              <form action={archiveDevelopmentPriority}>
                <input name="studentId" type="hidden" value={studentId} />
                <input name="priorityId" type="hidden" value={priority.id} />
                <button
                  className="rounded-md border border-dogwood-green/20 px-3 py-2 text-sm font-medium text-dogwood-ink"
                  type="submit"
                >
                  Archive
                </button>
              </form>
            ) : null}
          </div>
        ) : null}
      </div>
      {canManage ? (
        <details className="mt-5 rounded-md border border-dogwood-green/15 bg-dogwood-cream/50 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-dogwood-ink">
            Edit priority
          </summary>
          <div className="mt-4">
            <DevelopmentPriorityForm priority={priority} studentId={studentId} />
          </div>
        </details>
      ) : null}
    </article>
  );
}

export default async function DevelopmentPrioritiesPage({
  params
}: DevelopmentPrioritiesPageProps) {
  const { studentId } = await params;
  const { student, priorities, canManage } =
    await getDevelopmentPrioritiesPageData(studentId);
  const fullName = `${student.firstName} ${student.lastName}`;

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-dogwood-leaf">
            Development Priorities
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-dogwood-ink">
            {fullName}
          </h1>
          <p className="mt-2 text-sm leading-6 text-dogwood-ink/65">
            Focus areas for current player development.
          </p>
        </div>
        <Link
          className="text-sm font-medium text-dogwood-leaf hover:text-dogwood-green"
          href={`/students/${student.id}/snapshot`}
        >
          Back to snapshot
        </Link>
      </div>

      <StudentRecordNav active="priorities" studentId={student.id} />

      {canManage ? (
        <details className="mb-6 rounded-lg border border-dogwood-green/15 bg-white p-5 shadow-sm">
          <summary className="cursor-pointer text-base font-semibold text-dogwood-ink">
            Create development priority
          </summary>
          <div className="mt-5">
            <DevelopmentPriorityForm studentId={student.id} />
          </div>
        </details>
      ) : null}

      {priorities.length ? (
        <div className="grid gap-4">
          {priorities.map((priority, index) => (
            <PriorityCard
              canManage={canManage}
              isFirst={index === 0}
              isLast={index === priorities.length - 1}
              key={priority.id}
              priority={priority}
              studentId={student.id}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-dogwood-green/20 bg-white px-5 py-8 text-sm leading-6 text-dogwood-ink/65">
          No active development priorities are available yet.
        </div>
      )}
    </section>
  );
}
