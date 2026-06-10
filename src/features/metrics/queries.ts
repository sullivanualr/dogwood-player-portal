import { cache } from "react";
import { notFound } from "next/navigation";
import {
  canManageFitnessProgressMetrics,
  canManageProgressMetrics,
  canViewStudent
} from "@/lib/auth/permissions";
import type { Database } from "@/lib/db/types";
import { createClient } from "@/lib/supabase/server";
import { FITNESS_METRIC_CATEGORIES } from "@/features/metrics/constants";

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
): Promise<ProgressMetricsPageData> => {
  if (!UUID_PATTERN.test(studentId)) {
    notFound();
  }

  const supabase = await createClient();
  const canView = await canViewStudent(supabase, studentId);

  if (!canView) {
    notFound();
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email")
    .eq("id", studentId)
    .maybeSingle();

  if (profileError || !profile) {
    notFound();
  }

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
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email
    },
    metrics: metrics ?? [],
    canManageAll,
    canManageFitness
  };
});
