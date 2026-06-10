import { cache } from "react";
import { notFound } from "next/navigation";
import { canManageLessonNotes, canViewStudent } from "@/lib/auth/permissions";
import type { Assessment } from "@/features/assessments/queries";
import type { VideoAsset } from "@/features/files/queries";
import type { WorkoutAssignment } from "@/features/fitness/queries";
import type { StudentGoal } from "@/features/goals/queries";
import type { LessonNote } from "@/features/lessons/queries";
import type { ProgressMetric } from "@/features/metrics/queries";
import type { PracticePlanWithItems } from "@/features/practice-plans/queries";
import type { DevelopmentPriority } from "@/features/priorities/queries";
import type { TournamentResult } from "@/features/tournaments/queries";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type StudentSnapshotData = {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    juniorPlayer: boolean | null;
    graduationYear: number | null;
    school: string | null;
    handedness: string | null;
  };
  coach: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isPrimary: boolean;
  } | null;
  program: {
    id: string;
    name: string;
    description: string | null;
  } | null;
  developmentPriorities: DevelopmentPriority[];
  goals: StudentGoal[];
  practicePlan: PracticePlanWithItems | null;
  assessments: Assessment[];
  progressMetrics: ProgressMetric[];
  upcomingTournaments: TournamentResult[];
  recentTournamentResults: TournamentResult[];
  lessonNote: LessonNote | null;
  latestVideo: VideoAsset | null;
  workoutAssignments: WorkoutAssignment[];
  canManageLessonNotes: boolean;
};

export const getStudentSnapshot = cache(async (studentId: string) => {
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

  const { data: studentProfile } = await supabase
    .from("student_profiles")
    .select("junior_player, graduation_year, school, handedness")
    .eq("user_id", studentId)
    .maybeSingle();

  const today = new Date().toISOString().slice(0, 10);
  const { data: coachAssignment, error: coachAssignmentError } = await supabase
    .from("coach_student_assignments")
    .select("coach_user_id, is_primary")
    .eq("student_user_id", studentId)
    .eq("status", "active")
    .lte("start_date", today)
    .or(`end_date.is.null,end_date.gte.${today}`)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (coachAssignmentError) {
    throw coachAssignmentError;
  }

  const coach = coachAssignment?.coach_user_id
    ? await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .eq("id", coachAssignment.coach_user_id)
        .maybeSingle()
    : null;

  if (coach?.error) {
    throw coach.error;
  }

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("student_program_enrollments")
    .select("program_id")
    .eq("student_user_id", studentId)
    .eq("status", "active")
    .lte("start_date", today)
    .or(`end_date.is.null,end_date.gte.${today}`)
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (enrollmentError) {
    throw enrollmentError;
  }

  const program = enrollment?.program_id
    ? await supabase
        .from("programs")
        .select("id, name, description")
        .eq("id", enrollment.program_id)
        .maybeSingle()
    : null;

  if (program?.error) {
    throw program.error;
  }

  const { data: developmentPriorities, error: prioritiesError } =
    await supabase
      .from("development_priorities")
      .select("*")
      .eq("student_user_id", studentId)
      .eq("status", "active")
      .order("sort_order", { ascending: true })
      .order("target_date", { ascending: true, nullsFirst: false });

  if (prioritiesError) {
    throw prioritiesError;
  }

  const { data: goals, error: goalsError } = await supabase
    .from("student_goals")
    .select("*")
    .eq("student_user_id", studentId)
    .eq("status", "active")
    .order("target_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (goalsError) {
    throw goalsError;
  }

  const { data: practicePlan, error: practicePlanError } = await supabase
    .from("practice_plans")
    .select("*")
    .eq("student_user_id", studentId)
    .eq("status", "active")
    .order("assigned_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (practicePlanError) {
    throw practicePlanError;
  }

  const { data: assessments, error: assessmentsError } = await supabase
    .from("assessments")
    .select("*")
    .eq("student_user_id", studentId)
    .eq("status", "published")
    .order("assessment_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(3);

  if (assessmentsError) {
    throw assessmentsError;
  }

  const { data: progressMetrics, error: progressMetricsError } = await supabase
    .from("progress_metrics")
    .select("*")
    .eq("student_user_id", studentId)
    .eq("status", "published")
    .order("recorded_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(4);

  if (progressMetricsError) {
    throw progressMetricsError;
  }

  const { data: upcomingTournaments, error: upcomingTournamentsError } =
    await supabase
      .from("tournament_results")
      .select("*")
      .eq("student_user_id", studentId)
      .eq("status", "upcoming")
      .gte("start_date", today)
      .order("start_date", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(3);

  if (upcomingTournamentsError) {
    throw upcomingTournamentsError;
  }

  const { data: recentTournamentResults, error: recentTournamentsError } =
    await supabase
      .from("tournament_results")
      .select("*")
      .eq("student_user_id", studentId)
      .eq("status", "completed")
      .order("start_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(3);

  if (recentTournamentsError) {
    throw recentTournamentsError;
  }

  let practicePlanItems: PracticePlanWithItems["items"] = [];

  if (practicePlan) {
    const { data: itemRows, error: practicePlanItemsError } = await supabase
      .from("practice_plan_items")
      .select("*")
      .eq("practice_plan_id", practicePlan.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (practicePlanItemsError) {
      throw practicePlanItemsError;
    }

    practicePlanItems = itemRows ?? [];
  }

  const { data: lessonNote, error: lessonNoteError } = await supabase
    .from("lesson_notes")
    .select("*")
    .eq("student_user_id", studentId)
    .eq("status", "published")
    .order("lesson_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lessonNoteError) {
    throw lessonNoteError;
  }

  const { data: latestVideo, error: latestVideoError } = await supabase
    .from("video_assets")
    .select("*")
    .eq("student_user_id", studentId)
    .neq("status", "archived")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestVideoError) {
    throw latestVideoError;
  }

  const { data: workoutAssignments, error: workoutAssignmentsError } =
    await supabase
      .from("workout_assignments")
      .select("*")
      .eq("student_user_id", studentId)
      .neq("status", "archived")
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("assigned_date", { ascending: false })
      .limit(3);

  if (workoutAssignmentsError) {
    throw workoutAssignmentsError;
  }

  const canManageLessonNotesForStudent = await canManageLessonNotes(
    supabase,
    studentId
  );

  return {
    student: {
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email,
      juniorPlayer: studentProfile?.junior_player ?? null,
      graduationYear: studentProfile?.graduation_year ?? null,
      school: studentProfile?.school ?? null,
      handedness: studentProfile?.handedness ?? null
    },
    coach: coach?.data
      ? {
          id: coach.data.id,
          firstName: coach.data.first_name,
          lastName: coach.data.last_name,
          email: coach.data.email,
          isPrimary: coachAssignment?.is_primary ?? false
        }
      : null,
    program: program?.data
      ? {
          id: program.data.id,
          name: program.data.name,
          description: program.data.description
      }
      : null,
    developmentPriorities: developmentPriorities ?? [],
    goals: goals ?? [],
    practicePlan: practicePlan
      ? {
          ...practicePlan,
          items: practicePlanItems
        }
      : null,
    assessments: assessments ?? [],
    progressMetrics: progressMetrics ?? [],
    upcomingTournaments: upcomingTournaments ?? [],
    recentTournamentResults: recentTournamentResults ?? [],
    lessonNote: lessonNote ?? null,
    latestVideo: latestVideo ?? null,
    workoutAssignments: workoutAssignments ?? [],
    canManageLessonNotes: canManageLessonNotesForStudent
  } satisfies StudentSnapshotData;
});
