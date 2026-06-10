import { cache } from "react";
import { notFound } from "next/navigation";
import {
  canManageTournamentResults,
  canViewStudent,
  isAssignedFitness
} from "@/lib/auth/permissions";
import type { Database } from "@/lib/db/types";
import { createClient } from "@/lib/supabase/server";

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
): Promise<TournamentResultsPageData> => {
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
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email
    },
    tournaments: tournaments ?? [],
    canManage
  };
});
