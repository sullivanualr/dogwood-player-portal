import { cache } from "react";
import {
  canManageFitnessProgressMetrics,
  canManageProgressMetrics
} from "@/lib/auth/permissions";
import type { Database } from "@/lib/db/types";
import { FITNESS_METRIC_CATEGORIES } from "@/features/metrics/constants";
import {
  getStudentPageAccess,
  type StudentFeatureUnavailableData
} from "@/features/students/page-access";

export type ProgressMetric =
  Database["public"]["Tables"]["progress_metrics"]["Row"];

export type ProgressMetricsPageData = {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  metrics: ProgressMetric[];
  canManageAll: boolean;
  canManageFitness: boolean;
};

export const getProgressMetricsPageData = cache(async (
  studentId: string
): Promise<ProgressMetricsPageData | StudentFeatureUnavailableData> => {
  const access = await getStudentPageAccess(studentId);

  if (access.status !== "ok") {
    return { status: access.status };
  }

  const { student, supabase } = access;
  const canManageAll = await canManageProgressMetrics(supabase, studentId);
  const canManageFitness = canManageAll
    ? false
    : await canManageFitnessProgressMetrics(supabase, studentId);
  let metricsQuery = supabase
    .from("progress_metrics")
    .select("*")
    .eq("student_user_id", studentId);

  if (canManageFitness) {
    metricsQuery = metricsQuery.in(
      "category",
      Array.from(FITNESS_METRIC_CATEGORIES)
    );
  } else if (!canManageAll) {
    metricsQuery = metricsQuery.eq("status", "published");
  }

  const { data: metrics, error: metricsError } = await metricsQuery
    .order("recorded_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (metricsError) {
    throw metricsError;
  }

  return {
    student: {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email
    },
    metrics: metrics ?? [],
    canManageAll,
    canManageFitness
  };
});
