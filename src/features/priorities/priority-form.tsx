import {
  createDevelopmentPriority,
  updateDevelopmentPriority
} from "@/features/priorities/actions";
import type { DevelopmentPriority } from "@/features/priorities/queries";
import type { PriorityLevel, RecordStatus } from "@/lib/db/types";

const PRIORITY_LEVEL_OPTIONS: Array<{ value: PriorityLevel; label: string }> = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" }
];

const STATUS_OPTIONS: Array<{ value: RecordStatus; label: string }> = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "archived", label: "Archived" }
];

const inputClassName =
  "mt-2 w-full rounded-md border border-dogwood-green/20 bg-white px-3 py-2 text-sm text-dogwood-ink outline-none focus:border-dogwood-leaf focus:ring-2 focus:ring-dogwood-leaf/20";
const labelClassName = "text-sm font-medium text-dogwood-ink";

export function DevelopmentPriorityForm({
  studentId,
  priority
}: {
  studentId: string;
  priority?: DevelopmentPriority;
}) {
  const isEditing = Boolean(priority);

  return (
    <form
      action={isEditing ? updateDevelopmentPriority : createDevelopmentPriority}
      className="grid gap-4"
    >
      <input name="studentId" type="hidden" value={studentId} />
      {priority ? (
        <input name="priorityId" type="hidden" value={priority.id} />
      ) : null}

      <div>
        <label className={labelClassName} htmlFor={`${priority?.id ?? "new"}-title`}>
          Title
        </label>
        <input
          className={inputClassName}
          defaultValue={priority?.title}
          id={`${priority?.id ?? "new"}-title`}
          name="title"
          required
          type="text"
        />
      </div>

      <div>
        <label
          className={labelClassName}
          htmlFor={`${priority?.id ?? "new"}-description`}
        >
          Description
        </label>
        <textarea
          className={`${inputClassName} min-h-24`}
          defaultValue={priority?.description ?? ""}
          id={`${priority?.id ?? "new"}-description`}
          name="description"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            className={labelClassName}
            htmlFor={`${priority?.id ?? "new"}-category`}
          >
            Category
          </label>
          <input
            className={inputClassName}
            defaultValue={priority?.category ?? ""}
            id={`${priority?.id ?? "new"}-category`}
            name="category"
            type="text"
          />
        </div>

        <div>
          <label
            className={labelClassName}
            htmlFor={`${priority?.id ?? "new"}-priority-level`}
          >
            Priority level
          </label>
          <select
            className={inputClassName}
            defaultValue={priority?.priority_level ?? "medium"}
            id={`${priority?.id ?? "new"}-priority-level`}
            name="priorityLevel"
          >
            {PRIORITY_LEVEL_OPTIONS.map((option) => (
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
            htmlFor={`${priority?.id ?? "new"}-target-date`}
          >
            Target date
          </label>
          <input
            className={inputClassName}
            defaultValue={priority?.target_date ?? ""}
            id={`${priority?.id ?? "new"}-target-date`}
            name="targetDate"
            type="date"
          />
        </div>

        <div>
          <label
            className={labelClassName}
            htmlFor={`${priority?.id ?? "new"}-sort-order`}
          >
            Sort order
          </label>
          <input
            className={inputClassName}
            defaultValue={priority?.sort_order ?? 0}
            id={`${priority?.id ?? "new"}-sort-order`}
            name="sortOrder"
            type="number"
          />
        </div>

        <div>
          <label
            className={labelClassName}
            htmlFor={`${priority?.id ?? "new"}-status`}
          >
            Status
          </label>
          <select
            className={inputClassName}
            defaultValue={priority?.status ?? "active"}
            id={`${priority?.id ?? "new"}-status`}
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
          {isEditing ? "Save priority" : "Create priority"}
        </button>
      </div>
    </form>
  );
}
