import Link from "next/link";
import { archiveLessonNote } from "@/features/lessons/actions";
import { LessonNoteForm } from "@/features/lessons/lesson-note-form";
import {
  getLessonNotesPageData,
  type LessonNote
} from "@/features/lessons/queries";
import { isStudentFeatureUnavailable } from "@/features/students/page-access";
import { StudentFeatureUnavailableState } from "@/features/students/unavailable-state";

type LessonNotesPageProps = {
  params: Promise<{
    studentId: string;
  }>;
};

export const dynamic = "force-dynamic";

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

function formatLabel(value: string) {
  return value
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function LessonNoteCard({
  lessonNote,
  studentId,
  canManage
}: {
  lessonNote: LessonNote;
  studentId: string;
  canManage: boolean;
}) {
  return (
    <article className="rounded-lg border border-dogwood-green/15 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-dogwood-ink">
              {lessonNote.title}
            </h2>
            <span className="rounded-full bg-dogwood-green/10 px-2.5 py-1 text-xs font-semibold uppercase text-dogwood-ink/65">
              {formatLabel(lessonNote.status)}
            </span>
            <span className="rounded-full bg-dogwood-cream px-2.5 py-1 text-xs font-semibold uppercase text-dogwood-ink/65">
              {formatLabel(lessonNote.visibility)}
            </span>
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-dogwood-ink/55">Lesson date</dt>
              <dd className="mt-1 text-dogwood-ink">
                {formatDate(lessonNote.lesson_date)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-dogwood-ink/55">Focus area</dt>
              <dd className="mt-1 text-dogwood-ink">
                {lessonNote.focus_area || "Not set"}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-sm leading-6 text-dogwood-ink/70">
            {lessonNote.summary || "No summary provided."}
          </p>
          {lessonNote.note_body ? (
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-dogwood-ink/70">
              {lessonNote.note_body}
            </p>
          ) : null}
        </div>

        {canManage && lessonNote.status !== "archived" ? (
          <form action={archiveLessonNote}>
            <input name="studentId" type="hidden" value={studentId} />
            <input name="lessonNoteId" type="hidden" value={lessonNote.id} />
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
            Edit lesson note
          </summary>
          <div className="mt-4">
            <LessonNoteForm
              lessonNote={lessonNote}
              studentId={studentId}
            />
          </div>
        </details>
      ) : null}
    </article>
  );
}

export default async function LessonNotesPage({
  params
}: LessonNotesPageProps) {
  const { studentId } = await params;
  const pageData = await getLessonNotesPageData(studentId);

  if (isStudentFeatureUnavailable(pageData)) {
    return <StudentFeatureUnavailableState status={pageData.status} />;
  }

  const { student, lessonNotes, canManage } = pageData;
  const fullName = `${student.firstName} ${student.lastName}`;

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-dogwood-leaf">
            Lesson Notes
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-dogwood-ink">
            {fullName}
          </h1>
          <p className="mt-2 text-sm leading-6 text-dogwood-ink/65">
            Lesson summaries, focus areas, and coach notes.
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
            Create lesson note
          </summary>
          <div className="mt-5">
            <LessonNoteForm studentId={student.id} />
          </div>
        </details>
      ) : null}

      {lessonNotes.length ? (
        <div className="grid gap-4">
          {lessonNotes.map((lessonNote) => (
            <LessonNoteCard
              canManage={canManage}
              key={lessonNote.id}
              lessonNote={lessonNote}
              studentId={student.id}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-dogwood-green/20 bg-white px-5 py-8 text-sm leading-6 text-dogwood-ink/65">
          No visible lesson notes are available yet.
        </div>
      )}
    </section>
  );
}
