import {
  createPracticePlan,
  updatePracticePlan
} from "@/features/practice-plans/actions";
import type { PracticePlan } from "@/features/practice-plans/queries";
import type { PlanStatus } from "@/lib/db/types";

const PLAN_STATUS_OPTIONS: Array<{ value: PlanStatus; label: string }> = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" }
];

const inputClassName =
  "mt-2 w-full rounded-md border border-dogwood-green/20 bg-white px-3 py-2 text-sm text-dogwood-ink outline-none focus:border-dogwood-leaf focus:ring-2 focus:ring-dogwood-leaf/20";
const labelClassName = "text-sm font-medium text-dogwood-ink";

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function PracticePlanForm({
  studentId,
  plan
}: {
  studentId: string;
  plan?: PracticePlan;
}) {
  const isEditing = Boolean(plan);

  return (
    <form
      action={isEditing ? updatePracticePlan : createPracticePlan}
      className="grid gap-4"
    >
      <input name="studentId" type="hidden" value={studentId} />
      {plan ? <input name="planId" type="hidden" value={plan.id} /> : null}

      <div>
        <label className={labelClassName} htmlFor={`${plan?.id ?? "new"}-title`}>
          Plan title
        </label>
        <input
          className={inputClassName}
          defaultValue={plan?.title}
          id={`${plan?.id ?? "new"}-title`}
          name="title"
          required
          type="text"
        />
      </div>

      <div>
        <label
          className={labelClassName}
          htmlFor={`${plan?.id ?? "new"}-description`}
        >
          Description
        </label>
        <textarea
          className={`${inputClassName} min-h-24`}
          defaultValue={plan?.description ?? ""}
          id={`${plan?.id ?? "new"}-description`}
          name="description"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label
            className={labelClassName}
            htmlFor={`${plan?.id ?? "new"}-assigned-date`}
          >
            Assigned date
          </label>
          <input
            className={inputClassName}
            defaultValue={plan?.assigned_date ?? todayDate()}
            id={`${plan?.id ?? "new"}-assigned-date`}
            name="assignedDate"
            required
            type="date"
          />
        </div>

        <div>
          <label
            className={labelClassName}
            htmlFor={`${plan?.id ?? "new"}-due-date`}
          >
            Due date
          </label>
          <input
            className={inputClassName}
            defaultValue={plan?.due_date ?? ""}
            id={`${plan?.id ?? "new"}-due-date`}
            name="dueDate"
            type="date"
          />
        </div>

        <div>
          <label
            className={labelClassName}
            htmlFor={`${plan?.id ?? "new"}-status`}
          >
            Status
          </label>
          <select
            className={inputClassName}
            defaultValue={plan?.status ?? "draft"}
            id={`${plan?.id ?? "new"}-status`}
            name="status"
          >
            {PLAN_STATUS_OPTIONS.map((option) => (
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
          {isEditing ? "Save practice plan" : "Create practice plan"}
        </button>
      </div>
    </form>
  );
}
