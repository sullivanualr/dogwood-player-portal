import Link from "next/link";

const STUDENT_RECORD_NAV_ITEMS = [
  { label: "Snapshot", segment: "snapshot" },
  { label: "Lesson Notes", segment: "lessons" },
  { label: "Practice Plan", segment: "practice-plans" },
  { label: "Goals", segment: "goals" },
  { label: "Priorities", segment: "priorities" },
  { label: "Assessments", segment: "assessments" },
  { label: "Metrics", segment: "metrics" },
  { label: "Tournaments", segment: "tournaments" },
  { label: "Files", segment: "files" },
  { label: "Fitness", segment: "fitness" }
];

export function StudentRecordNav({
  studentId,
  active
}: {
  studentId: string;
  active: string;
}) {
  return (
    <nav className="mb-6 rounded-xl bg-dogwood-green p-3 text-white shadow-[0_18px_45px_rgba(24,35,29,0.16)]">
      <div className="mb-2 flex items-center justify-between gap-3 px-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/55">
          Player Menu
        </p>
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-5">
        {STUDENT_RECORD_NAV_ITEMS.map((item) => {
          const isActive = item.segment === active;

          return (
            <Link
              className={
                isActive
                  ? "rounded-md bg-dogwood-cream px-3 py-2 text-sm font-semibold text-dogwood-green shadow-sm"
                  : "rounded-md px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
              }
              href={`/students/${studentId}/${item.segment}`}
              key={item.segment}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
