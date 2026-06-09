"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  canManageTournamentResults,
  canViewStudent
} from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/server";
import type { TournamentResultStatus, VisibilityLevel } from "@/lib/db/types";
import { createClient } from "@/lib/supabase/server";
import { TOURNAMENT_STATUS_OPTIONS } from "@/features/tournaments/constants";
import { UUID_PATTERN } from "@/features/tournaments/queries";

const TOURNAMENT_STATUSES = new Set<TournamentResultStatus>(
  TOURNAMENT_STATUS_OPTIONS.map((option) => option.value)
);
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

function getTournamentStatus(formData: FormData) {
  const value = getText(formData, "status") as TournamentResultStatus;
  return TOURNAMENT_STATUSES.has(value) ? value : "upcoming";
}

function getVisibility(formData: FormData) {
  const value = getText(formData, "visibility") as VisibilityLevel;
  return VISIBILITY_LEVELS.has(value) ? value : "internal";
}

function getDate(formData: FormData, key: string, label: string) {
  const value = getNullableText(formData, key);

  if (!value) {
    throw new Error(`${label} is required.`);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} must use the YYYY-MM-DD format.`);
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  const isValidDate =
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;

  if (!isValidDate) {
    throw new Error(`${label} must be a valid date.`);
  }

  return value;
}

function getNullableDate(formData: FormData, key: string, label: string) {
  const value = getNullableText(formData, key);

  if (!value) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} must use the YYYY-MM-DD format.`);
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  const isValidDate =
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;

  if (!isValidDate) {
    throw new Error(`${label} must be a valid date.`);
  }

  return value;
}

function getNullableInteger(formData: FormData, key: string, label: string) {
  const value = getText(formData, key);

  if (!value) {
    return null;
  }

  const numberValue = Number(value);

  if (!Number.isInteger(numberValue)) {
    throw new Error(`${label} must be a whole number.`);
  }

  return numberValue;
}

function getTournamentPayload(formData: FormData) {
  const startDate = getDate(formData, "startDate", "Start date");
  const endDate = getNullableDate(formData, "endDate", "End date");

  if (endDate && endDate < startDate) {
    throw new Error("End date must be on or after the start date.");
  }

  const fieldSize = getNullableInteger(formData, "fieldSize", "Field size");

  if (fieldSize !== null && fieldSize <= 0) {
    throw new Error("Field size must be greater than zero.");
  }

  return {
    event_name: getText(formData, "eventName"),
    event_type: getNullableText(formData, "eventType"),
    start_date: startDate,
    end_date: endDate,
    course_name: getNullableText(formData, "courseName"),
    location: getNullableText(formData, "location"),
    score: getNullableInteger(formData, "score", "Score"),
    finish_position: getNullableText(formData, "finishPosition"),
    field_size: fieldSize,
    status: getTournamentStatus(formData),
    preparation_notes: getNullableText(formData, "preparationNotes"),
    result_notes: getNullableText(formData, "resultNotes"),
    coach_takeaways: getNullableText(formData, "coachTakeaways"),
    visibility: getVisibility(formData)
  };
}

async function assertCanManage(studentId: string) {
  if (!UUID_PATTERN.test(studentId)) {
    throw new Error("Invalid student id.");
  }

  await requireUser();
  const supabase = await createClient();
  const canView = await canViewStudent(supabase, studentId);
  const canManage = canView
    ? await canManageTournamentResults(supabase, studentId)
    : false;

  if (!canManage) {
    throw new Error(
      "You do not have permission to manage this student's tournaments."
    );
  }

  const { data: studentProfile, error: studentProfileError } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("user_id", studentId)
    .maybeSingle();

  if (studentProfileError || !studentProfile) {
    throw new Error("Tournament records can only be managed for students.");
  }

  return supabase;
}

function revalidateTournamentRoutes(studentId: string) {
  revalidatePath(`/students/${studentId}/tournaments`);
  revalidatePath(`/students/${studentId}/snapshot`);
}

export async function createTournamentResult(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const payload = getTournamentPayload(formData);

  if (!payload.event_name) {
    throw new Error("Event name is required.");
  }

  const user = await requireUser();
  const supabase = await assertCanManage(studentId);
  const { error } = await supabase.from("tournament_results").insert({
    student_user_id: studentId,
    created_by_user_id: user.id,
    ...payload
  });

  if (error) {
    throw error;
  }

  revalidateTournamentRoutes(studentId);
  redirect(`/students/${studentId}/tournaments`);
}

export async function updateTournamentResult(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const tournamentId = getText(formData, "tournamentId");
  const payload = getTournamentPayload(formData);

  if (!UUID_PATTERN.test(tournamentId)) {
    throw new Error("Invalid tournament id.");
  }

  if (!payload.event_name) {
    throw new Error("Event name is required.");
  }

  const supabase = await assertCanManage(studentId);
  const { error } = await supabase
    .from("tournament_results")
    .update(payload)
    .eq("id", tournamentId)
    .eq("student_user_id", studentId);

  if (error) {
    throw error;
  }

  revalidateTournamentRoutes(studentId);
  redirect(`/students/${studentId}/tournaments`);
}

export async function archiveTournamentResult(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const tournamentId = getText(formData, "tournamentId");

  if (!UUID_PATTERN.test(tournamentId)) {
    throw new Error("Invalid tournament id.");
  }

  const supabase = await assertCanManage(studentId);
  const { error } = await supabase
    .from("tournament_results")
    .update({ status: "archived" })
    .eq("id", tournamentId)
    .eq("student_user_id", studentId);

  if (error) {
    throw error;
  }

  revalidateTournamentRoutes(studentId);
  redirect(`/students/${studentId}/tournaments`);
}
