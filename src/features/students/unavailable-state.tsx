import Link from "next/link";
import type { StudentPageAccessIssue } from "@/features/students/page-access";

const COPY: Record<
  StudentPageAccessIssue,
  { title: string; message: string }
> = {
  access_denied: {
    title: "Access Denied",
    message: "You do not have permission to view this student's records."
  },
  student_profile_not_found: {
    title: "Student profile not found",
    message: "Student profile not found. Check that this user has a student profile."
  }
};

export function StudentFeatureUnavailableState({
  status
}: {
  status: StudentPageAccessIssue;
}) {
  const copy = COPY[status];

  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <div className="rounded-lg border border-dogwood-green/15 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-dogwood-leaf">
          Student Records
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-dogwood-ink">
          {copy.title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-dogwood-ink/70">
          {copy.message}
        </p>
        <Link
          className="mt-5 inline-flex rounded-md bg-dogwood-green px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-dogwood-ink"
          href="/admin/students"
        >
          Back to students
        </Link>
      </div>
    </section>
  );
}
