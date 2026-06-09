import {
  createAssessment,
  updateAssessment
} from "@/features/assessments/actions";
import {
  ASSESSMENT_TYPE_OPTIONS,
  FITNESS_ASSESSMENT_TYPES
} from "@/features/assessments/constants";
import type { Assessment } from "@/features/assessments/queries";
import type {
  AssessmentStatus,
  AssessmentType,
  VisibilityLevel
} from "@/lib/db/types";

const STATUS_OPTIONS: Array<{ value: AssessmentStatus; label: string }> = [
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

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getAssessmentTypeOptions(fitnessOnly: boolean) {
  if (!fitnessOnly) {
    return ASSESSMENT_TYPE_OPTIONS;
  }

  return ASSESSMENT_TYPE_OPTIONS.filter((option) =>
    FITNESS_ASSESSMENT_TYPES.has(option.value)
  );
}

export function AssessmentForm({
  studentId,
  assessment,
  fitnessOnly = false
}: {
  studentId: string;
  assessment?: Assessment;
  fitnessOnly?: boolean;
}) {
  const isEditing = Boolean(assessment);
  const assessmentTypeOptions = getAssessmentTypeOptions(fitnessOnly);
  const defaultAssessmentType: AssessmentType =
    assessment?.assessment_type ?? assessmentTypeOptions[0]?.value ?? "other";

  return (
    <form
      action={isEditing ? updateAssessment : createAssessment}
      className="grid gap-4"
    >
      <input name="studentId" type="hidden" value={studentId} />
      {assessment ? (
        <input name="assessmentId" type="hidden" value={assessment.id} />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            className={labelClassName}
            htmlFor={`${assessment?.id ?? "new"}-assessment-type`}
          >
            Assessment type
          </label>
          <select
            className={inputClassName}
            defaultValue={defaultAssessmentType}
            id={`${assessment?.id ?? "new"}-assessment-type`}
            name="assessmentType"
          >
            {assessmentTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className={labelClassName}
            htmlFor={`${assessment?.id ?? "new"}-assessment-date`}
          >
            Assessment date
          </label>
          <input
            className={inputClassName}
            defaultValue={assessment?.assessment_date ?? todayDate()}
            id={`${assessment?.id ?? "new"}-assessment-date`}
            name="assessmentDate"
            required
            type="date"
          />
        </div>
      </div>

      <div>
        <label
          className={labelClassName}
          htmlFor={`${assessment?.id ?? "new"}-title`}
        >
          Title
        </label>
        <input
          className={inputClassName}
          defaultValue={assessment?.title}
          id={`${assessment?.id ?? "new"}-title`}
          name="title"
          required
          type="text"
        />
      </div>

      <div>
        <label
          className={labelClassName}
          htmlFor={`${assessment?.id ?? "new"}-summary`}
        >
          Summary
        </label>
        <textarea
          className={`${inputClassName} min-h-20`}
          defaultValue={assessment?.summary ?? ""}
          id={`${assessment?.id ?? "new"}-summary`}
          name="summary"
        />
      </div>

      <div>
        <label
          className={labelClassName}
          htmlFor={`${assessment?.id ?? "new"}-findings`}
        >
          Findings
        </label>
        <textarea
          className={`${inputClassName} min-h-32`}
          defaultValue={assessment?.findings ?? ""}
          id={`${assessment?.id ?? "new"}-findings`}
          name="findings"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            className={labelClassName}
            htmlFor={`${assessment?.id ?? "new"}-score`}
          >
            Score
          </label>
          <input
            className={inputClassName}
            defaultValue={assessment?.score ?? ""}
            id={`${assessment?.id ?? "new"}-score`}
            name="score"
            step="0.01"
            type="number"
          />
        </div>

        <div>
          <label
            className={labelClassName}
            htmlFor={`${assessment?.id ?? "new"}-score-unit`}
          >
            Score unit
          </label>
          <input
            className={inputClassName}
            defaultValue={assessment?.score_unit ?? ""}
            id={`${assessment?.id ?? "new"}-score-unit`}
            name="scoreUnit"
            type="text"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            className={labelClassName}
            htmlFor={`${assessment?.id ?? "new"}-visibility`}
          >
            Visibility
          </label>
          <select
            className={inputClassName}
            defaultValue={assessment?.visibility ?? "internal"}
            id={`${assessment?.id ?? "new"}-visibility`}
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
            htmlFor={`${assessment?.id ?? "new"}-status`}
          >
            Status
          </label>
          <select
            className={inputClassName}
            defaultValue={assessment?.status ?? "draft"}
            id={`${assessment?.id ?? "new"}-status`}
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
          {isEditing ? "Save assessment" : "Create assessment"}
        </button>
      </div>
    </form>
  );
}
