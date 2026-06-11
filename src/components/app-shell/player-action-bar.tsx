import { PrimaryButtonLink, SecondaryButtonLink } from "@/components/ui/buttons";

export function PlayerActionBar({
  studentId,
  canManage,
  tone = "light"
}: {
  studentId: string;
  canManage: boolean;
  tone?: "light" | "dark";
}) {
  if (!canManage) {
    return null;
  }

  const primaryOnDark =
    tone === "dark" ? "bg-dogwood-cream text-dogwood-green hover:bg-white" : "";
  const secondaryOnDark =
    tone === "dark"
      ? "border-white/12 bg-white/8 text-white hover:bg-white/12 hover:text-white"
      : "";

  return (
    <div className="flex flex-wrap gap-2">
      <PrimaryButtonLink
        className={primaryOnDark}
        href={`/students/${studentId}/lessons`}
      >
        Add Lesson Note
      </PrimaryButtonLink>
      <SecondaryButtonLink
        className={secondaryOnDark}
        href={`/students/${studentId}/practice-plans`}
      >
        Add Practice Plan
      </SecondaryButtonLink>
      <SecondaryButtonLink
        className={secondaryOnDark}
        href={`/students/${studentId}/goals`}
      >
        Add Goal
      </SecondaryButtonLink>
      <SecondaryButtonLink
        className={secondaryOnDark}
        href={`/students/${studentId}/priorities`}
      >
        Add Priority
      </SecondaryButtonLink>
    </div>
  );
}
