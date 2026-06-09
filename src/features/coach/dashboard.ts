import { cache } from "react";
import { redirect } from "next/navigation";
import {
  getCurrentUserDefaultPath,
  getCurrentUserRoles,
  requireUser
} from "@/lib/auth/server";
import type { AppRole } from "@/lib/auth/roles";
import type { AssessmentType, Database } from "@/lib/db/types";
import { createClient } from "@/lib/supabase/server";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProgramRow = Database["public"]["Tables"]["programs"]["Row"];
type DevelopmentPriorityRow =
  Database["public"]["Tables"]["development_priorities"]["Row"];
type LessonNoteRow = Database["public"]["Tables"]["lesson_notes"]["Row"];
type PracticePlanRow = Database["public"]["Tables"]["practice_plans"]["Row"];
type StudentGoalRow = Database["public"]["Tables"]["student_goals"]["Row"];
type TournamentResultRow =
  Database["public"]["Tables"]["tournament_results"]["Row"];
type AssessmentRow = Database["public"]["Tables"]["assessments"]["Row"];

export type CoachDashboardStudent = {
  id: string;
  name: string;
  email: string;
  program: Pick<ProgramRow, "id" | "name"> | null;
  developmentPriorities: Pick<
    DevelopmentPriorityRow,
    "id" | "title" | "priority_level"
  >[];
  latestLessonNote: Pick<LessonNoteRow, "id" | "lesson_date" | "title"> | null;
  currentPracticePlan: Pick<
    PracticePlanRow,
    "id" | "title" | "due_date"
  > | null;
  activeGoalsCount: number;
  upcomingTournament: Pick<
    TournamentResultRow,
    "id" | "event_name" | "start_date"
  > | null;
  recentAssessment: Pick<
    AssessmentRow,
    "id" | "title" | "assessment_type" | "assessment_date"
  > | null;
};

export type CoachDashboardData = {
  canViewAsAdmin: boolean;
  students: CoachDashboardStudent[];
};

const ASSESSMENT_TYPE_LABELS: Record<AssessmentType, string> = {
  trackman_combine: "TrackMan Combine",
  upgame_assessment: "Upgame Assessment",
  wedge_test: "Wedge Test",
  putting_test: "Putting Test",
  speed_test: "Speed Test",
  skills_assessment: "Skills Assessment",
  movement_screen: "Movement Screen",
  fitness_assessment: "Fitness Assessment",
  other: "Other"
};

function hasAllowedRole(roles: AppRole[]) {
  return roles.includes("coach") || roles.includes("admin");
}

function fullName(profile: Pick<ProfileRow, "first_name" | "last_name">) {
  return `${profile.first_name} ${profile.last_name}`;
}

function firstByStudentId<Row extends { student_user_id: string }>(rows: Row[]) {
  const byStudentId = new Map<string, Row>();

  for (const row of rows) {
    if (!byStudentId.has(row.student_user_id)) {
      byStudentId.set(row.student_user_id, row);
    }
  }

  return byStudentId;
}

function prioritiesByStudentId(rows: DevelopmentPriorityRow[]) {
  const byStudentId = new Map<string, DevelopmentPriorityRow[]>();

  for (const row of rows) {
    const existing = byStudentId.get(row.student_user_id) ?? [];
    existing.push(row);
    byStudentId.set(row.student_user_id, existing);
  }

  return byStudentId;
}

function activeGoalCountsByStudentId(rows: StudentGoalRow[]) {
  const counts = new Map<string, number>();

  for (const row of rows) {
    counts.set(row.student_user_id, (counts.get(row.student_user_id) ?? 0) + 1);
  }

  return counts;
}

export function getAssessmentTypeLabel(assessmentType: AssessmentType) {
  return ASSESSMENT_TYPE_LABELS[assessmentType];
}

export const getCoachDashboardData = cache(async () => {
  const user = await requireUser();
  const roles = await getCurrentUserRoles();

  if (!hasAllowedRole(roles)) {
    redirect(await getCurrentUserDefaultPath());
  }

  const supabase = await createClient();
  const canViewAsAdmin = roles.includes("admin");
  const today = new Date().toISOString().slice(0, 10);
  let studentIds: string[] = [];

  if (canViewAsAdmin) {
    const { data: studentProfiles, error } = await supabase
      .from("student_profiles")
      .select("user_id")
      .eq("status", "active");

    if (error) {
      throw error;
    }

    studentIds = (studentProfiles ?? []).map((profile) => profile.user_id);
  } else {
    const { data: assignments, error } = await supabase
      .from("coach_student_assignments")
      .select("student_user_id")
      .eq("coach_user_id", user.id)
      .eq("status", "active")
      .lte("start_date", today)
      .or(`end_date.is.null,end_date.gte.${today}`);

    if (error) {
      throw error;
    }

    studentIds = (assignments ?? []).map(
      (assignment) => assignment.student_user_id
    );
  }

  studentIds = Array.from(new Set(studentIds));

  if (!studentIds.length) {
    return {
      canViewAsAdmin,
      students: []
    } satisfies CoachDashboardData;
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .in("id", studentIds)
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  if (profilesError) {
    throw profilesError;
  }

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("student_program_enrollments")
    .select("*")
    .in("student_user_id", studentIds)
    .eq("status", "active")
    .lte("start_date", today)
    .or(`end_date.is.null,end_date.gte.${today}`)
    .order("start_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (enrollmentsError) {
    throw enrollmentsError;
  }

  const enrollmentByStudentId = firstByStudentId(enrollments ?? []);
  const programIds = Array.from(
    new Set((enrollments ?? []).map((enrollment) => enrollment.program_id))
  );

  let programsById = new Map<string, ProgramRow>();

  if (programIds.length) {
    const { data: programs, error: programsError } = await supabase
      .from("programs")
      .select("*")
      .in("id", programIds);

    if (programsError) {
      throw programsError;
    }

    programsById = new Map(
      (programs ?? []).map((program) => [program.id, program])
    );
  }

  const { data: priorities, error: prioritiesError } = await supabase
    .from("development_priorities")
    .select("*")
    .in("student_user_id", studentIds)
    .eq("status", "active")
    .order("sort_order", { ascending: true })
    .order("target_date", { ascending: true, nullsFirst: false });

  if (prioritiesError) {
    throw prioritiesError;
  }

  const { data: lessonNotes, error: lessonNotesError } = await supabase
    .from("lesson_notes")
    .select("*")
    .in("student_user_id", studentIds)
    .neq("status", "archived")
    .order("lesson_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (lessonNotesError) {
    throw lessonNotesError;
  }

  const { data: practicePlans, error: practicePlansError } = await supabase
    .from("practice_plans")
    .select("*")
    .in("student_user_id", studentIds)
    .eq("status", "active")
    .order("assigned_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (practicePlansError) {
    throw practicePlansError;
  }

  const { data: activeGoals, error: activeGoalsError } = await supabase
    .from("student_goals")
    .select("*")
    .in("student_user_id", studentIds)
    .eq("status", "active");

  if (activeGoalsError) {
    throw activeGoalsError;
  }

  const { data: upcomingTournaments, error: upcomingTournamentsError } =
    await supabase
      .from("tournament_results")
      .select("*")
      .in("student_user_id", studentIds)
      .eq("status", "upcoming")
      .gte("start_date", today)
      .order("start_date", { ascending: true })
      .order("created_at", { ascending: false });

  if (upcomingTournamentsError) {
    throw upcomingTournamentsError;
  }

  const { data: recentAssessments, error: recentAssessmentsError } =
    await supabase
      .from("assessments")
      .select("*")
      .in("student_user_id", studentIds)
      .neq("status", "archived")
      .order("assessment_date", { ascending: false })
      .order("created_at", { ascending: false });

  if (recentAssessmentsError) {
    throw recentAssessmentsError;
  }

  const prioritiesByStudent = prioritiesByStudentId(priorities ?? []);
  const lessonByStudent = firstByStudentId(lessonNotes ?? []);
  const practicePlanByStudent = firstByStudentId(practicePlans ?? []);
  const goalCountsByStudent = activeGoalCountsByStudentId(activeGoals ?? []);
  const tournamentByStudent = firstByStudentId(upcomingTournaments ?? []);
  const assessmentByStudent = firstByStudentId(recentAssessments ?? []);

  const students = (profiles ?? []).map((profile) => {
    const enrollment = enrollmentByStudentId.get(profile.id);
    const program = enrollment
      ? programsById.get(enrollment.program_id) ?? null
      : null;

    return {
      id: profile.id,
      name: fullName(profile),
      email: profile.email,
      program: program ? { id: program.id, name: program.name } : null,
      developmentPriorities: (
        prioritiesByStudent.get(profile.id) ?? []
      ).slice(0, 3),
      latestLessonNote: lessonByStudent.get(profile.id) ?? null,
      currentPracticePlan: practicePlanByStudent.get(profile.id) ?? null,
      activeGoalsCount: goalCountsByStudent.get(profile.id) ?? 0,
      upcomingTournament: tournamentByStudent.get(profile.id) ?? null,
      recentAssessment: assessmentByStudent.get(profile.id) ?? null
    };
  });

  return {
    canViewAsAdmin,
    students
  } satisfies CoachDashboardData;
});
