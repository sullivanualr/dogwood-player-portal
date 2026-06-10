import { cache } from "react";
import { notFound } from "next/navigation";
import {
  canManageGoals,
  canViewAssignedFitnessGoals,
  canViewStudent
} from "@/lib/auth/permissions";
import type { Database } from "@/lib/db/types";
import { createClient } from "@/lib/supabase/server";

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

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
): Promise<GoalsPageData> => {
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
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email
    },
    goals: goals ?? [],
    canManage
  };
});
