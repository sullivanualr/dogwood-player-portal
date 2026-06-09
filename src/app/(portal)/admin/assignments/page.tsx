import Link from "next/link";
import {
  CoachAssignmentForm,
  FitnessAssignmentForm,
  ParentAssignmentForm,
  ProgramAssignmentForm
} from "@/features/admin/forms";
import {
  getAdminAssignmentsData,
  type AdminAssignmentRow
} from "@/features/admin/queries";

function AssignmentList({
  title,
  rows
}: {
  title: string;
  rows: AdminAssignmentRow[];
}) {
  return (
    <section className="rounded-lg border border-dogwood-green/15 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-dogwood-ink">{title}</h2>
      {rows.length ? (
        <ul className="mt-4 grid gap-2">
          {rows.map((row) => (
            <li
              className="rounded-md bg-dogwood-cream/50 px-3 py-2 text-sm text-dogwood-ink/75"
              key={row.id}
            >
              {row.label}
              <span className="ml-2 text-xs uppercase text-dogwood-ink/45">
                {row.status}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm leading-6 text-dogwood-ink/65">
          No active records yet.
        </p>
      )}
    </section>
  );
}

export default async function AdminAssignmentsPage() {
  const {
    students,
    coaches,
    parents,
    fitnessUsers,
    programs,
    coachAssignments,
    parentLinks,
    fitnessAssignments,
    programEnrollments
  } = await getAdminAssignmentsData();

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-dogwood-leaf">
            Admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-dogwood-ink">
            Assignments
          </h1>
          <p className="mt-2 text-sm leading-6 text-dogwood-ink/65">
            Connect students to coaches, parents, Fitness/PT, and programs.
          </p>
        </div>
        <Link
          className="text-sm font-medium text-dogwood-leaf hover:text-dogwood-green"
          href="/admin"
        >
          Back to admin
        </Link>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <details className="rounded-lg border border-dogwood-green/15 bg-white p-5 shadow-sm">
          <summary className="cursor-pointer text-base font-semibold text-dogwood-ink">
            Assign coach
          </summary>
          <div className="mt-5">
            <CoachAssignmentForm coaches={coaches} students={students} />
          </div>
        </details>
        <details className="rounded-lg border border-dogwood-green/15 bg-white p-5 shadow-sm">
          <summary className="cursor-pointer text-base font-semibold text-dogwood-ink">
            Assign parent
          </summary>
          <div className="mt-5">
            <ParentAssignmentForm parents={parents} students={students} />
          </div>
        </details>
        <details className="rounded-lg border border-dogwood-green/15 bg-white p-5 shadow-sm">
          <summary className="cursor-pointer text-base font-semibold text-dogwood-ink">
            Assign Fitness/PT
          </summary>
          <div className="mt-5">
            <FitnessAssignmentForm
              fitnessUsers={fitnessUsers}
              students={students}
            />
          </div>
        </details>
        <details className="rounded-lg border border-dogwood-green/15 bg-white p-5 shadow-sm">
          <summary className="cursor-pointer text-base font-semibold text-dogwood-ink">
            Assign program
          </summary>
          <div className="mt-5">
            <ProgramAssignmentForm programs={programs} students={students} />
          </div>
        </details>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AssignmentList rows={coachAssignments} title="Coach assignments" />
        <AssignmentList rows={parentLinks} title="Parent links" />
        <AssignmentList rows={fitnessAssignments} title="Fitness/PT assignments" />
        <AssignmentList rows={programEnrollments} title="Program enrollments" />
      </div>
    </section>
  );
}
