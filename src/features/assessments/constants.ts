import type { AssessmentType } from "@/lib/db/types";

export const FITNESS_ASSESSMENT_TYPES = new Set<AssessmentType>([
  "movement_screen",
  "fitness_assessment"
]);

export const ASSESSMENT_TYPE_OPTIONS: Array<{
  value: AssessmentType;
  label: string;
}> = [
  { value: "trackman_combine", label: "TrackMan Combine" },
  { value: "upgame_assessment", label: "Upgame Assessment" },
  { value: "wedge_test", label: "Wedge Test" },
  { value: "putting_test", label: "Putting Test" },
  { value: "speed_test", label: "Speed Test" },
  { value: "skills_assessment", label: "Skills Assessment" },
  { value: "movement_screen", label: "Movement Screen" },
  { value: "fitness_assessment", label: "Fitness Assessment" },
  { value: "other", label: "Other" }
];
