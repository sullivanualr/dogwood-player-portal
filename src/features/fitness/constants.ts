import type {
  PlanStatus,
  VisibilityLevel,
  WorkoutCompletionState
} from "@/lib/db/types";

export const FITNESS_STATUS_OPTIONS: Array<{ value: PlanStatus; label: string }> =
  [
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "archived", label: "Archived" }
  ];

export const WORKOUT_COMPLETION_OPTIONS: Array<{
  value: WorkoutCompletionState;
  label: string;
}> = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "missed", label: "Missed" }
];

export const STUDENT_WORKOUT_COMPLETION_OPTIONS: Array<{
  value: Extract<WorkoutCompletionState, "in_progress" | "completed">;
  label: string;
}> = [
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" }
];

export const VISIBILITY_OPTIONS: Array<{ value: VisibilityLevel; label: string }> =
  [
    { value: "internal", label: "Internal" },
    { value: "staff", label: "Staff" },
    { value: "student_parent", label: "Student/Parent" },
    { value: "private", label: "Private" }
  ];
