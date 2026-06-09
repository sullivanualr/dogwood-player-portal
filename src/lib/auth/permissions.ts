import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppRole } from "@/lib/auth/roles";
import type { Database } from "@/lib/db/types";

export async function hasRole(
  supabase: SupabaseClient<Database>,
  role: AppRole
) {
  const { data, error } = await supabase.rpc("has_role", {
    role_name: role
  });

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export async function isAdmin(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.rpc("is_admin", {});

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export async function canViewStudent(
  supabase: SupabaseClient<Database>,
  studentUserId: string
) {
  const { data, error } = await supabase.rpc("can_view_student", {
    student_id: studentUserId
  });

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export async function isAssignedCoach(
  supabase: SupabaseClient<Database>,
  studentUserId: string
) {
  const { data, error } = await supabase.rpc("is_assigned_coach", {
    student_id: studentUserId
  });

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export async function isAssignedFitness(
  supabase: SupabaseClient<Database>,
  studentUserId: string
) {
  const { data, error } = await supabase.rpc("is_assigned_fitness", {
    student_id: studentUserId
  });

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export async function canManageDevelopmentPriorities(
  supabase: SupabaseClient<Database>,
  studentUserId: string
) {
  if (await isAdmin(supabase)) {
    return true;
  }

  return isAssignedCoach(supabase, studentUserId);
}

export async function canManageGoals(
  supabase: SupabaseClient<Database>,
  studentUserId: string
) {
  if (await isAdmin(supabase)) {
    return true;
  }

  return isAssignedCoach(supabase, studentUserId);
}

export async function canViewAssignedFitnessGoals(
  supabase: SupabaseClient<Database>,
  studentUserId: string
) {
  return isAssignedFitness(supabase, studentUserId);
}

export async function canManagePracticePlans(
  supabase: SupabaseClient<Database>,
  studentUserId: string
) {
  if (await isAdmin(supabase)) {
    return true;
  }

  return isAssignedCoach(supabase, studentUserId);
}

export async function canViewAssignedFitnessPracticePlans(
  supabase: SupabaseClient<Database>,
  studentUserId: string
) {
  return isAssignedFitness(supabase, studentUserId);
}

export async function canManageLessonNotes(
  supabase: SupabaseClient<Database>,
  studentUserId: string
) {
  if (await isAdmin(supabase)) {
    return true;
  }

  return isAssignedCoach(supabase, studentUserId);
}

export async function canManageAssessments(
  supabase: SupabaseClient<Database>,
  studentUserId: string
) {
  if (await isAdmin(supabase)) {
    return true;
  }

  return isAssignedCoach(supabase, studentUserId);
}

export async function canManageFitnessAssessments(
  supabase: SupabaseClient<Database>,
  studentUserId: string
) {
  return isAssignedFitness(supabase, studentUserId);
}

export async function canManageProgressMetrics(
  supabase: SupabaseClient<Database>,
  studentUserId: string
) {
  if (await isAdmin(supabase)) {
    return true;
  }

  return isAssignedCoach(supabase, studentUserId);
}

export async function canManageFitnessProgressMetrics(
  supabase: SupabaseClient<Database>,
  studentUserId: string
) {
  return isAssignedFitness(supabase, studentUserId);
}

export async function canManageTournamentResults(
  supabase: SupabaseClient<Database>,
  studentUserId: string
) {
  if (await isAdmin(supabase)) {
    return true;
  }

  return isAssignedCoach(supabase, studentUserId);
}

export async function canManageAssets(
  supabase: SupabaseClient<Database>,
  studentUserId: string
) {
  if (await isAdmin(supabase)) {
    return true;
  }

  return isAssignedCoach(supabase, studentUserId);
}

export async function canManageFitnessAssets(
  supabase: SupabaseClient<Database>,
  studentUserId: string
) {
  return isAssignedFitness(supabase, studentUserId);
}

export async function canManageFitnessProgramming(
  supabase: SupabaseClient<Database>,
  studentUserId: string
) {
  if (await isAdmin(supabase)) {
    return true;
  }

  return isAssignedFitness(supabase, studentUserId);
}
