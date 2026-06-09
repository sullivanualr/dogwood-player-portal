import { createGoal, updateGoal } from "@/features/goals/actions";
import type { StudentGoal } from "@/features/goals/queries";
import type { GoalStatus } from "@/lib/db/types";

const GOAL_STATUS_OPTIONS: Array<{ value: GoalStatus; label: string }> = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "paused", label: "Paused" },
  { value: "archived", label: "Archived" }
];

const inputClassName =
  "mt-2 w-full rounded-md border border-dogwood-green/20 bg-white px-3 py-2 text-sm text-dogwood-ink outline-none focus:border-dogwood-leaf focus:ring-2 focus:ring-dogwood-leaf/20";
const labelClassName = "text-sm font-medium text-dogwood-ink";

export function GoalForm({
  studentId,
  goal
}: {
  studentId: string;
  goal?: StudentGoal;
}) {
  const isEditing = Boolean(goal);

  return (
    <form action={isEditing ? updateGoal : createGoal} className="grid gap-4">
      <input name="studentId" type="hidden" value={studentId} />
      {goal ? <input name="goalId" type="hidden" value={goal.id} /> : null}

      <div>
        <label className={labelClassName} htmlFor={`${goal?.id ?? "new"}-title`}>
          Title
        </label>
        <input
          className={inputClassName}
          defaultValue={goal?.title}
          id={`${goal?.id ?? "new"}-title`}
          name="title"
          required
          type="text"
        />
      </div>

      <div>
        <label
          className={labelClassName}
          htmlFor={`${goal?.id ?? "new"}-description`}
        >
          Description
        </label>
        <textarea
          className={`${inputClassName} min-h-24`}
          defaultValue={goal?.description ?? ""}
          id={`${goal?.id ?? "new"}-description`}
          name="description"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            className={labelClassName}
            htmlFor={`${goal?.id ?? "new"}-category`}
          >
            Category
          </label>
          <input
            className={inputClassName}
            defaultValue={goal?.category ?? ""}
            id={`${goal?.id ?? "new"}-category`}
            name="category"
            type="text"
          />
        </div>

        <div>
          <label
            className={labelClassName}
            htmlFor={`${goal?.id ?? "new"}-status`}
          >
            Status
          </label>
          <select
            className={inputClassName}
            defaultValue={goal?.status ?? "active"}
            id={`${goal?.id ?? "new"}-status`}
            name="status"
          >
            {GOAL_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            className={labelClassName}
            htmlFor={`${goal?.id ?? "new"}-target-date`}
          >
            Target date
          </label>
          <input
            className={inputClassName}
            defaultValue={goal?.target_date ?? ""}
            id={`${goal?.id ?? "new"}-target-date`}
            name="targetDate"
            type="date"
          />
        </div>

        <div>
          <label
            className={labelClassName}
            htmlFor={`${goal?.id ?? "new"}-progress-value`}
          >
            Progress value
          </label>
          <input
            className={inputClassName}
            defaultValue={goal?.progress_value ?? 0}
            id={`${goal?.id ?? "new"}-progress-value`}
            max={100}
            min={0}
            name="progressValue"
            step="0.01"
            type="number"
          />
        </div>
      </div>

      <div>
        <button
          className="rounded-md bg-dogwood-green px-4 py-2 text-sm font-medium text-white"
          type="submit"
        >
          {isEditing ? "Save goal" : "Create goal"}
        </button>
      </div>
    </form>
  );
}
