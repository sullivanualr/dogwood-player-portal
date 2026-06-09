import Link from "next/link";
import { archivePracticePlan } from "@/features/practice-plans/actions";
import { PracticePlanForm } from "@/features/practice-plans/practice-plan-form";
import { PracticePlanItemForm } from "@/features/practice-plans/practice-plan-item-form";
import {
  getPracticePlansPageData,
  type PracticePlanWithItems
} from "@/features/practice-plans/queries";

type PracticePlansPageProps = {
  params: Promise<{
    studentId: string;
  }>;
};

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

function formatStatus(status: PracticePlanWithItems["status"]) {
  return `${status.charAt(0).toUpperCase()}${status.slice(1)}`;
}

function PracticePlanCard({
  plan,
  studentId,
  canManage
}: {
  plan: PracticePlanWithItems;
  studentId: string;
  canManage: boolean;
}) {
  return (
    <article className="rounded-lg border border-dogwood-green/15 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-dogwood-ink">
              {plan.title}
            </h2>
            <span className="rounded-full bg-dogwood-green/10 px-2.5 py-1 text-xs font-semibold uppercase text-dogwood-ink/65">
              {formatStatus(plan.status)}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-dogwood-ink/70">
            {plan.description || "No description provided."}
          </p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-dogwood-ink/55">Assigned</dt>
              <dd className="mt-1 text-dogwood-ink">
                {formatDate(plan.assigned_date)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-dogwood-ink/55">Due</dt>
              <dd className="mt-1 text-dogwood-ink">
                {formatDate(plan.due_date)}
              </dd>
            </div>
          </dl>
        </div>

        {canManage && plan.status !== "archived" ? (
          <form action={archivePracticePlan}>
            <input name="studentId" type="hidden" value={studentId} />
            <input name="planId" type="hidden" value={plan.id} />
            <button
              className="rounded-md border border-dogwood-green/20 px-3 py-2 text-sm font-medium text-dogwood-ink"
              type="submit"
            >
              Archive
            </button>
          </form>
        ) : null}
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-dogwood-ink">
          Practice items
        </h3>
        {plan.items.length ? (
          <div className="mt-3 grid gap-3">
            {plan.items.map((item) => (
              <div
                className="rounded-md border border-dogwood-green/15 bg-dogwood-cream/50 p-4"
                key={item.id}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-semibold text-dogwood-ink">
                    {item.title}
                  </h4>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold uppercase text-dogwood-ink/60">
                    Order {item.sort_order}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-dogwood-ink/65">
                  {item.instructions || "No instructions provided."}
                </p>
                <dl className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="font-semibold uppercase text-dogwood-ink/50">
                      Duration
                    </dt>
                    <dd className="mt-1 text-dogwood-ink">
                      {item.duration_minutes === null
                        ? "Not set"
                        : `${item.duration_minutes} minutes`}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold uppercase text-dogwood-ink/50">
                      Frequency
                    </dt>
                    <dd className="mt-1 text-dogwood-ink">
                      {item.frequency || "Not set"}
                    </dd>
                  </div>
                </dl>

                {canManage ? (
                  <details className="mt-4 rounded-md border border-dogwood-green/15 bg-white p-4">
                    <summary className="cursor-pointer text-sm font-semibold text-dogwood-ink">
                      Edit item
                    </summary>
                    <div className="mt-4">
                      <PracticePlanItemForm
                        item={item}
                        planId={plan.id}
                        studentId={studentId}
                      />
                    </div>
                  </details>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded-md border border-dashed border-dogwood-green/20 bg-dogwood-cream/60 px-4 py-5 text-sm leading-6 text-dogwood-ink/65">
            No practice items have been added yet.
          </div>
        )}
      </div>

      {canManage ? (
        <div className="mt-5 grid gap-4">
          <details className="rounded-md border border-dogwood-green/15 bg-dogwood-cream/50 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-dogwood-ink">
              Add practice item
            </summary>
            <div className="mt-4">
              <PracticePlanItemForm planId={plan.id} studentId={studentId} />
            </div>
          </details>

          <details className="rounded-md border border-dogwood-green/15 bg-dogwood-cream/50 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-dogwood-ink">
              Edit practice plan
            </summary>
            <div className="mt-4">
              <PracticePlanForm plan={plan} studentId={studentId} />
            </div>
          </details>
        </div>
      ) : null}
    </article>
  );
}

export default async function PracticePlansPage({
  params
}: PracticePlansPageProps) {
  const { studentId } = await params;
  const { student, plans, canManage } =
    await getPracticePlansPageData(studentId);
  const fullName = `${student.firstName} ${student.lastName}`;

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-dogwood-leaf">
            Practice Plans
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-dogwood-ink">
            {fullName}
          </h1>
          <p className="mt-2 text-sm leading-6 text-dogwood-ink/65">
            Assigned plans and practice items for player development.
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
            Create practice plan
          </summary>
          <div className="mt-5">
            <PracticePlanForm studentId={student.id} />
          </div>
        </details>
      ) : null}

      {plans.length ? (
        <div className="grid gap-4">
          {plans.map((plan) => (
            <PracticePlanCard
              canManage={canManage}
              key={plan.id}
              plan={plan}
              studentId={student.id}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-dogwood-green/20 bg-white px-5 py-8 text-sm leading-6 text-dogwood-ink/65">
          No active practice plans are available yet.
        </div>
      )}
    </section>
  );
}
