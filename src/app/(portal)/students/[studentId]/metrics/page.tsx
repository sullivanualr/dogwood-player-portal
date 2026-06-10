import Link from "next/link";
import { archiveProgressMetric } from "@/features/metrics/actions";
import {
  FITNESS_METRIC_CATEGORIES,
  METRIC_CATEGORY_OPTIONS
} from "@/features/metrics/constants";
import { ProgressMetricForm } from "@/features/metrics/progress-metric-form";
import {
  getProgressMetricsPageData,
  type ProgressMetric
} from "@/features/metrics/queries";

type ProgressMetricsPageProps = {
  params: Promise<{
    studentId: string;
  }>;
};

export const dynamic = "force-dynamic";

const CATEGORY_LABELS = new Map(
  METRIC_CATEGORY_OPTIONS.map((option) => [option.value, option.label])
);

function formatDateTime(value: string) {
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

function formatMetricValue(metric: ProgressMetric) {
  return `${metric.value}${metric.unit ? ` ${metric.unit}` : ""}`;
}

function ProgressMetricCard({
  metric,
  studentId,
  canManage,
  fitnessOnly
}: {
  metric: ProgressMetric;
  studentId: string;
  canManage: boolean;
  fitnessOnly: boolean;
}) {
  return (
    <article className="rounded-lg border border-dogwood-green/15 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-dogwood-ink">
              {metric.metric_name}
            </h2>
            <span className="rounded-full bg-dogwood-green/10 px-2.5 py-1 text-xs font-semibold uppercase text-dogwood-ink/65">
              {formatLabel(metric.status)}
            </span>
            <span className="rounded-full bg-dogwood-cream px-2.5 py-1 text-xs font-semibold uppercase text-dogwood-ink/65">
              {formatLabel(metric.visibility)}
            </span>
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-medium text-dogwood-ink/55">Category</dt>
              <dd className="mt-1 text-dogwood-ink">
                {CATEGORY_LABELS.get(metric.category) ??
                  formatLabel(metric.category)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-dogwood-ink/55">Value</dt>
              <dd className="mt-1 text-dogwood-ink">
                {formatMetricValue(metric)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-dogwood-ink/55">Recorded</dt>
              <dd className="mt-1 text-dogwood-ink">
                {formatDateTime(metric.recorded_at)}
              </dd>
            </div>
          </dl>
          <p className="mt-4 whitespace-pre-line text-sm leading-6 text-dogwood-ink/70">
            {metric.notes || "No notes provided."}
          </p>
        </div>

        {canManage && metric.status !== "archived" ? (
          <form action={archiveProgressMetric}>
            <input name="studentId" type="hidden" value={studentId} />
            <input name="metricId" type="hidden" value={metric.id} />
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
            Edit metric
          </summary>
          <div className="mt-4">
            <ProgressMetricForm
              fitnessOnly={fitnessOnly}
              metric={metric}
              studentId={studentId}
            />
          </div>
        </details>
      ) : null}
    </article>
  );
}

export default async function ProgressMetricsPage({
  params
}: ProgressMetricsPageProps) {
  const { studentId } = await params;
  const { student, metrics, canManageAll, canManageFitness } =
    await getProgressMetricsPageData(studentId);
  const canManage = canManageAll || canManageFitness;
  const fullName = `${student.firstName} ${student.lastName}`;

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-dogwood-leaf">
            Progress Metrics
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-dogwood-ink">
            {fullName}
          </h1>
          <p className="mt-2 text-sm leading-6 text-dogwood-ink/65">
            Measurable player development data over time.
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
            Create metric
          </summary>
          <div className="mt-5">
            <ProgressMetricForm
              fitnessOnly={!canManageAll && canManageFitness}
              studentId={student.id}
            />
          </div>
        </details>
      ) : null}

      {metrics.length ? (
        <div className="grid gap-4">
          {metrics.map((metric) => {
            const canManageMetric =
              canManageAll ||
              (canManageFitness &&
                FITNESS_METRIC_CATEGORIES.has(metric.category));

            return (
              <ProgressMetricCard
                canManage={canManageMetric}
                fitnessOnly={!canManageAll && canManageFitness}
                key={metric.id}
                metric={metric}
                studentId={student.id}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-dogwood-green/20 bg-white px-5 py-8 text-sm leading-6 text-dogwood-ink/65">
          No visible progress metrics are available yet.
        </div>
      )}
    </section>
  );
}
