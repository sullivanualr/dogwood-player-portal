import { cache } from "react";
import {
  canManageFitnessProgramming,
  isAssignedCoach
} from "@/lib/auth/permissions";
import type { Database } from "@/lib/db/types";
import {
  getStudentPageAccess,
  type StudentFeatureUnavailableData
} from "@/features/students/page-access";

export { UUID_PATTERN } from "@/features/students/page-access";

export type FitnessPlan =
  Database["public"]["Tables"]["fitness_plans"]["Row"];
export type WorkoutAssignment =
  Database["public"]["Tables"]["workout_assignments"]["Row"];

export type FitnessPageData = {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  fitnessPlans: FitnessPlan[];
  workoutAssignments: WorkoutAssignment[];
  canManage: boolean;
  canUpdateOwnCompletion: boolean;
};

export const getFitnessPageData = cache(async (
  studentId: string
): Promise<FitnessPageData | StudentFeatureUnavailableData> => {
  const access = await getStudentPageAccess(studentId);

  if (access.status !== "ok") {
    return { status: access.status };
  }

  const { student, supabase } = access;
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const canManage = await canManageFitnessProgramming(supabase, studentId);
  const canViewAsCoach = canManage
    ? false
    : await isAssignedCoach(supabase, studentId);
  const canUpdateOwnCompletion = user?.id === studentId;
  let fitnessPlansQuery = supabase
    .from("fitness_plans")
    .select("*")
    .eq("student_user_id", studentId);
  let workoutAssignmentsQuery = supabase
    .from("workout_assignments")
    .select("*")
    .eq("student_user_id", studentId);

  if (!canManage && !canViewAsCoach) {
    fitnessPlansQuery = fitnessPlansQuery
      .neq("status", "archived")
      .eq("visibility", "student_parent");
    workoutAssignmentsQuery = workoutAssignmentsQuery
      .neq("status", "archived")
      .eq("visibility", "student_parent");
  }

  const { data: fitnessPlans, error: fitnessPlansError } =
    await fitnessPlansQuery
      .order("assigned_date", { ascending: false })
      .order("created_at", { ascending: false });

  if (fitnessPlansError) {
    throw fitnessPlansError;
  }

  const { data: workoutAssignments, error: workoutAssignmentsError } =
    await workoutAssignmentsQuery
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("assigned_date", { ascending: false })
      .order("created_at", { ascending: false });

  if (workoutAssignmentsError) {
    throw workoutAssignmentsError;
  }

  return {
    student: {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email
    },
    fitnessPlans: fitnessPlans ?? [],
    workoutAssignments: workoutAssignments ?? [],
    canManage,
    canUpdateOwnCompletion
  };
});
