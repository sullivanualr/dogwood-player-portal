import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  getAdminStudentsData,
  type AdminStudentRow
} from "@/features/admin/queries";

const STUDENT_ACTIONS = [
  { label: "Open Player Profile", segment: "snapshot", primary: true },
  { label: "Add Lesson Note", segment: "lessons", primary: false },
  { label: "Practice Plan", segment: "practice-plans", primary: false },
  { label: "Goals", segment: "goals", primary: false },
  { label: "Priorities", segment: "priorities", primary: false }
];

function EmptyValue({ children = "Not assigned" }: { children?: string }) {
  return <span className="text-dogwood-ink/45">{children}</span>;
}

function StudentCard({ student }: { student: AdminStudentRow }) {
  return (
    <article className="rounded-md border border-dogwood-green/15 bg-white p-4 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_minmax(320px,auto)] lg:items-center">
        <div>
          <h2 className="text-base font-semibold text-dogwood-ink">
            {student.name}
          </h2>
          <p className="mt-1 text-sm text-dogwood-ink/60">{student.email}</p>
        </div>

        <div className="grid gap-2 text-sm text-dogwood-ink/75 sm:grid-cols-3 lg:grid-cols-1">
          <p>
            Junior:{" "}
            <span className="font-medium text-dogwood-ink">
              {student.juniorPlayer ? "Yes" : "No"}
            </span>
          </p>
          <p>
            Coach:{" "}
            {student.assignedCoach ? (
              <span className="font-medium text-dogwood-ink">
                {student.assignedCoach}
              </span>
            ) : (
              <EmptyValue />
            )}
          </p>
          <p>
            Program:{" "}
            {student.currentProgram ? (
              <span className="font-medium text-dogwood-ink">
                {student.currentProgram}
              </span>
            ) : (
              <EmptyValue />
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          {STUDENT_ACTIONS.map((action) => (
            <Link
              className={
                action.primary
                  ? "rounded-md bg-dogwood-green px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-dogwood-ink"
                  : "rounded-md border border-dogwood-green/15 px-3 py-2 text-sm font-medium text-dogwood-ink hover:border-dogwood-leaf hover:text-dogwood-green"
              }
              href={`/students/${student.id}/${action.segment}`}
              key={action.segment}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}

export default async function AdminStudentsPage() {
  const { students } = await getAdminStudentsData();

  return (
    <DashboardShell eyebrow="Admin" title="Students">
      <div className="mb-6 flex flex-col gap-3 border-b border-dogwood-green/10 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm leading-6 text-dogwood-ink/70">
            Open player profiles and student development workflows without
            copying IDs or typing URLs.
          </p>
        </div>
        <Link
          className="inline-flex w-fit rounded-md border border-dogwood-green/15 px-3 py-2 text-sm font-medium text-dogwood-ink hover:border-dogwood-leaf hover:text-dogwood-green"
          href="/admin/assignments"
        >
          Manage assignments
        </Link>
      </div>

      {students.length ? (
        <div className="grid gap-3">
          {students.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-dogwood-green/20 bg-dogwood-cream/40 px-5 py-8 text-sm leading-6 text-dogwood-ink/65">
          No active student profiles are available yet.
        </div>
      )}
    </DashboardShell>
  );
}
