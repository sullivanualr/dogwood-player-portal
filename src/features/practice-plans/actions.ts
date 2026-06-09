"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  canManagePracticePlans,
  canViewStudent
} from "@/lib/auth/permissions";
import type { PlanStatus } from "@/lib/db/types";
import { requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { UUID_PATTERN } from "@/features/practice-plans/queries";

const PLAN_STATUSES = new Set<PlanStatus>([
  "draft",
  "active",
  "completed",
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

function getPlanStatus(formData: FormData) {
  const value = getText(formData, "status") as PlanStatus;
  return PLAN_STATUSES.has(value) ? value : "draft";
}

function getDate(formData: FormData, key: string, required = false) {
  const value = getNullableText(formData, key);

  if (!value) {
    if (required) {
      throw new Error("Assigned date is required.");
    }

    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Dates must use the YYYY-MM-DD format.");
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  const isValidDate =
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;

  if (!isValidDate) {
    throw new Error("Dates must be valid dates.");
  }

  return value;
}

function getNullableInteger(formData: FormData, key: string) {
  const value = getText(formData, key);

  if (!value) {
    return null;
  }

  const numberValue = Number(value);

  if (!Number.isInteger(numberValue)) {
    throw new Error("Numeric values must be whole numbers.");
  }

  return numberValue;
}

function getSortOrder(formData: FormData) {
  return getNullableInteger(formData, "sortOrder") ?? 0;
}

async function assertCanManage(studentId: string) {
  if (!UUID_PATTERN.test(studentId)) {
    throw new Error("Invalid student id.");
  }

  await requireUser();
  const supabase = await createClient();
  const canView = await canViewStudent(supabase, studentId);
  const canManage = canView
    ? await canManagePracticePlans(supabase, studentId)
    : false;

  if (!canManage) {
    throw new Error("You do not have permission to manage this student's practice plans.");
  }

  const { data: studentProfile, error: studentProfileError } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("user_id", studentId)
    .maybeSingle();

  if (studentProfileError || !studentProfile) {
    throw new Error("Practice plans can only be managed for students.");
  }

  return supabase;
}

async function assertPlanBelongsToStudent(planId: string, studentId: string) {
  if (!UUID_PATTERN.test(planId)) {
    throw new Error("Invalid practice plan id.");
  }

  const supabase = await assertCanManage(studentId);
  const { data: plan, error } = await supabase
    .from("practice_plans")
    .select("id")
    .eq("id", planId)
    .eq("student_user_id", studentId)
    .maybeSingle();

  if (error || !plan) {
    throw new Error("Practice plan was not found for this student.");
  }

  return supabase;
}

function revalidatePracticePlanRoutes(studentId: string) {
  revalidatePath(`/students/${studentId}/practice-plans`);
  revalidatePath(`/students/${studentId}/snapshot`);
}

function validatePlanDates(assignedDate: string, dueDate: string | null) {
  if (dueDate && dueDate < assignedDate) {
    throw new Error("Due date must be on or after the assigned date.");
  }
}

export async function createPracticePlan(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const title = getText(formData, "title");
  const assignedDate = getDate(formData, "assignedDate", true);
  const dueDate = getDate(formData, "dueDate");

  if (!title) {
    throw new Error("Plan title is required.");
  }

  if (!assignedDate) {
    throw new Error("Assigned date is required.");
  }

  validatePlanDates(assignedDate, dueDate);

  const user = await requireUser();
  const supabase = await assertCanManage(studentId);
  const { error } = await supabase.from("practice_plans").insert({
    student_user_id: studentId,
    created_by_user_id: user.id,
    owner_user_id: user.id,
    title,
    description: getNullableText(formData, "description"),
    assigned_date: assignedDate,
    due_date: dueDate,
    status: getPlanStatus(formData)
  });

  if (error) {
    throw error;
  }

  revalidatePracticePlanRoutes(studentId);
  redirect(`/students/${studentId}/practice-plans`);
}

export async function updatePracticePlan(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const planId = getText(formData, "planId");
  const title = getText(formData, "title");
  const assignedDate = getDate(formData, "assignedDate", true);
  const dueDate = getDate(formData, "dueDate");

  if (!title) {
    throw new Error("Plan title is required.");
  }

  if (!assignedDate) {
    throw new Error("Assigned date is required.");
  }

  validatePlanDates(assignedDate, dueDate);

  const supabase = await assertPlanBelongsToStudent(planId, studentId);
  const { error } = await supabase
    .from("practice_plans")
    .update({
      title,
      description: getNullableText(formData, "description"),
      assigned_date: assignedDate,
      due_date: dueDate,
      status: getPlanStatus(formData)
    })
    .eq("id", planId)
    .eq("student_user_id", studentId);

  if (error) {
    throw error;
  }

  revalidatePracticePlanRoutes(studentId);
  redirect(`/students/${studentId}/practice-plans`);
}

export async function archivePracticePlan(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const planId = getText(formData, "planId");
  const supabase = await assertPlanBelongsToStudent(planId, studentId);
  const { error } = await supabase
    .from("practice_plans")
    .update({ status: "archived" })
    .eq("id", planId)
    .eq("student_user_id", studentId);

  if (error) {
    throw error;
  }

  revalidatePracticePlanRoutes(studentId);
  redirect(`/students/${studentId}/practice-plans`);
}

export async function createPracticePlanItem(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const planId = getText(formData, "planId");
  const title = getText(formData, "itemTitle");

  if (!title) {
    throw new Error("Item title is required.");
  }

  const durationMinutes = getNullableInteger(formData, "durationMinutes");

  if (durationMinutes !== null && durationMinutes < 0) {
    throw new Error("Duration minutes cannot be negative.");
  }

  const supabase = await assertPlanBelongsToStudent(planId, studentId);
  const { error } = await supabase.from("practice_plan_items").insert({
    practice_plan_id: planId,
    title,
    instructions: getNullableText(formData, "instructions"),
    duration_minutes: durationMinutes,
    frequency: getNullableText(formData, "frequency"),
    sort_order: getSortOrder(formData)
  });

  if (error) {
    throw error;
  }

  revalidatePracticePlanRoutes(studentId);
  redirect(`/students/${studentId}/practice-plans`);
}

export async function updatePracticePlanItem(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const planId = getText(formData, "planId");
  const itemId = getText(formData, "itemId");
  const title = getText(formData, "itemTitle");

  if (!UUID_PATTERN.test(itemId)) {
    throw new Error("Invalid practice plan item id.");
  }

  if (!title) {
    throw new Error("Item title is required.");
  }

  const durationMinutes = getNullableInteger(formData, "durationMinutes");

  if (durationMinutes !== null && durationMinutes < 0) {
    throw new Error("Duration minutes cannot be negative.");
  }

  const supabase = await assertPlanBelongsToStudent(planId, studentId);
  const { error } = await supabase
    .from("practice_plan_items")
    .update({
      title,
      instructions: getNullableText(formData, "instructions"),
      duration_minutes: durationMinutes,
      frequency: getNullableText(formData, "frequency"),
      sort_order: getSortOrder(formData)
    })
    .eq("id", itemId)
    .eq("practice_plan_id", planId);

  if (error) {
    throw error;
  }

  revalidatePracticePlanRoutes(studentId);
  redirect(`/students/${studentId}/practice-plans`);
}
