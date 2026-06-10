import { cache } from "react";
import {
  canManageAssessments,
  canManageFitnessAssessments
} from "@/lib/auth/permissions";
import type { Database } from "@/lib/db/types";
import { FITNESS_ASSESSMENT_TYPES } from "@/features/assessments/constants";
import {
  getStudentPageAccess,
  type StudentFeatureUnavailableData
} from "@/features/students/page-access";

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
): Promise<AssessmentsPageData | StudentFeatureUnavailableData> => {
  const access = await getStudentPageAccess(studentId);

  if (access.status !== "ok") {
    return { status: access.status };
  }

  const { student, supabase } = access;
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
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email
    },
    assessments: assessments ?? [],
    canManageAll,
    canManageFitness
  };
});
