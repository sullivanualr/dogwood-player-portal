import {
  createProgressMetric,
  updateProgressMetric
} from "@/features/metrics/actions";
import {
  FITNESS_METRIC_CATEGORIES,
  METRIC_CATEGORY_OPTIONS
} from "@/features/metrics/constants";
import type { ProgressMetric } from "@/features/metrics/queries";
import type {
  MetricCategory,
  ProgressMetricStatus,
  VisibilityLevel
} from "@/lib/db/types";

const STATUS_OPTIONS: Array<{ value: ProgressMetricStatus; label: string }> = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" }
];

const VISIBILITY_OPTIONS: Array<{ value: VisibilityLevel; label: string }> = [
  { value: "internal", label: "Internal" },
  { value: "staff", label: "Staff" },
  { value: "student_parent", label: "Student/Parent" },
  { value: "private", label: "Private" }
];

const inputClassName =
  "mt-2 w-full rounded-md border border-dogwood-green/20 bg-white px-3 py-2 text-sm text-dogwood-ink outline-none focus:border-dogwood-leaf focus:ring-2 focus:ring-dogwood-leaf/20";
const labelClassName = "text-sm font-medium text-dogwood-ink";

function nowDateTimeLocal() {
  return new Date().toISOString().slice(0, 16);
}

function toDateTimeLocal(value: string | null | undefined) {
  if (!value) {
    return nowDateTimeLocal();
  }

  return new Date(value).toISOString().slice(0, 16);
}

function getCategoryOptions(fitnessOnly: boolean) {
  if (!fitnessOnly) {
    return METRIC_CATEGORY_OPTIONS;
  }

  return METRIC_CATEGORY_OPTIONS.filter((option) =>
    FITNESS_METRIC_CATEGORIES.has(option.value)
  );
}

export function ProgressMetricForm({
  studentId,
  metric,
  fitnessOnly = false
}: {
  studentId: string;
  metric?: ProgressMetric;
  fitnessOnly?: boolean;
}) {
  const isEditing = Boolean(metric);
  const categoryOptions = getCategoryOptions(fitnessOnly);
  const defaultCategory: MetricCategory =
    metric?.category ?? categoryOptions[0]?.value ?? "custom";

  return (
    <form
      action={isEditing ? updateProgressMetric : createProgressMetric}
      className="grid gap-4"
    >
      <input name="studentId" type="hidden" value={studentId} />
      {metric ? <input name="metricId" type="hidden" value={metric.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            className={labelClassName}
            htmlFor={`${metric?.id ?? "new"}-metric-name`}
          >
            Metric name
          </label>
          <input
            className={inputClassName}
            defaultValue={metric?.metric_name}
            id={`${metric?.id ?? "new"}-metric-name`}
            name="metricName"
            required
            type="text"
          />
        </div>

        <div>
          <label
            className={labelClassName}
            htmlFor={`${metric?.id ?? "new"}-category`}
          >
            Category
          </label>
          <select
            className={inputClassName}
            defaultValue={defaultCategory}
            id={`${metric?.id ?? "new"}-category`}
            name="category"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label
            className={labelClassName}
            htmlFor={`${metric?.id ?? "new"}-value`}
          >
            Value
          </label>
          <input
            className={inputClassName}
            defaultValue={metric?.value ?? ""}
            id={`${metric?.id ?? "new"}-value`}
            name="value"
            required
            step="0.01"
            type="number"
          />
        </div>

        <div>
          <label
            className={labelClassName}
            htmlFor={`${metric?.id ?? "new"}-unit`}
          >
            Unit
          </label>
          <input
            className={inputClassName}
            defaultValue={metric?.unit ?? ""}
            id={`${metric?.id ?? "new"}-unit`}
            name="unit"
            type="text"
          />
        </div>

        <div>
          <label
            className={labelClassName}
            htmlFor={`${metric?.id ?? "new"}-recorded-at`}
          >
            Recorded date/time
          </label>
          <input
            className={inputClassName}
            defaultValue={toDateTimeLocal(metric?.recorded_at)}
            id={`${metric?.id ?? "new"}-recorded-at`}
            name="recordedAt"
            required
            type="datetime-local"
          />
        </div>
      </div>

      <div>
        <label
          className={labelClassName}
          htmlFor={`${metric?.id ?? "new"}-notes`}
        >
          Notes
        </label>
        <textarea
          className={`${inputClassName} min-h-24`}
          defaultValue={metric?.notes ?? ""}
          id={`${metric?.id ?? "new"}-notes`}
          name="notes"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            className={labelClassName}
            htmlFor={`${metric?.id ?? "new"}-visibility`}
          >
            Visibility
          </label>
          <select
            className={inputClassName}
            defaultValue={metric?.visibility ?? "internal"}
            id={`${metric?.id ?? "new"}-visibility`}
            name="visibility"
          >
            {VISIBILITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className={labelClassName}
            htmlFor={`${metric?.id ?? "new"}-status`}
          >
            Status
          </label>
          <select
            className={inputClassName}
            defaultValue={metric?.status ?? "draft"}
            id={`${metric?.id ?? "new"}-status`}
            name="status"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <button
          className="rounded-md bg-dogwood-green px-4 py-2 text-sm font-medium text-white"
          type="submit"
        >
          {isEditing ? "Save metric" : "Create metric"}
        </button>
      </div>
    </form>
  );
}
