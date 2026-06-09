"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canManageGoals, canViewStudent } from "@/lib/auth/permissions";
import type { GoalStatus } from "@/lib/db/types";
import { requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { UUID_PATTERN } from "@/features/goals/queries";

const GOAL_STATUSES = new Set<GoalStatus>([
  "active",
  "completed",
  "paused",
  "archived"
]);

function getText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getNullableText(formData: FormData, key: string) {
  const value = getText(formData, key);
  return value.length ? value : null;
}

function getGoalStatus(formData: FormData) {
  const value = getText(formData, "status") as GoalStatus;
  return GOAL_STATUSES.has(value) ? value : "active";
}

function getTargetDate(formData: FormData) {
  const value = getNullableText(formData, "targetDate");

  if (!value) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Target date must use the YYYY-MM-DD format.");
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  const isValidDate =
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;

  if (!isValidDate) {
    throw new Error("Target date must be a valid date.");
  }

  return value;
}

function getProgressValue(formData: FormData) {
  const textValue = getText(formData, "progressValue");

  if (!textValue) {
    return 0;
  }

  const value = Number(textValue);

  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error("Progress value must be a number from 0 to 100.");
  }

  return value;
}

async function assertCanManage(studentId: string) {
  if (!UUID_PATTERN.test(studentId)) {
    throw new Error("Invalid student id.");
  }

  await requireUser();
  const supabase = await createClient();
  const canView = await canViewStudent(supabase, studentId);
  const canManage = canView ? await canManageGoals(supabase, studentId) : false;

  if (!canManage) {
    throw new Error("You do not have permission to manage this student's goals.");
  }

  const { data: studentProfile, error: studentProfileError } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("user_id", studentId)
    .maybeSingle();

  if (studentProfileError || !studentProfile) {
    throw new Error("Goals can only be managed for students.");
  }

  return supabase;
}

function revalidateGoalRoutes(studentId: string) {
  revalidatePath(`/students/${studentId}/goals`);
  revalidatePath(`/students/${studentId}/snapshot`);
}

export async function createGoal(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const title = getText(formData, "title");

  if (!title) {
    throw new Error("Title is required.");
  }

  const user = await requireUser();
  const supabase = await assertCanManage(studentId);
  const { error } = await supabase.from("student_goals").insert({
    student_user_id: studentId,
    created_by_user_id: user.id,
    owner_user_id: user.id,
    title,
    description: getNullableText(formData, "description"),
    category: getNullableText(formData, "category"),
    status: getGoalStatus(formData),
    target_date: getTargetDate(formData),
    progress_value: getProgressValue(formData)
  });

  if (error) {
    throw error;
  }

  revalidateGoalRoutes(studentId);
  redirect(`/students/${studentId}/goals`);
}

export async function updateGoal(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const goalId = getText(formData, "goalId");
  const title = getText(formData, "title");

  if (!UUID_PATTERN.test(goalId)) {
    throw new Error("Invalid goal id.");
  }

  if (!title) {
    throw new Error("Title is required.");
  }

  const supabase = await assertCanManage(studentId);
  const { error } = await supabase
    .from("student_goals")
    .update({
      title,
      description: getNullableText(formData, "description"),
      category: getNullableText(formData, "category"),
      status: getGoalStatus(formData),
      target_date: getTargetDate(formData),
      progress_value: getProgressValue(formData)
    })
    .eq("id", goalId)
    .eq("student_user_id", studentId);

  if (error) {
    throw error;
  }

  revalidateGoalRoutes(studentId);
  redirect(`/students/${studentId}/goals`);
}

export async function archiveGoal(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const goalId = getText(formData, "goalId");

  if (!UUID_PATTERN.test(goalId)) {
    throw new Error("Invalid goal id.");
  }

  const supabase = await assertCanManage(studentId);
  const { error } = await supabase
    .from("student_goals")
    .update({ status: "archived" })
    .eq("id", goalId)
    .eq("student_user_id", studentId);

  if (error) {
    throw error;
  }

  revalidateGoalRoutes(studentId);
  redirect(`/students/${studentId}/goals`);
}
