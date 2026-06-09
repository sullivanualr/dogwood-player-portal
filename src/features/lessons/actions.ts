"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  canManageLessonNotes,
  canViewStudent
} from "@/lib/auth/permissions";
import type { LessonNoteStatus, VisibilityLevel } from "@/lib/db/types";
import { requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { UUID_PATTERN } from "@/features/lessons/queries";

const LESSON_NOTE_STATUSES = new Set<LessonNoteStatus>([
  "draft",
  "published",
  "archived"
]);
const VISIBILITY_LEVELS = new Set<VisibilityLevel>([
  "internal",
  "staff",
  "student_parent",
  "private"
]);

function getText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getNullableText(formData: FormData, key: string) {
  const value = getText(formData, key);
  return value.length ? value : null;
}

function getLessonNoteStatus(formData: FormData) {
  const value = getText(formData, "status") as LessonNoteStatus;
  return LESSON_NOTE_STATUSES.has(value) ? value : "draft";
}

function getVisibility(formData: FormData) {
  const value = getText(formData, "visibility") as VisibilityLevel;
  return VISIBILITY_LEVELS.has(value) ? value : "internal";
}

function getLessonDate(formData: FormData) {
  const value = getNullableText(formData, "lessonDate");

  if (!value) {
    throw new Error("Lesson date is required.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Lesson date must use the YYYY-MM-DD format.");
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  const isValidDate =
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;

  if (!isValidDate) {
    throw new Error("Lesson date must be a valid date.");
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
    ? await canManageLessonNotes(supabase, studentId)
    : false;

  if (!canManage) {
    throw new Error("You do not have permission to manage this student's lesson notes.");
  }

  const { data: studentProfile, error: studentProfileError } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("user_id", studentId)
    .maybeSingle();

  if (studentProfileError || !studentProfile) {
    throw new Error("Lesson notes can only be managed for students.");
  }

  return supabase;
}

function revalidateLessonRoutes(studentId: string) {
  revalidatePath(`/students/${studentId}/lessons`);
  revalidatePath(`/students/${studentId}/snapshot`);
}

export async function createLessonNote(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const title = getText(formData, "title");

  if (!title) {
    throw new Error("Title is required.");
  }

  const user = await requireUser();
  const supabase = await assertCanManage(studentId);
  const { error } = await supabase.from("lesson_notes").insert({
    student_user_id: studentId,
    coach_user_id: user.id,
    created_by_user_id: user.id,
    lesson_date: getLessonDate(formData),
    title,
    focus_area: getNullableText(formData, "focusArea"),
    summary: getNullableText(formData, "summary"),
    note_body: getNullableText(formData, "noteBody"),
    visibility: getVisibility(formData),
    status: getLessonNoteStatus(formData)
  });

  if (error) {
    throw error;
  }

  revalidateLessonRoutes(studentId);
  redirect(`/students/${studentId}/lessons`);
}

export async function updateLessonNote(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const lessonNoteId = getText(formData, "lessonNoteId");
  const title = getText(formData, "title");

  if (!UUID_PATTERN.test(lessonNoteId)) {
    throw new Error("Invalid lesson note id.");
  }

  if (!title) {
    throw new Error("Title is required.");
  }

  const supabase = await assertCanManage(studentId);
  const { error } = await supabase
    .from("lesson_notes")
    .update({
      lesson_date: getLessonDate(formData),
      title,
      focus_area: getNullableText(formData, "focusArea"),
      summary: getNullableText(formData, "summary"),
      note_body: getNullableText(formData, "noteBody"),
      visibility: getVisibility(formData),
      status: getLessonNoteStatus(formData)
    })
    .eq("id", lessonNoteId)
    .eq("student_user_id", studentId);

  if (error) {
    throw error;
  }

  revalidateLessonRoutes(studentId);
  redirect(`/students/${studentId}/lessons`);
}

export async function archiveLessonNote(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const lessonNoteId = getText(formData, "lessonNoteId");

  if (!UUID_PATTERN.test(lessonNoteId)) {
    throw new Error("Invalid lesson note id.");
  }

  const supabase = await assertCanManage(studentId);
  const { error } = await supabase
    .from("lesson_notes")
    .update({ status: "archived" })
    .eq("id", lessonNoteId)
    .eq("student_user_id", studentId);

  if (error) {
    throw error;
  }

  revalidateLessonRoutes(studentId);
  redirect(`/students/${studentId}/lessons`);
}
