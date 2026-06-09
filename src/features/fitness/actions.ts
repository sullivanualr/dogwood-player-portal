"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  canManageFitnessProgramming,
  canViewStudent
} from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/server";
import type {
  PlanStatus,
  VisibilityLevel,
  WorkoutCompletionState
} from "@/lib/db/types";
import { createClient } from "@/lib/supabase/server";
import {
  FITNESS_STATUS_OPTIONS,
  VISIBILITY_OPTIONS,
  WORKOUT_COMPLETION_OPTIONS
} from "@/features/fitness/constants";
import { UUID_PATTERN } from "@/features/fitness/queries";

const PLAN_STATUSES = new Set<PlanStatus>(
  FITNESS_STATUS_OPTIONS.map((option) => option.value)
);
const VISIBILITY_LEVELS = new Set<VisibilityLevel>(
  VISIBILITY_OPTIONS.map((option) => option.value)
);
const WORKOUT_COMPLETION_STATES = new Set<WorkoutCompletionState>(
  WORKOUT_COMPLETION_OPTIONS.map((option) => option.value)
);
const STUDENT_COMPLETION_STATES = new Set<WorkoutCompletionState>([
  "in_progress",
  "completed"
]);

function getText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getNullableText(formData: FormData, key: string) {
  const value = getText(formData, key);
  return value.length ? value : null;
}

function getStatus(formData: FormData) {
  const value = getText(formData, "status") as PlanStatus;
  return PLAN_STATUSES.has(value) ? value : "draft";
}

function getVisibility(formData: FormData) {
  const value = getText(formData, "visibility") as VisibilityLevel;
  return VISIBILITY_LEVELS.has(value) ? value : "internal";
}

function getCompletionState(formData: FormData) {
  const value = getText(formData, "completionState") as WorkoutCompletionState;
  return WORKOUT_COMPLETION_STATES.has(value) ? value : "not_started";
}

function getStudentCompletionState(formData: FormData) {
  const value = getText(formData, "completionState") as WorkoutCompletionState;

  if (!STUDENT_COMPLETION_STATES.has(value)) {
    throw new Error("Students can only mark workouts in progress or completed.");
  }

  return value;
}

function getDate(formData: FormData, key: string, label: string) {
  const value = getText(formData, key);

  if (!value) {
    throw new Error(`${label} is required.`);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} must use the YYYY-MM-DD format.`);
  }

  return value;
}

function getNullableDate(formData: FormData, key: string, label: string) {
  const value = getText(formData, key);

  if (!value) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} must use the YYYY-MM-DD format.`);
  }

  return value;
}

function getDateRange(formData: FormData) {
  const assignedDate = getDate(formData, "assignedDate", "Assigned date");
  const dueDate = getNullableDate(formData, "dueDate", "Due date");

  if (dueDate && dueDate < assignedDate) {
    throw new Error("Due date cannot be before assigned date.");
  }

  return { assignedDate, dueDate };
}

async function assertCanManage(studentId: string) {
  if (!UUID_PATTERN.test(studentId)) {
    throw new Error("Invalid student id.");
  }

  await requireUser();
  const supabase = await createClient();
  const canView = await canViewStudent(supabase, studentId);
  const canManage = canView
    ? await canManageFitnessProgramming(supabase, studentId)
    : false;

  if (!canManage) {
    throw new Error("You do not have permission to manage fitness records.");
  }

  const { data: studentProfile, error: studentProfileError } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("user_id", studentId)
    .maybeSingle();

  if (studentProfileError || !studentProfile) {
    throw new Error("Fitness records can only be managed for students.");
  }

  return supabase;
}

function revalidateFitnessRoutes(studentId: string) {
  revalidatePath(`/students/${studentId}/fitness`);
  revalidatePath(`/students/${studentId}/snapshot`);
}

export async function createFitnessPlan(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const title = getText(formData, "title");

  if (!title) {
    throw new Error("Title is required.");
  }

  const user = await requireUser();
  const supabase = await assertCanManage(studentId);
  const { assignedDate, dueDate } = getDateRange(formData);
  const { error } = await supabase.from("fitness_plans").insert({
    student_user_id: studentId,
    created_by_user_id: user.id,
    title,
    description: getNullableText(formData, "description"),
    assigned_date: assignedDate,
    due_date: dueDate,
    status: getStatus(formData),
    visibility: getVisibility(formData)
  });

  if (error) {
    throw error;
  }

  revalidateFitnessRoutes(studentId);
  redirect(`/students/${studentId}/fitness`);
}

export async function updateFitnessPlan(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const fitnessPlanId = getText(formData, "fitnessPlanId");
  const title = getText(formData, "title");

  if (!UUID_PATTERN.test(fitnessPlanId)) {
    throw new Error("Invalid fitness plan id.");
  }

  if (!title) {
    throw new Error("Title is required.");
  }

  const supabase = await assertCanManage(studentId);
  const { assignedDate, dueDate } = getDateRange(formData);
  const { data, error } = await supabase
    .from("fitness_plans")
    .update({
      title,
      description: getNullableText(formData, "description"),
      assigned_date: assignedDate,
      due_date: dueDate,
      status: getStatus(formData),
      visibility: getVisibility(formData)
    })
    .eq("id", fitnessPlanId)
    .eq("student_user_id", studentId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Fitness plan was not updated.");
  }

  revalidateFitnessRoutes(studentId);
  redirect(`/students/${studentId}/fitness`);
}

export async function archiveFitnessPlan(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const fitnessPlanId = getText(formData, "fitnessPlanId");

  if (!UUID_PATTERN.test(fitnessPlanId)) {
    throw new Error("Invalid fitness plan id.");
  }

  const supabase = await assertCanManage(studentId);
  const { data, error } = await supabase
    .from("fitness_plans")
    .update({ status: "archived" })
    .eq("id", fitnessPlanId)
    .eq("student_user_id", studentId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Fitness plan was not archived.");
  }

  revalidateFitnessRoutes(studentId);
  redirect(`/students/${studentId}/fitness`);
}

export async function createWorkoutAssignment(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const title = getText(formData, "title");

  if (!title) {
    throw new Error("Title is required.");
  }

  const user = await requireUser();
  const supabase = await assertCanManage(studentId);
  const { assignedDate, dueDate } = getDateRange(formData);
  const { error } = await supabase.from("workout_assignments").insert({
    student_user_id: studentId,
    created_by_user_id: user.id,
    title,
    description: getNullableText(formData, "description"),
    assigned_date: assignedDate,
    due_date: dueDate,
    frequency: getNullableText(formData, "frequency"),
    status: getStatus(formData),
    completion_state: getCompletionState(formData),
    exercise_details: getNullableText(formData, "exerciseDetails"),
    visibility: getVisibility(formData)
  });

  if (error) {
    throw error;
  }

  revalidateFitnessRoutes(studentId);
  redirect(`/students/${studentId}/fitness`);
}

export async function updateWorkoutAssignment(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const workoutAssignmentId = getText(formData, "workoutAssignmentId");
  const title = getText(formData, "title");

  if (!UUID_PATTERN.test(workoutAssignmentId)) {
    throw new Error("Invalid workout assignment id.");
  }

  if (!title) {
    throw new Error("Title is required.");
  }

  const supabase = await assertCanManage(studentId);
  const { assignedDate, dueDate } = getDateRange(formData);
  const { data, error } = await supabase
    .from("workout_assignments")
    .update({
      title,
      description: getNullableText(formData, "description"),
      assigned_date: assignedDate,
      due_date: dueDate,
      frequency: getNullableText(formData, "frequency"),
      status: getStatus(formData),
      completion_state: getCompletionState(formData),
      exercise_details: getNullableText(formData, "exerciseDetails"),
      visibility: getVisibility(formData)
    })
    .eq("id", workoutAssignmentId)
    .eq("student_user_id", studentId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Workout assignment was not updated.");
  }

  revalidateFitnessRoutes(studentId);
  redirect(`/students/${studentId}/fitness`);
}

export async function archiveWorkoutAssignment(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const workoutAssignmentId = getText(formData, "workoutAssignmentId");

  if (!UUID_PATTERN.test(workoutAssignmentId)) {
    throw new Error("Invalid workout assignment id.");
  }

  const supabase = await assertCanManage(studentId);
  const { data, error } = await supabase
    .from("workout_assignments")
    .update({ status: "archived" })
    .eq("id", workoutAssignmentId)
    .eq("student_user_id", studentId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Workout assignment was not archived.");
  }

  revalidateFitnessRoutes(studentId);
  redirect(`/students/${studentId}/fitness`);
}

export async function updateOwnWorkoutCompletion(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const workoutAssignmentId = getText(formData, "workoutAssignmentId");
  const completionState = getStudentCompletionState(formData);

  if (!UUID_PATTERN.test(studentId)) {
    throw new Error("Invalid student id.");
  }

  if (!UUID_PATTERN.test(workoutAssignmentId)) {
    throw new Error("Invalid workout assignment id.");
  }

  const user = await requireUser();

  if (user.id !== studentId) {
    throw new Error("Students can only update their own workout completion.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workout_assignments")
    .update({ completion_state: completionState })
    .eq("id", workoutAssignmentId)
    .eq("student_user_id", studentId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Workout completion was not updated.");
  }

  revalidateFitnessRoutes(studentId);
  redirect(`/students/${studentId}/fitness`);
}
