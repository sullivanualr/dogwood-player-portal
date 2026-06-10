import { cache } from "react";
import {
  canManageTournamentResults,
  isAssignedFitness
} from "@/lib/auth/permissions";
import type { Database } from "@/lib/db/types";
import {
  getStudentPageAccess,
  type StudentFeatureUnavailableData
} from "@/features/students/page-access";

export type TournamentResult =
  Database["public"]["Tables"]["tournament_results"]["Row"];

export type TournamentResultsPageData = {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  tournaments: TournamentResult[];
  canManage: boolean;
};

export const getTournamentResultsPageData = cache(async (
  studentId: string
): Promise<TournamentResultsPageData | StudentFeatureUnavailableData> => {
  const access = await getStudentPageAccess(studentId);

  if (access.status !== "ok") {
    return { status: access.status };
  }

  const { student, supabase } = access;
  const canManage = await canManageTournamentResults(supabase, studentId);
  const canViewAsFitness = canManage
    ? false
    : await isAssignedFitness(supabase, studentId);
  let tournamentsQuery = supabase
    .from("tournament_results")
    .select("*")
    .eq("student_user_id", studentId);

  if (!canManage && !canViewAsFitness) {
    tournamentsQuery = tournamentsQuery.neq("status", "archived");
  }

  const { data: tournaments, error: tournamentsError } = await tournamentsQuery
    .order("start_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (tournamentsError) {
    throw tournamentsError;
  }

  return {
    student: {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email
    },
    tournaments: tournaments ?? [],
    canManage
  };
});
