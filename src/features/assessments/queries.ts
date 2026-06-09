import { cache } from "react";
import { notFound } from "next/navigation";
import {
  canManageAssessments,
  canManageFitnessAssessments,
  canViewStudent
} from "@/lib/auth/permissions";
import type { Database } from "@/lib/db/types";
import { createClient } from "@/lib/supabase/server";
import { FITNESS_ASSESSMENT_TYPES } from "@/features/assessments/constants";

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

export type Assessment = Database["public"]["Tables"]["assessments"]["Row"];

export type AssessmentsPageData = {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assessments: Assessment[];
  canManageAll: boolean;
  canManageFitness: boolean;
};

export const getAssessmentsPageData = cache(async (
  studentId: string
): Promise<AssessmentsPageData> => {
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

  const { data: studentProfile, error: studentProfileError } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("user_id", studentId)
    .maybeSingle();

  if (studentProfileError || !studentProfile) {
    notFound();
  }

  const canManageAll = await canManageAssessments(supabase, studentId);
  const canManageFitness = canManageAll
    ? false
    : await canManageFitnessAssessments(supabase, studentId);
  let assessmentsQuery = supabase
    .from("assessments")
    .select("*")
    .eq("student_user_id", studentId);

  if (canManageFitness) {
    assessmentsQuery = assessmentsQuery.in(
      "assessment_type",
      Array.from(FITNESS_ASSESSMENT_TYPES)
    );
  } else if (!canManageAll) {
    assessmentsQuery = assessmentsQuery.eq("status", "published");
  }

  const { data: assessments, error: assessmentsError } = await assessmentsQuery
    .order("assessment_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (assessmentsError) {
    throw assessmentsError;
  }

  return {
    student: {
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email
    },
    assessments: assessments ?? [],
    canManageAll,
    canManageFitness
  };
});
