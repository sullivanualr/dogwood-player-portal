import Link from "next/link";
import { ArchiveProgramForm, ProgramForm } from "@/features/admin/forms";
import { getAdminProgramsData } from "@/features/admin/queries";

export default async function AdminProgramsPage() {
  const { programs } = await getAdminProgramsData();

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-dogwood-leaf">
            Admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-dogwood-ink">
            Programs
          </h1>
          <p className="mt-2 text-sm leading-6 text-dogwood-ink/65">
            Create, edit, and archive Dogwood programs.
          </p>
        </div>
        <Link
          className="text-sm font-medium text-dogwood-leaf hover:text-dogwood-green"
          href="/admin"
        >
          Back to admin
        </Link>
      </div>

      <details className="mb-6 rounded-lg border border-dogwood-green/15 bg-white p-5 shadow-sm">
        <summary className="cursor-pointer text-base font-semibold text-dogwood-ink">
          Create program
        </summary>
        <div className="mt-5">
          <ProgramForm />
        </div>
      </details>

      {programs.length ? (
        <div className="grid gap-4">
          {programs.map((program) => (
            <article
              className="rounded-lg border border-dogwood-green/15 bg-white p-5 shadow-sm"
              key={program.id}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-dogwood-ink">
                      {program.name}
                    </h2>
                    <span className="rounded-full bg-dogwood-cream px-2.5 py-1 text-xs font-semibold uppercase text-dogwood-ink/65">
                      {program.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-dogwood-ink/70">
                    {program.description || "No description provided."}
                  </p>
                </div>
                {program.status !== "archived" ? (
                  <ArchiveProgramForm programId={program.id} />
                ) : null}
              </div>
              <details className="mt-5 rounded-md border border-dogwood-green/15 bg-dogwood-cream/50 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-dogwood-ink">
                  Edit program
                </summary>
                <div className="mt-4">
                  <ProgramForm program={program} />
                </div>
              </details>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-dogwood-green/20 bg-white px-5 py-8 text-sm leading-6 text-dogwood-ink/65">
          No programs are available yet.
        </div>
      )}
    </section>
  );
}
