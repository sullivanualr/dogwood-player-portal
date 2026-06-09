export const APP_ROLES = [
  "admin",
  "coach",
  "student",
  "parent",
  "fitness_pt"
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  coach: "Coach",
  student: "Student",
  parent: "Parent",
  fitness_pt: "Fitness/PT"
};

export const DEFAULT_ROLE_REDIRECTS: Record<AppRole, string> = {
  admin: "/admin",
  coach: "/coach",
  student: "/student",
  parent: "/parent",
  fitness_pt: "/fitness"
};

export const ROLE_PRIORITY: AppRole[] = [
  "admin",
  "coach",
  "fitness_pt",
  "parent",
  "student"
];

export function getDefaultPathForRoles(roles: AppRole[]) {
  const primaryRole = ROLE_PRIORITY.find((role) => roles.includes(role));

  if (!primaryRole) {
    return "/";
  }

  return DEFAULT_ROLE_REDIRECTS[primaryRole];
}
