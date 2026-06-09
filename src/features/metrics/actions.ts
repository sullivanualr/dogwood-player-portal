"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  canManageFitnessProgressMetrics,
  canManageProgressMetrics,
  canViewStudent
} from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/server";
import type {
  MetricCategory,
  ProgressMetricStatus,
  VisibilityLevel
} from "@/lib/db/types";
import { createClient } from "@/lib/supabase/server";
import {
  FITNESS_METRIC_CATEGORIES,
  METRIC_CATEGORY_OPTIONS
} from "@/features/metrics/constants";
import { UUID_PATTERN } from "@/features/metrics/queries";

const METRIC_CATEGORIES = new Set<MetricCategory>(
  METRIC_CATEGORY_OPTIONS.map((option) => option.value)
);
const PROGRESS_METRIC_STATUSES = new Set<ProgressMetricStatus>([
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

function getMetricCategory(formData: FormData) {
  const value = getText(formData, "category") as MetricCategory;
  return METRIC_CATEGORIES.has(value) ? value : "custom";
}

function getProgressMetricStatus(formData: FormData) {
  const value = getText(formData, "status") as ProgressMetricStatus;
  return PROGRESS_METRIC_STATUSES.has(value) ? value : "draft";
}

function getVisibility(formData: FormData) {
  const value = getText(formData, "visibility") as VisibilityLevel;
  return VISIBILITY_LEVELS.has(value) ? value : "internal";
}

function getMetricValue(formData: FormData) {
  const value = getText(formData, "value");

  if (!value) {
    throw new Error("Value is required.");
  }

  const metricValue = Number(value);

  if (!Number.isFinite(metricValue)) {
    throw new Error("Value must be a valid number.");
  }

  return metricValue;
}

function getRecordedAt(formData: FormData) {
  const value = getNullableText(formData, "recordedAt");

  if (!value) {
    throw new Error("Recorded date/time is required.");
  }

  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    throw new Error("Recorded date/time must use the YYYY-MM-DDTHH:mm format.");
  }

  const recordedAt = new Date(value);

  if (Number.isNaN(recordedAt.getTime())) {
    throw new Error("Recorded date/time must be valid.");
  }

  return recordedAt.toISOString();
}

async function assertCanManage(studentId: string, category: MetricCategory) {
  if (!UUID_PATTERN.test(studentId)) {
    throw new Error("Invalid student id.");
  }

  await requireUser();
  const supabase = await createClient();
  const canView = await canViewStudent(supabase, studentId);
  const canManageAll = canView
    ? await canManageProgressMetrics(supabase, studentId)
    : false;
  const canManageFitness = canManageAll
    ? false
    : await canManageFitnessProgressMetrics(supabase, studentId);
  const canManage =
    canManageAll ||
    (canManageFitness && FITNESS_METRIC_CATEGORIES.has(category));

  if (!canManage) {
    throw new Error(
      "You do not have permission to manage this progress metric."
    );
  }

  const { data: studentProfile, error: studentProfileError } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("user_id", studentId)
    .maybeSingle();

  if (studentProfileError || !studentProfile) {
    throw new Error("Progress metrics can only be managed for students.");
  }

  return supabase;
}

function revalidateMetricRoutes(studentId: string) {
  revalidatePath(`/students/${studentId}/metrics`);
  revalidatePath(`/students/${studentId}/snapshot`);
}

export async function createProgressMetric(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const metricName = getText(formData, "metricName");
  const category = getMetricCategory(formData);

  if (!metricName) {
    throw new Error("Metric name is required.");
  }

  const user = await requireUser();
  const supabase = await assertCanManage(studentId, category);
  const { error } = await supabase.from("progress_metrics").insert({
    student_user_id: studentId,
    created_by_user_id: user.id,
    metric_name: metricName,
    category,
    value: getMetricValue(formData),
    unit: getNullableText(formData, "unit"),
    recorded_at: getRecordedAt(formData),
    notes: getNullableText(formData, "notes"),
    visibility: getVisibility(formData),
    status: getProgressMetricStatus(formData)
  });

  if (error) {
    throw error;
  }

  revalidateMetricRoutes(studentId);
  redirect(`/students/${studentId}/metrics`);
}

export async function updateProgressMetric(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const metricId = getText(formData, "metricId");
  const metricName = getText(formData, "metricName");
  const category = getMetricCategory(formData);

  if (!UUID_PATTERN.test(metricId)) {
    throw new Error("Invalid metric id.");
  }

  if (!metricName) {
    throw new Error("Metric name is required.");
  }

  const supabase = await assertCanManage(studentId, category);
  const { error } = await supabase
    .from("progress_metrics")
    .update({
      metric_name: metricName,
      category,
      value: getMetricValue(formData),
      unit: getNullableText(formData, "unit"),
      recorded_at: getRecordedAt(formData),
      notes: getNullableText(formData, "notes"),
      visibility: getVisibility(formData),
      status: getProgressMetricStatus(formData)
    })
    .eq("id", metricId)
    .eq("student_user_id", studentId);

  if (error) {
    throw error;
  }

  revalidateMetricRoutes(studentId);
  redirect(`/students/${studentId}/metrics`);
}

export async function archiveProgressMetric(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const metricId = getText(formData, "metricId");

  if (!UUID_PATTERN.test(metricId)) {
    throw new Error("Invalid metric id.");
  }

  if (!UUID_PATTERN.test(studentId)) {
    throw new Error("Invalid student id.");
  }

  await requireUser();
  const supabase = await createClient();
  const { data: metric, error: metricError } = await supabase
    .from("progress_metrics")
    .select("category")
    .eq("id", metricId)
    .eq("student_user_id", studentId)
    .maybeSingle();

  if (metricError || !metric) {
    throw new Error("Progress metric not found.");
  }

  await assertCanManage(studentId, metric.category);
  const { error } = await supabase
    .from("progress_metrics")
    .update({ status: "archived" })
    .eq("id", metricId)
    .eq("student_user_id", studentId);

  if (error) {
    throw error;
  }

  revalidateMetricRoutes(studentId);
  redirect(`/students/${studentId}/metrics`);
}
