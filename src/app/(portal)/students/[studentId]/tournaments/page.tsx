import Link from "next/link";
import { archiveTournamentResult } from "@/features/tournaments/actions";
import { TournamentResultForm } from "@/features/tournaments/tournament-result-form";
import {
  getTournamentResultsPageData,
  type TournamentResult
} from "@/features/tournaments/queries";

type TournamentResultsPageProps = {
  params: Promise<{
    studentId: string;
  }>;
};

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

function formatDateRange(tournament: TournamentResult) {
  if (!tournament.end_date || tournament.end_date === tournament.start_date) {
    return formatDate(tournament.start_date);
  }

  return `${formatDate(tournament.start_date)} - ${formatDate(tournament.end_date)}`;
}

function formatResult(tournament: TournamentResult) {
  const parts = [
    tournament.score === null ? null : `Score ${tournament.score}`,
    tournament.finish_position
      ? `Finish ${tournament.finish_position}`
      : null,
    tournament.field_size === null ? null : `Field ${tournament.field_size}`
  ].filter(Boolean);

  return parts.length ? parts.join(" | ") : "No result details set";
}

function TournamentCard({
  tournament,
  studentId,
  canManage
}: {
  tournament: TournamentResult;
  studentId: string;
  canManage: boolean;
}) {
  return (
    <article className="rounded-lg border border-dogwood-green/15 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-dogwood-ink">
              {tournament.event_name}
            </h2>
            <span className="rounded-full bg-dogwood-green/10 px-2.5 py-1 text-xs font-semibold uppercase text-dogwood-ink/65">
              {formatLabel(tournament.status)}
            </span>
            <span className="rounded-full bg-dogwood-cream px-2.5 py-1 text-xs font-semibold uppercase text-dogwood-ink/65">
              {formatLabel(tournament.visibility)}
            </span>
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-medium text-dogwood-ink/55">Dates</dt>
              <dd className="mt-1 text-dogwood-ink">
                {formatDateRange(tournament)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-dogwood-ink/55">Course</dt>
              <dd className="mt-1 text-dogwood-ink">
                {tournament.course_name || "Not set"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-dogwood-ink/55">Result</dt>
              <dd className="mt-1 text-dogwood-ink">
                {formatResult(tournament)}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-sm leading-6 text-dogwood-ink/70">
            {tournament.result_notes ||
              tournament.preparation_notes ||
              "No notes provided."}
          </p>
          {tournament.coach_takeaways ? (
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-dogwood-ink/70">
              {tournament.coach_takeaways}
            </p>
          ) : null}
        </div>

        {canManage && tournament.status !== "archived" ? (
          <form action={archiveTournamentResult}>
            <input name="studentId" type="hidden" value={studentId} />
            <input name="tournamentId" type="hidden" value={tournament.id} />
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
            Edit tournament
          </summary>
          <div className="mt-4">
            <TournamentResultForm
              studentId={studentId}
              tournament={tournament}
            />
          </div>
        </details>
      ) : null}
    </article>
  );
}

export default async function TournamentResultsPage({
  params
}: TournamentResultsPageProps) {
  const { studentId } = await params;
  const { student, tournaments, canManage } =
    await getTournamentResultsPageData(studentId);
  const fullName = `${student.firstName} ${student.lastName}`;

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-dogwood-leaf">
            Tournaments
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-dogwood-ink">
            {fullName}
          </h1>
          <p className="mt-2 text-sm leading-6 text-dogwood-ink/65">
            Tournament preparation, results, and coach takeaways.
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
            Create tournament
          </summary>
          <div className="mt-5">
            <TournamentResultForm studentId={student.id} />
          </div>
        </details>
      ) : null}

      {tournaments.length ? (
        <div className="grid gap-4">
          {tournaments.map((tournament) => (
            <TournamentCard
              canManage={canManage}
              key={tournament.id}
              studentId={student.id}
              tournament={tournament}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-dogwood-green/20 bg-white px-5 py-8 text-sm leading-6 text-dogwood-ink/65">
          No visible tournament records are available yet.
        </div>
      )}
    </section>
  );
}
