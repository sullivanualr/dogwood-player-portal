import {
  createFitnessPlan,
  createWorkoutAssignment,
  updateFitnessPlan,
  updateOwnWorkoutCompletion,
  updateWorkoutAssignment
} from "@/features/fitness/actions";
import {
  FITNESS_STATUS_OPTIONS,
  STUDENT_WORKOUT_COMPLETION_OPTIONS,
  VISIBILITY_OPTIONS,
  WORKOUT_COMPLETION_OPTIONS
} from "@/features/fitness/constants";
import type {
  FitnessPlan,
  WorkoutAssignment
} from "@/features/fitness/queries";

const inputClassName =
  "mt-2 w-full rounded-md border border-dogwood-green/20 bg-white px-3 py-2 text-sm text-dogwood-ink outline-none focus:border-dogwood-leaf focus:ring-2 focus:ring-dogwood-leaf/20";
const labelClassName = "text-sm font-medium text-dogwood-ink";

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateInput(value: string | null | undefined) {
  return value ?? "";
}

function SharedPlanFields({
  idPrefix,
  title,
  description,
  assignedDate,
  dueDate,
  status,
  visibility
}: {
  idPrefix: string;
  title?: string;
  description?: string | null;
  assignedDate?: string;
  dueDate?: string | null;
  status?: string;
  visibility?: string;
}) {
  return (
    <>
      <div>
        <label className={labelClassName} htmlFor={`${idPrefix}-title`}>
          Title
        </label>
        <input
          className={inputClassName}
          defaultValue={title}
          id={`${idPrefix}-title`}
          name="title"
          required
          type="text"
        />
      </div>

      <div>
        <label className={labelClassName} htmlFor={`${idPrefix}-description`}>
          Description
        </label>
        <textarea
          className={`${inputClassName} min-h-20`}
          defaultValue={description ?? ""}
          id={`${idPrefix}-description`}
          name="description"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClassName} htmlFor={`${idPrefix}-assigned`}>
            Assigned date
          </label>
          <input
            className={inputClassName}
            defaultValue={assignedDate ?? todayDate()}
            id={`${idPrefix}-assigned`}
            name="assignedDate"
            required
            type="date"
          />
        </div>

        <div>
          <label className={labelClassName} htmlFor={`${idPrefix}-due`}>
            Due date
          </label>
          <input
            className={inputClassName}
            defaultValue={formatDateInput(dueDate)}
            id={`${idPrefix}-due`}
            name="dueDate"
            type="date"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClassName} htmlFor={`${idPrefix}-status`}>
            Status
          </label>
          <select
            className={inputClassName}
            defaultValue={status ?? "draft"}
            id={`${idPrefix}-status`}
            name="status"
          >
            {FITNESS_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClassName} htmlFor={`${idPrefix}-visibility`}>
            Visibility
          </label>
          <select
            className={inputClassName}
            defaultValue={visibility ?? "internal"}
            id={`${idPrefix}-visibility`}
            name="visibility"
          >
            {VISIBILITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}

export function FitnessPlanForm({
  studentId,
  fitnessPlan
}: {
  studentId: string;
  fitnessPlan?: FitnessPlan;
}) {
  const isEditing = Boolean(fitnessPlan);

  return (
    <form
      action={isEditing ? updateFitnessPlan : createFitnessPlan}
      className="grid gap-4"
    >
      <input name="studentId" type="hidden" value={studentId} />
      {fitnessPlan ? (
        <input name="fitnessPlanId" type="hidden" value={fitnessPlan.id} />
      ) : null}
      <SharedPlanFields
        assignedDate={fitnessPlan?.assigned_date}
        description={fitnessPlan?.description}
        dueDate={fitnessPlan?.due_date}
        idPrefix={fitnessPlan?.id ?? "new-fitness-plan"}
        status={fitnessPlan?.status}
        title={fitnessPlan?.title}
        visibility={fitnessPlan?.visibility}
      />
      <div>
        <button
          className="rounded-md bg-dogwood-green px-4 py-2 text-sm font-medium text-white"
          type="submit"
        >
          {isEditing ? "Save fitness plan" : "Create fitness plan"}
        </button>
      </div>
    </form>
  );
}

export function WorkoutAssignmentForm({
  studentId,
  workoutAssignment
}: {
  studentId: string;
  workoutAssignment?: WorkoutAssignment;
}) {
  const isEditing = Boolean(workoutAssignment);

  return (
    <form
      action={isEditing ? updateWorkoutAssignment : createWorkoutAssignment}
      className="grid gap-4"
    >
      <input name="studentId" type="hidden" value={studentId} />
      {workoutAssignment ? (
        <input
          name="workoutAssignmentId"
          type="hidden"
          value={workoutAssignment.id}
        />
      ) : null}
      <SharedPlanFields
        assignedDate={workoutAssignment?.assigned_date}
        description={workoutAssignment?.description}
        dueDate={workoutAssignment?.due_date}
        idPrefix={workoutAssignment?.id ?? "new-workout"}
        status={workoutAssignment?.status}
        title={workoutAssignment?.title}
        visibility={workoutAssignment?.visibility}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            className={labelClassName}
            htmlFor={`${workoutAssignment?.id ?? "new-workout"}-frequency`}
          >
            Frequency
          </label>
          <input
            className={inputClassName}
            defaultValue={workoutAssignment?.frequency ?? ""}
            id={`${workoutAssignment?.id ?? "new-workout"}-frequency`}
            name="frequency"
            type="text"
          />
        </div>

        <div>
          <label
            className={labelClassName}
            htmlFor={`${workoutAssignment?.id ?? "new-workout"}-completion`}
          >
            Completion state
          </label>
          <select
            className={inputClassName}
            defaultValue={workoutAssignment?.completion_state ?? "not_started"}
            id={`${workoutAssignment?.id ?? "new-workout"}-completion`}
            name="completionState"
          >
            {WORKOUT_COMPLETION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          className={labelClassName}
          htmlFor={`${workoutAssignment?.id ?? "new-workout"}-details`}
        >
          Exercise details
        </label>
        <textarea
          className={`${inputClassName} min-h-28`}
          defaultValue={workoutAssignment?.exercise_details ?? ""}
          id={`${workoutAssignment?.id ?? "new-workout"}-details`}
          name="exerciseDetails"
        />
      </div>

      <div>
        <button
          className="rounded-md bg-dogwood-green px-4 py-2 text-sm font-medium text-white"
          type="submit"
        >
          {isEditing ? "Save workout" : "Create workout"}
        </button>
      </div>
    </form>
  );
}

export function WorkoutCompletionForm({
  studentId,
  workoutAssignment
}: {
  studentId: string;
  workoutAssignment: WorkoutAssignment;
}) {
  return (
    <form action={updateOwnWorkoutCompletion} className="flex flex-wrap gap-2">
      <input name="studentId" type="hidden" value={studentId} />
      <input
        name="workoutAssignmentId"
        type="hidden"
        value={workoutAssignment.id}
      />
      <select
        className="rounded-md border border-dogwood-green/20 bg-white px-3 py-2 text-sm text-dogwood-ink outline-none focus:border-dogwood-leaf focus:ring-2 focus:ring-dogwood-leaf/20"
        defaultValue={
          workoutAssignment.completion_state === "completed"
            ? "completed"
            : "in_progress"
        }
        name="completionState"
      >
        {STUDENT_WORKOUT_COMPLETION_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        className="rounded-md bg-dogwood-green px-3 py-2 text-sm font-medium text-white"
        type="submit"
      >
        Update status
      </button>
    </form>
  );
}
