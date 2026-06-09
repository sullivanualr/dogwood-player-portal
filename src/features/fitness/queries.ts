import { cache } from "react";
import { notFound } from "next/navigation";
import {
  canManageFitnessProgramming,
  canViewStudent,
  isAssignedCoach
} from "@/lib/auth/permissions";
import type { Database } from "@/lib/db/types";
import { createClient } from "@/lib/supabase/server";

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
): Promise<FitnessPageData> => {
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
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email
    },
    fitnessPlans: fitnessPlans ?? [],
    workoutAssignments: workoutAssignments ?? [],
    canManage,
    canUpdateOwnCompletion
  };
});
