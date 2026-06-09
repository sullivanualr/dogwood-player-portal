import { cache } from "react";
import { requireUser, requireRole } from "@/lib/auth/server";
import type {
  AssessmentType,
  Database,
  WorkoutCompletionState
} from "@/lib/db/types";
import { createClient } from "@/lib/supabase/server";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProgramRow = Database["public"]["Tables"]["programs"]["Row"];
type DevelopmentPriorityRow =
  Database["public"]["Tables"]["development_priorities"]["Row"];
type LessonNoteRow = Database["public"]["Tables"]["lesson_notes"]["Row"];
type PracticePlanRow = Database["public"]["Tables"]["practice_plans"]["Row"];
type StudentGoalRow = Database["public"]["Tables"]["student_goals"]["Row"];
type AssessmentRow = Database["public"]["Tables"]["assessments"]["Row"];
type TournamentResultRow =
  Database["public"]["Tables"]["tournament_results"]["Row"];
type WorkoutAssignmentRow =
  Database["public"]["Tables"]["workout_assignments"]["Row"];

export type ParentDashboardStudent = {
  id: string;
  name: string;
  email: string;
  program: Pick<ProgramRow, "id" | "name"> | null;
  developmentPriorities: Pick<
    DevelopmentPriorityRow,
    "id" | "title" | "priority_level"
  >[];
  activeGoalsCount: number;
  currentPracticePlan: Pick<
    PracticePlanRow,
    "id" | "title" | "due_date"
  > | null;
  latestLessonNote: Pick<LessonNoteRow, "id" | "lesson_date" | "title"> | null;
  recentAssessment: Pick<
    AssessmentRow,
    "id" | "title" | "assessment_type" | "assessment_date"
  > | null;
  upcomingTournament: Pick<
    TournamentResultRow,
    "id" | "event_name" | "start_date"
  > | null;
  workoutStatus: {
    total: number;
    byState: Record<WorkoutCompletionState, number>;
  };
};

export type ParentDashboardData = {
  students: ParentDashboardStudent[];
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

const EMPTY_WORKOUT_COUNTS: Record<WorkoutCompletionState, number> = {
  not_started: 0,
  in_progress: 0,
  completed: 0,
  missed: 0
};

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

function workoutStatusByStudentId(rows: WorkoutAssignmentRow[]) {
  const statuses = new Map<
    string,
    {
      total: number;
      byState: Record<WorkoutCompletionState, number>;
    }
  >();

  for (const row of rows) {
    const existing =
      statuses.get(row.student_user_id) ?? {
        total: 0,
        byState: { ...EMPTY_WORKOUT_COUNTS }
      };

    existing.total += 1;
    existing.byState[row.completion_state] += 1;
    statuses.set(row.student_user_id, existing);
  }

  return statuses;
}

export function getParentAssessmentTypeLabel(assessmentType: AssessmentType) {
  return ASSESSMENT_TYPE_LABELS[assessmentType];
}

export const getParentDashboardData = cache(async () => {
  const user = await requireUser();
  await requireRole("parent");

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: parentLinks, error: parentLinksError } = await supabase
    .from("parent_student_links")
    .select("student_user_id")
    .eq("parent_user_id", user.id)
    .eq("status", "active");

  if (parentLinksError) {
    throw parentLinksError;
  }

  let studentIds = Array.from(
    new Set((parentLinks ?? []).map((link) => link.student_user_id))
  );

  if (!studentIds.length) {
    return {
      students: []
    } satisfies ParentDashboardData;
  }

  const { data: studentProfiles, error: studentProfilesError } = await supabase
    .from("student_profiles")
    .select("user_id")
    .in("user_id", studentIds)
    .eq("status", "active");

  if (studentProfilesError) {
    throw studentProfilesError;
  }

  studentIds = Array.from(
    new Set((studentProfiles ?? []).map((profile) => profile.user_id))
  );

  if (!studentIds.length) {
    return {
      students: []
    } satisfies ParentDashboardData;
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

  const { data: activeGoals, error: activeGoalsError } = await supabase
    .from("student_goals")
    .select("*")
    .in("student_user_id", studentIds)
    .eq("status", "active");

  if (activeGoalsError) {
    throw activeGoalsError;
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

  const { data: lessonNotes, error: lessonNotesError } = await supabase
    .from("lesson_notes")
    .select("*")
    .in("student_user_id", studentIds)
    .eq("status", "published")
    .eq("visibility", "student_parent")
    .order("lesson_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (lessonNotesError) {
    throw lessonNotesError;
  }

  const { data: assessments, error: assessmentsError } = await supabase
    .from("assessments")
    .select("*")
    .in("student_user_id", studentIds)
    .eq("status", "published")
    .eq("visibility", "student_parent")
    .order("assessment_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (assessmentsError) {
    throw assessmentsError;
  }

  const { data: tournaments, error: tournamentsError } = await supabase
    .from("tournament_results")
    .select("*")
    .in("student_user_id", studentIds)
    .eq("status", "upcoming")
    .eq("visibility", "student_parent")
    .gte("start_date", today)
    .order("start_date", { ascending: true })
    .order("created_at", { ascending: false });

  if (tournamentsError) {
    throw tournamentsError;
  }

  const { data: workoutAssignments, error: workoutAssignmentsError } =
    await supabase
      .from("workout_assignments")
      .select("*")
      .in("student_user_id", studentIds)
      .neq("status", "archived")
      .eq("visibility", "student_parent")
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("assigned_date", { ascending: false });

  if (workoutAssignmentsError) {
    throw workoutAssignmentsError;
  }

  const prioritiesByStudent = prioritiesByStudentId(priorities ?? []);
  const goalCountsByStudent = activeGoalCountsByStudentId(activeGoals ?? []);
  const practicePlanByStudent = firstByStudentId(practicePlans ?? []);
  const lessonNoteByStudent = firstByStudentId(lessonNotes ?? []);
  const assessmentByStudent = firstByStudentId(assessments ?? []);
  const tournamentByStudent = firstByStudentId(tournaments ?? []);
  const workoutStatusByStudent = workoutStatusByStudentId(
    workoutAssignments ?? []
  );

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
      activeGoalsCount: goalCountsByStudent.get(profile.id) ?? 0,
      currentPracticePlan: practicePlanByStudent.get(profile.id) ?? null,
      latestLessonNote: lessonNoteByStudent.get(profile.id) ?? null,
      recentAssessment: assessmentByStudent.get(profile.id) ?? null,
      upcomingTournament: tournamentByStudent.get(profile.id) ?? null,
      workoutStatus:
        workoutStatusByStudent.get(profile.id) ?? {
          total: 0,
          byState: { ...EMPTY_WORKOUT_COUNTS }
        }
    };
  });

  return {
    students
  } satisfies ParentDashboardData;
});
