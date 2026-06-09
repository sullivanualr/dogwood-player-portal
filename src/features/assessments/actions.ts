"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  canManageAssessments,
  canManageFitnessAssessments,
  canViewStudent
} from "@/lib/auth/permissions";
import type {
  AssessmentStatus,
  AssessmentType,
  VisibilityLevel
} from "@/lib/db/types";
import { requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import {
  ASSESSMENT_TYPE_OPTIONS,
  FITNESS_ASSESSMENT_TYPES
} from "@/features/assessments/constants";
import { UUID_PATTERN } from "@/features/assessments/queries";

const ASSESSMENT_TYPES = new Set<AssessmentType>(
  ASSESSMENT_TYPE_OPTIONS.map((option) => option.value)
);
const ASSESSMENT_STATUSES = new Set<AssessmentStatus>([
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

function getAssessmentType(formData: FormData) {
  const value = getText(formData, "assessmentType") as AssessmentType;
  return ASSESSMENT_TYPES.has(value) ? value : "other";
}

function getAssessmentStatus(formData: FormData) {
  const value = getText(formData, "status") as AssessmentStatus;
  return ASSESSMENT_STATUSES.has(value) ? value : "draft";
}

function getVisibility(formData: FormData) {
  const value = getText(formData, "visibility") as VisibilityLevel;
  return VISIBILITY_LEVELS.has(value) ? value : "internal";
}

function getAssessmentDate(formData: FormData) {
  const value = getNullableText(formData, "assessmentDate");

  if (!value) {
    throw new Error("Assessment date is required.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Assessment date must use the YYYY-MM-DD format.");
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  const isValidDate =
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;

  if (!isValidDate) {
    throw new Error("Assessment date must be a valid date.");
  }

  return value;
}

function getScore(formData: FormData) {
  const value = getText(formData, "score");

  if (!value) {
    return null;
  }

  const score = Number(value);

  if (!Number.isFinite(score)) {
    throw new Error("Score must be a valid number.");
  }

  return score;
}

async function assertCanManage(studentId: string, assessmentType: AssessmentType) {
  if (!UUID_PATTERN.test(studentId)) {
    throw new Error("Invalid student id.");
  }

  await requireUser();
  const supabase = await createClient();
  const canView = await canViewStudent(supabase, studentId);
  const canManageAll = canView
    ? await canManageAssessments(supabase, studentId)
    : false;
  const canManageFitness = canManageAll
    ? false
    : await canManageFitnessAssessments(supabase, studentId);
  const canManage =
    canManageAll ||
    (canManageFitness && FITNESS_ASSESSMENT_TYPES.has(assessmentType));

  if (!canManage) {
    throw new Error("You do not have permission to manage this assessment.");
  }

  const { data: studentProfile, error: studentProfileError } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("user_id", studentId)
    .maybeSingle();

  if (studentProfileError || !studentProfile) {
    throw new Error("Assessments can only be managed for students.");
  }

  return supabase;
}

function revalidateAssessmentRoutes(studentId: string) {
  revalidatePath(`/students/${studentId}/assessments`);
  revalidatePath(`/students/${studentId}/snapshot`);
}

export async function createAssessment(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const title = getText(formData, "title");
  const assessmentType = getAssessmentType(formData);

  if (!title) {
    throw new Error("Title is required.");
  }

  const user = await requireUser();
  const supabase = await assertCanManage(studentId, assessmentType);
  const { error } = await supabase.from("assessments").insert({
    student_user_id: studentId,
    created_by_user_id: user.id,
    assessment_type: assessmentType,
    assessment_date: getAssessmentDate(formData),
    title,
    summary: getNullableText(formData, "summary"),
    findings: getNullableText(formData, "findings"),
    score: getScore(formData),
    score_unit: getNullableText(formData, "scoreUnit"),
    visibility: getVisibility(formData),
    status: getAssessmentStatus(formData)
  });

  if (error) {
    throw error;
  }

  revalidateAssessmentRoutes(studentId);
  redirect(`/students/${studentId}/assessments`);
}

export async function updateAssessment(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const assessmentId = getText(formData, "assessmentId");
  const title = getText(formData, "title");
  const assessmentType = getAssessmentType(formData);

  if (!UUID_PATTERN.test(assessmentId)) {
    throw new Error("Invalid assessment id.");
  }

  if (!title) {
    throw new Error("Title is required.");
  }

  const supabase = await assertCanManage(studentId, assessmentType);
  const { error } = await supabase
    .from("assessments")
    .update({
      assessment_type: assessmentType,
      assessment_date: getAssessmentDate(formData),
      title,
      summary: getNullableText(formData, "summary"),
      findings: getNullableText(formData, "findings"),
      score: getScore(formData),
      score_unit: getNullableText(formData, "scoreUnit"),
      visibility: getVisibility(formData),
      status: getAssessmentStatus(formData)
    })
    .eq("id", assessmentId)
    .eq("student_user_id", studentId);

  if (error) {
    throw error;
  }

  revalidateAssessmentRoutes(studentId);
  redirect(`/students/${studentId}/assessments`);
}

export async function archiveAssessment(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const assessmentId = getText(formData, "assessmentId");

  if (!UUID_PATTERN.test(assessmentId)) {
    throw new Error("Invalid assessment id.");
  }

  if (!UUID_PATTERN.test(studentId)) {
    throw new Error("Invalid student id.");
  }

  await requireUser();
  const supabase = await createClient();
  const { data: assessment, error: assessmentError } = await supabase
    .from("assessments")
    .select("assessment_type")
    .eq("id", assessmentId)
    .eq("student_user_id", studentId)
    .maybeSingle();

  if (assessmentError || !assessment) {
    throw new Error("Assessment not found.");
  }

  await assertCanManage(studentId, assessment.assessment_type);
  const { error } = await supabase
    .from("assessments")
    .update({ status: "archived" })
    .eq("id", assessmentId)
    .eq("student_user_id", studentId);

  if (error) {
    throw error;
  }

  revalidateAssessmentRoutes(studentId);
  redirect(`/students/${studentId}/assessments`);
}
