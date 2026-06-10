import { cache } from "react";
import { requireRole } from "@/lib/auth/server";
import type { AppRole, Database } from "@/lib/db/types";
import { createClient } from "@/lib/supabase/server";

export type AdminProfile = Database["public"]["Tables"]["profiles"]["Row"] & {
  roles: AppRole[];
};
export type AdminProgram = Database["public"]["Tables"]["programs"]["Row"];
export type AdminUserOption = {
  id: string;
  label: string;
};
export type AdminAssignmentRow = {
  id: string;
  label: string;
  status: string;
};
export type AdminStudentRow = {
  id: string;
  name: string;
  email: string;
  juniorPlayer: boolean;
  assignedCoach: string | null;
  currentProgram: string | null;
};

function getFullName(
  profile: Pick<AdminProfile, "first_name" | "last_name" | "email">
) {
  return `${profile.first_name} ${profile.last_name} (${profile.email})`;
}

function mapProfilesById(profiles: AdminProfile[]) {
  return new Map(profiles.map((profile) => [profile.id, profile]));
}

async function getProfilesWithRoles() {
  await requireRole("admin");

  const supabase = await createClient();
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  if (profilesError) {
    throw profilesError;
  }

  const { data: roles, error: rolesError } = await supabase
    .from("roles")
    .select("*");

  if (rolesError) {
    throw rolesError;
  }

  const { data: userRoles, error: userRolesError } = await supabase
    .from("user_roles")
    .select("*");

  if (userRolesError) {
    throw userRolesError;
  }

  const roleNamesById = new Map(
    (roles ?? []).map((role) => [role.id, role.name])
  );
  const rolesByUserId = new Map<string, AppRole[]>();

  for (const userRole of userRoles ?? []) {
    const roleName = roleNamesById.get(userRole.role_id);

    if (!roleName) {
      continue;
    }

    const existing = rolesByUserId.get(userRole.user_id) ?? [];
    existing.push(roleName);
    rolesByUserId.set(userRole.user_id, existing);
  }

  return (profiles ?? []).map((profile) => ({
    ...profile,
    roles: rolesByUserId.get(profile.id) ?? []
  })) satisfies AdminProfile[];
}

export const getAdminUsersData = cache(async () => {
  const profiles = await getProfilesWithRoles();

  return {
    profiles
  };
});

export const getAdminProgramsData = cache(async () => {
  await requireRole("admin");

  const supabase = await createClient();
  const { data: programs, error } = await supabase
    .from("programs")
    .select("*")
    .order("status", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return {
    programs: programs ?? []
  };
});

export const getAdminStudentsData = cache(async () => {
  await requireRole("admin");

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: studentProfiles, error: studentProfilesError } = await supabase
    .from("student_profiles")
    .select("user_id, junior_player")
    .eq("status", "active");

  if (studentProfilesError) {
    throw studentProfilesError;
  }

  const studentIds = Array.from(
    new Set((studentProfiles ?? []).map((profile) => profile.user_id))
  );

  if (!studentIds.length) {
    return {
      students: []
    };
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email")
    .in("id", studentIds)
    .eq("status", "active")
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  if (profilesError) {
    throw profilesError;
  }

  const { data: coachAssignments, error: coachAssignmentsError } =
    await supabase
      .from("coach_student_assignments")
      .select(
        "student_user_id, coach_user_id, is_primary, start_date, created_at"
      )
      .in("student_user_id", studentIds)
      .eq("status", "active")
      .lte("start_date", today)
      .or(`end_date.is.null,end_date.gte.${today}`)
      .order("is_primary", { ascending: false })
      .order("start_date", { ascending: false })
      .order("created_at", { ascending: false });

  if (coachAssignmentsError) {
    throw coachAssignmentsError;
  }

  const coachIds = Array.from(
    new Set(
      (coachAssignments ?? []).map((assignment) => assignment.coach_user_id)
    )
  );
  let coachesById = new Map<
    string,
    Pick<AdminProfile, "first_name" | "last_name" | "email">
  >();

  if (coachIds.length) {
    const { data: coaches, error: coachesError } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email")
      .in("id", coachIds);

    if (coachesError) {
      throw coachesError;
    }

    coachesById = new Map((coaches ?? []).map((coach) => [coach.id, coach]));
  }

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("student_program_enrollments")
    .select("student_user_id, program_id, start_date, created_at")
    .in("student_user_id", studentIds)
    .eq("status", "active")
    .lte("start_date", today)
    .or(`end_date.is.null,end_date.gte.${today}`)
    .order("start_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (enrollmentsError) {
    throw enrollmentsError;
  }

  const programIds = Array.from(
    new Set((enrollments ?? []).map((enrollment) => enrollment.program_id))
  );
  let programsById = new Map<string, AdminProgram>();

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

  const studentProfileByUserId = new Map(
    (studentProfiles ?? []).map((profile) => [profile.user_id, profile])
  );
  const coachByStudentId = new Map<string, string>();

  for (const assignment of coachAssignments ?? []) {
    if (coachByStudentId.has(assignment.student_user_id)) {
      continue;
    }

    const coach = coachesById.get(assignment.coach_user_id);
    coachByStudentId.set(
      assignment.student_user_id,
      coach ? `${coach.first_name} ${coach.last_name}` : "Assigned coach"
    );
  }

  const programByStudentId = new Map<string, string>();

  for (const enrollment of enrollments ?? []) {
    if (programByStudentId.has(enrollment.student_user_id)) {
      continue;
    }

    const program = programsById.get(enrollment.program_id);
    programByStudentId.set(
      enrollment.student_user_id,
      program?.name ?? "Assigned program"
    );
  }

  return {
    students: (profiles ?? []).map((profile) => ({
      id: profile.id,
      name: `${profile.first_name} ${profile.last_name}`,
      email: profile.email,
      juniorPlayer:
        studentProfileByUserId.get(profile.id)?.junior_player ?? false,
      assignedCoach: coachByStudentId.get(profile.id) ?? null,
      currentProgram: programByStudentId.get(profile.id) ?? null
    }))
  } satisfies { students: AdminStudentRow[] };
});

export const getAdminAssignmentsData = cache(async () => {
  const profiles = await getProfilesWithRoles();
  const profileMap = mapProfilesById(profiles);
  const supabase = await createClient();

  const { data: studentProfiles, error: studentsError } = await supabase
    .from("student_profiles")
    .select("user_id")
    .eq("status", "active");

  if (studentsError) {
    throw studentsError;
  }

  const { data: programs, error: programsError } = await supabase
    .from("programs")
    .select("*")
    .neq("status", "archived")
    .order("name", { ascending: true });

  if (programsError) {
    throw programsError;
  }

  const { data: coachAssignments, error: coachAssignmentsError } =
    await supabase
      .from("coach_student_assignments")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

  if (coachAssignmentsError) {
    throw coachAssignmentsError;
  }

  const { data: parentLinks, error: parentLinksError } = await supabase
    .from("parent_student_links")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (parentLinksError) {
    throw parentLinksError;
  }

  const { data: fitnessAssignments, error: fitnessAssignmentsError } =
    await supabase
      .from("fitness_student_assignments")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

  if (fitnessAssignmentsError) {
    throw fitnessAssignmentsError;
  }

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("student_program_enrollments")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (enrollmentsError) {
    throw enrollmentsError;
  }

  const programMap = new Map(
    (programs ?? []).map((program) => [program.id, program])
  );
  const students = (studentProfiles ?? [])
    .map((studentProfile) => profileMap.get(studentProfile.user_id))
    .filter((profile): profile is AdminProfile => Boolean(profile))
    .map((profile) => ({
      id: profile.id,
      label: getFullName(profile)
    }));
  const coaches = profiles
    .filter((profile) => profile.roles.includes("coach"))
    .map((profile) => ({
      id: profile.id,
      label: getFullName(profile)
    }));
  const parents = profiles
    .filter((profile) => profile.roles.includes("parent"))
    .map((profile) => ({
      id: profile.id,
      label: getFullName(profile)
    }));
  const fitnessUsers = profiles
    .filter((profile) => profile.roles.includes("fitness_pt"))
    .map((profile) => ({
      id: profile.id,
      label: getFullName(profile)
    }));

  return {
    students,
    coaches,
    parents,
    fitnessUsers,
    programs: programs ?? [],
    coachAssignments: (coachAssignments ?? []).map((assignment) => ({
      id: assignment.id,
      label: `${profileMap.get(assignment.coach_user_id)?.first_name ?? "Coach"} -> ${
        profileMap.get(assignment.student_user_id)?.first_name ?? "Student"
      }`,
      status: assignment.status
    })),
    parentLinks: (parentLinks ?? []).map((link) => ({
      id: link.id,
      label: `${profileMap.get(link.parent_user_id)?.first_name ?? "Parent"} -> ${
        profileMap.get(link.student_user_id)?.first_name ?? "Student"
      }${link.relationship ? ` (${link.relationship})` : ""}`,
      status: link.status
    })),
    fitnessAssignments: (fitnessAssignments ?? []).map((assignment) => ({
      id: assignment.id,
      label: `${profileMap.get(assignment.fitness_user_id)?.first_name ?? "Fitness/PT"} -> ${
        profileMap.get(assignment.student_user_id)?.first_name ?? "Student"
      }`,
      status: assignment.status
    })),
    programEnrollments: (enrollments ?? []).map((enrollment) => ({
      id: enrollment.id,
      label: `${profileMap.get(enrollment.student_user_id)?.first_name ?? "Student"} -> ${
        programMap.get(enrollment.program_id)?.name ?? "Program"
      }`,
      status: enrollment.status
    }))
  };
});
