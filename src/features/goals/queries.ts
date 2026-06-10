import { cache } from "react";
import {
  canManageGoals,
  canViewAssignedFitnessGoals
} from "@/lib/auth/permissions";
import type { Database } from "@/lib/db/types";
import {
  getStudentPageAccess,
  type StudentFeatureUnavailableData
} from "@/features/students/page-access";

export { UUID_PATTERN } from "@/features/students/page-access";

export type StudentGoal = Database["public"]["Tables"]["student_goals"]["Row"];

export type GoalsPageData = {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  goals: StudentGoal[];
  canManage: boolean;
};

export const getGoalsPageData = cache(async (
  studentId: string
): Promise<GoalsPageData | StudentFeatureUnavailableData> => {
  const access = await getStudentPageAccess(studentId);

  if (access.status !== "ok") {
    return { status: access.status };
  }

  const { student, supabase } = access;
  const canManage = await canManageGoals(supabase, studentId);
  const canViewAll = canManage
    ? true
    : await canViewAssignedFitnessGoals(supabase, studentId);
  let goalsQuery = supabase
    .from("student_goals")
    .select("*")
    .eq("student_user_id", studentId);

  if (!canViewAll) {
    goalsQuery = goalsQuery.eq("status", "active");
  }

  const { data: goals, error: goalsError } = await goalsQuery
    .order("status", { ascending: true })
    .order("target_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (goalsError) {
    throw goalsError;
  }

  return {
    student: {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email
    },
    goals: goals ?? [],
    canManage
  };
});
