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
    <nav className="mb-6 overflow-x-auto rounded-lg border border-dogwood-green/10 bg-white/90 p-1.5 shadow-sm">
      <div className="flex min-w-max gap-1">
        {STUDENT_RECORD_NAV_ITEMS.map((item) => {
          const isActive = item.segment === active;

          return (
            <Link
              className={
                isActive
                  ? "rounded-md bg-dogwood-green px-3 py-2 text-sm font-semibold text-white shadow-sm"
                  : "rounded-md px-3 py-2 text-sm font-medium text-dogwood-ink/68 hover:bg-dogwood-cream hover:text-dogwood-green"
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
