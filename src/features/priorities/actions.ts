"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  canManageDevelopmentPriorities,
  canViewStudent
} from "@/lib/auth/permissions";
import type { PriorityLevel, RecordStatus } from "@/lib/db/types";
import { requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { UUID_PATTERN } from "@/features/priorities/queries";

const PRIORITY_LEVELS = new Set<PriorityLevel>(["low", "medium", "high"]);
const PRIORITY_STATUSES = new Set<RecordStatus>([
  "active",
  "inactive",
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

function getPriorityLevel(formData: FormData) {
  const value = getText(formData, "priorityLevel") as PriorityLevel;
  return PRIORITY_LEVELS.has(value) ? value : "medium";
}

function getRecordStatus(formData: FormData) {
  const value = getText(formData, "status") as RecordStatus;
  return PRIORITY_STATUSES.has(value) ? value : "active";
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

function getSortOrder(formData: FormData) {
  const textValue = getText(formData, "sortOrder");

  if (!textValue) {
    return 0;
  }

  const value = Number(textValue);

  if (!Number.isInteger(value)) {
    throw new Error("Sort order must be a whole number.");
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
  const canManage = canView
    ? await canManageDevelopmentPriorities(supabase, studentId)
    : false;

  if (!canManage) {
    throw new Error("You do not have permission to manage this student's priorities.");
  }

  const { data: studentProfile, error: studentProfileError } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("user_id", studentId)
    .maybeSingle();

  if (studentProfileError || !studentProfile) {
    throw new Error("Development priorities can only be managed for students.");
  }

  return supabase;
}

function revalidatePriorityRoutes(studentId: string) {
  revalidatePath(`/students/${studentId}/priorities`);
  revalidatePath(`/students/${studentId}/snapshot`);
}

export async function createDevelopmentPriority(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const title = getText(formData, "title");

  if (!title) {
    throw new Error("Title is required.");
  }

  const user = await requireUser();
  const supabase = await assertCanManage(studentId);
  const { error } = await supabase.from("development_priorities").insert({
    student_user_id: studentId,
    created_by_user_id: user.id,
    owner_user_id: user.id,
    title,
    description: getNullableText(formData, "description"),
    category: getNullableText(formData, "category"),
    priority_level: getPriorityLevel(formData),
    target_date: getTargetDate(formData),
    sort_order: getSortOrder(formData),
    status: getRecordStatus(formData)
  });

  if (error) {
    throw error;
  }

  revalidatePriorityRoutes(studentId);
  redirect(`/students/${studentId}/priorities`);
}

export async function updateDevelopmentPriority(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const priorityId = getText(formData, "priorityId");
  const title = getText(formData, "title");

  if (!UUID_PATTERN.test(priorityId)) {
    throw new Error("Invalid priority id.");
  }

  if (!title) {
    throw new Error("Title is required.");
  }

  const supabase = await assertCanManage(studentId);
  const { error } = await supabase
    .from("development_priorities")
    .update({
      title,
      description: getNullableText(formData, "description"),
      category: getNullableText(formData, "category"),
      priority_level: getPriorityLevel(formData),
      target_date: getTargetDate(formData),
      sort_order: getSortOrder(formData),
      status: getRecordStatus(formData)
    })
    .eq("id", priorityId)
    .eq("student_user_id", studentId);

  if (error) {
    throw error;
  }

  revalidatePriorityRoutes(studentId);
  redirect(`/students/${studentId}/priorities`);
}

export async function archiveDevelopmentPriority(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const priorityId = getText(formData, "priorityId");

  if (!UUID_PATTERN.test(priorityId)) {
    throw new Error("Invalid priority id.");
  }

  const supabase = await assertCanManage(studentId);
  const { error } = await supabase
    .from("development_priorities")
    .update({ status: "archived" })
    .eq("id", priorityId)
    .eq("student_user_id", studentId);

  if (error) {
    throw error;
  }

  revalidatePriorityRoutes(studentId);
  redirect(`/students/${studentId}/priorities`);
}

export async function moveDevelopmentPriority(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const priorityId = getText(formData, "priorityId");
  const direction = getText(formData, "direction");

  if (direction !== "up" && direction !== "down") {
    throw new Error("Invalid reorder direction.");
  }

  if (!UUID_PATTERN.test(priorityId)) {
    throw new Error("Invalid priority id.");
  }

  const supabase = await assertCanManage(studentId);
  const { data: priorities, error: prioritiesError } = await supabase
    .from("development_priorities")
    .select("id, sort_order")
    .eq("student_user_id", studentId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (prioritiesError) {
    throw prioritiesError;
  }

  const currentIndex =
    priorities?.findIndex((priority) => priority.id === priorityId) ?? -1;
  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (!priorities || currentIndex < 0 || !priorities[targetIndex]) {
    redirect(`/students/${studentId}/priorities`);
  }

  const reorderedPriorities = [...priorities];
  const [currentPriority] = reorderedPriorities.splice(currentIndex, 1);
  reorderedPriorities.splice(targetIndex, 0, currentPriority);

  for (const [sortOrder, priority] of reorderedPriorities.entries()) {
    if (priority.sort_order === sortOrder) {
      continue;
    }

    const { error } = await supabase
      .from("development_priorities")
      .update({ sort_order: sortOrder })
      .eq("id", priority.id)
      .eq("student_user_id", studentId);

    if (error) {
      throw error;
    }
  }

  revalidatePriorityRoutes(studentId);
  redirect(`/students/${studentId}/priorities`);
}
