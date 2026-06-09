import {
  createLessonNote,
  updateLessonNote
} from "@/features/lessons/actions";
import type { LessonNote } from "@/features/lessons/queries";
import type { LessonNoteStatus, VisibilityLevel } from "@/lib/db/types";

const STATUS_OPTIONS: Array<{ value: LessonNoteStatus; label: string }> = [
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

export function LessonNoteForm({
  studentId,
  lessonNote
}: {
  studentId: string;
  lessonNote?: LessonNote;
}) {
  const isEditing = Boolean(lessonNote);

  return (
    <form
      action={isEditing ? updateLessonNote : createLessonNote}
      className="grid gap-4"
    >
      <input name="studentId" type="hidden" value={studentId} />
      {lessonNote ? (
        <input name="lessonNoteId" type="hidden" value={lessonNote.id} />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            className={labelClassName}
            htmlFor={`${lessonNote?.id ?? "new"}-lesson-date`}
          >
            Lesson date
          </label>
          <input
            className={inputClassName}
            defaultValue={lessonNote?.lesson_date ?? todayDate()}
            id={`${lessonNote?.id ?? "new"}-lesson-date`}
            name="lessonDate"
            required
            type="date"
          />
        </div>

        <div>
          <label
            className={labelClassName}
            htmlFor={`${lessonNote?.id ?? "new"}-title`}
          >
            Title
          </label>
          <input
            className={inputClassName}
            defaultValue={lessonNote?.title}
            id={`${lessonNote?.id ?? "new"}-title`}
            name="title"
            required
            type="text"
          />
        </div>
      </div>

      <div>
        <label
          className={labelClassName}
          htmlFor={`${lessonNote?.id ?? "new"}-focus-area`}
        >
          Focus area
        </label>
        <input
          className={inputClassName}
          defaultValue={lessonNote?.focus_area ?? ""}
          id={`${lessonNote?.id ?? "new"}-focus-area`}
          name="focusArea"
          type="text"
        />
      </div>

      <div>
        <label
          className={labelClassName}
          htmlFor={`${lessonNote?.id ?? "new"}-summary`}
        >
          Summary
        </label>
        <textarea
          className={`${inputClassName} min-h-20`}
          defaultValue={lessonNote?.summary ?? ""}
          id={`${lessonNote?.id ?? "new"}-summary`}
          name="summary"
        />
      </div>

      <div>
        <label
          className={labelClassName}
          htmlFor={`${lessonNote?.id ?? "new"}-note-body`}
        >
          Note body
        </label>
        <textarea
          className={`${inputClassName} min-h-32`}
          defaultValue={lessonNote?.note_body ?? ""}
          id={`${lessonNote?.id ?? "new"}-note-body`}
          name="noteBody"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            className={labelClassName}
            htmlFor={`${lessonNote?.id ?? "new"}-visibility`}
          >
            Visibility
          </label>
          <select
            className={inputClassName}
            defaultValue={lessonNote?.visibility ?? "internal"}
            id={`${lessonNote?.id ?? "new"}-visibility`}
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
            htmlFor={`${lessonNote?.id ?? "new"}-status`}
          >
            Status
          </label>
          <select
            className={inputClassName}
            defaultValue={lessonNote?.status ?? "draft"}
            id={`${lessonNote?.id ?? "new"}-status`}
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
          {isEditing ? "Save lesson note" : "Create lesson note"}
        </button>
      </div>
    </form>
  );
}
