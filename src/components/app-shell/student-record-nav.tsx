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

export function PlayerSubNav({
  studentId,
  active
}: {
  studentId: string;
  active: string;
}) {
  return (
    <nav className="mb-6 rounded-lg border border-dogwood-green/10 bg-white/90 p-2 shadow-[0_12px_34px_rgba(24,35,29,0.05)]">
      <div className="flex gap-1.5 overflow-x-auto">
        {STUDENT_RECORD_NAV_ITEMS.map((item) => {
          const isActive = item.segment === active;

          return (
            <Link
              className={
                isActive
                  ? "shrink-0 rounded-md bg-dogwood-green px-3 py-2 text-sm font-semibold text-white shadow-sm"
                  : "shrink-0 rounded-md px-3 py-2 text-sm font-medium text-dogwood-ink/62 hover:bg-dogwood-cream/65 hover:text-dogwood-green"
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

export function StudentRecordNav({
  studentId,
  active
}: {
  studentId: string;
  active: string;
}) {
  return <PlayerSubNav active={active} studentId={studentId} />;
}
