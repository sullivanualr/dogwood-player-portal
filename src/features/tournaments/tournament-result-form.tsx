import {
  createTournamentResult,
  updateTournamentResult
} from "@/features/tournaments/actions";
import { TOURNAMENT_STATUS_OPTIONS } from "@/features/tournaments/constants";
import type { TournamentResult } from "@/features/tournaments/queries";
import type { VisibilityLevel } from "@/lib/db/types";

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

export function TournamentResultForm({
  studentId,
  tournament
}: {
  studentId: string;
  tournament?: TournamentResult;
}) {
  const isEditing = Boolean(tournament);

  return (
    <form
      action={isEditing ? updateTournamentResult : createTournamentResult}
      className="grid gap-4"
    >
      <input name="studentId" type="hidden" value={studentId} />
      {tournament ? (
        <input name="tournamentId" type="hidden" value={tournament.id} />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            className={labelClassName}
            htmlFor={`${tournament?.id ?? "new"}-event-name`}
          >
            Event name
          </label>
          <input
            className={inputClassName}
            defaultValue={tournament?.event_name}
            id={`${tournament?.id ?? "new"}-event-name`}
            name="eventName"
            required
            type="text"
          />
        </div>

        <div>
          <label
            className={labelClassName}
            htmlFor={`${tournament?.id ?? "new"}-event-type`}
          >
            Event type
          </label>
          <input
            className={inputClassName}
            defaultValue={tournament?.event_type ?? ""}
            id={`${tournament?.id ?? "new"}-event-type`}
            name="eventType"
            type="text"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            className={labelClassName}
            htmlFor={`${tournament?.id ?? "new"}-start-date`}
          >
            Start date
          </label>
          <input
            className={inputClassName}
            defaultValue={tournament?.start_date ?? todayDate()}
            id={`${tournament?.id ?? "new"}-start-date`}
            name="startDate"
            required
            type="date"
          />
        </div>

        <div>
          <label
            className={labelClassName}
            htmlFor={`${tournament?.id ?? "new"}-end-date`}
          >
            End date
          </label>
          <input
            className={inputClassName}
            defaultValue={tournament?.end_date ?? ""}
            id={`${tournament?.id ?? "new"}-end-date`}
            name="endDate"
            type="date"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            className={labelClassName}
            htmlFor={`${tournament?.id ?? "new"}-course-name`}
          >
            Course name
          </label>
          <input
            className={inputClassName}
            defaultValue={tournament?.course_name ?? ""}
            id={`${tournament?.id ?? "new"}-course-name`}
            name="courseName"
            type="text"
          />
        </div>

        <div>
          <label
            className={labelClassName}
            htmlFor={`${tournament?.id ?? "new"}-location`}
          >
            Location
          </label>
          <input
            className={inputClassName}
            defaultValue={tournament?.location ?? ""}
            id={`${tournament?.id ?? "new"}-location`}
            name="location"
            type="text"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label
            className={labelClassName}
            htmlFor={`${tournament?.id ?? "new"}-score`}
          >
            Score
          </label>
          <input
            className={inputClassName}
            defaultValue={tournament?.score ?? ""}
            id={`${tournament?.id ?? "new"}-score`}
            name="score"
            type="number"
          />
        </div>

        <div>
          <label
            className={labelClassName}
            htmlFor={`${tournament?.id ?? "new"}-finish-position`}
          >
            Finish position
          </label>
          <input
            className={inputClassName}
            defaultValue={tournament?.finish_position ?? ""}
            id={`${tournament?.id ?? "new"}-finish-position`}
            name="finishPosition"
            type="text"
          />
        </div>

        <div>
          <label
            className={labelClassName}
            htmlFor={`${tournament?.id ?? "new"}-field-size`}
          >
            Field size
          </label>
          <input
            className={inputClassName}
            defaultValue={tournament?.field_size ?? ""}
            id={`${tournament?.id ?? "new"}-field-size`}
            min={1}
            name="fieldSize"
            type="number"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            className={labelClassName}
            htmlFor={`${tournament?.id ?? "new"}-status`}
          >
            Status
          </label>
          <select
            className={inputClassName}
            defaultValue={tournament?.status ?? "upcoming"}
            id={`${tournament?.id ?? "new"}-status`}
            name="status"
          >
            {TOURNAMENT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className={labelClassName}
            htmlFor={`${tournament?.id ?? "new"}-visibility`}
          >
            Visibility
          </label>
          <select
            className={inputClassName}
            defaultValue={tournament?.visibility ?? "internal"}
            id={`${tournament?.id ?? "new"}-visibility`}
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

      <div>
        <label
          className={labelClassName}
          htmlFor={`${tournament?.id ?? "new"}-preparation-notes`}
        >
          Preparation notes
        </label>
        <textarea
          className={`${inputClassName} min-h-24`}
          defaultValue={tournament?.preparation_notes ?? ""}
          id={`${tournament?.id ?? "new"}-preparation-notes`}
          name="preparationNotes"
        />
      </div>

      <div>
        <label
          className={labelClassName}
          htmlFor={`${tournament?.id ?? "new"}-result-notes`}
        >
          Result notes
        </label>
        <textarea
          className={`${inputClassName} min-h-24`}
          defaultValue={tournament?.result_notes ?? ""}
          id={`${tournament?.id ?? "new"}-result-notes`}
          name="resultNotes"
        />
      </div>

      <div>
        <label
          className={labelClassName}
          htmlFor={`${tournament?.id ?? "new"}-coach-takeaways`}
        >
          Coach takeaways
        </label>
        <textarea
          className={`${inputClassName} min-h-24`}
          defaultValue={tournament?.coach_takeaways ?? ""}
          id={`${tournament?.id ?? "new"}-coach-takeaways`}
          name="coachTakeaways"
        />
      </div>

      <div>
        <button
          className="rounded-md bg-dogwood-green px-4 py-2 text-sm font-medium text-white"
          type="submit"
        >
          {isEditing ? "Save tournament" : "Create tournament"}
        </button>
      </div>
    </form>
  );
}
