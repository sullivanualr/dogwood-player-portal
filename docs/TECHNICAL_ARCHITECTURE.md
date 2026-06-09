# Dogwood Player Portal Technical Architecture

## 1. Purpose

This document translates the Dogwood Player Portal PRD into an implementation-ready technical plan. The PRD remains the source of truth for product scope, role behavior, permissions, and MVP acceptance criteria.

This document does not include application code. It is intended to prepare the repository for the first coding task.

## 2. Technology Stack

- Next.js: Full-stack React application framework using the App Router.
- TypeScript: Type-safe application, server action, and data access code.
- Tailwind CSS: Utility-first styling system for responsive dashboards and forms.
- Supabase: PostgreSQL database, authentication, row level security, and storage.
- Vercel: Hosting, preview deployments, production deployments, and environment management.

## 3. Application Architecture

### Architecture Style
Dogwood Player Portal should use a server-first Next.js architecture with Supabase as the backend platform.

The application should separate:
- Route-level pages and layouts.
- Server-side data loading and mutations.
- Supabase client/server utilities.
- Reusable role and permission helpers.
- Dashboard components.
- Feature-specific form and table components.

### Core Layers

| Layer | Responsibility |
|---|---|
| Next.js App Router | Routes, layouts, loading states, error boundaries, metadata, and server-rendered pages. |
| Server Components | Default rendering layer for dashboards, detail pages, and read-heavy screens. |
| Server Actions / Route Handlers | Secure mutations for creating notes, plans, goals, assessments, uploads, assignments, and admin actions. |
| Supabase Auth | User identity, session management, password reset, invite flow, and authenticated user context. |
| Supabase PostgreSQL | Source of truth for portal data. |
| Supabase RLS | Database-enforced access control by role and assignment. |
| Supabase Storage | Private student files, videos, movement screens, thumbnails, and attachments. |
| Tailwind CSS | Responsive UI implementation. |
| Vercel | Deployment, environment variables, preview branches, and production hosting. |

### Recommended Data Flow

1. User authenticates with Supabase Auth.
2. Next.js middleware checks for a valid session on protected routes.
3. Server Components load data through a server Supabase client.
4. Supabase RLS enforces access by role, student ownership, coach assignment, parent link, or Fitness/PT assignment.
5. Server Actions validate form input and execute mutations.
6. File uploads use private Supabase Storage buckets and store metadata in `file_assets` or `video_assets`.
7. Dashboard pages compose data from normalized tables and targeted snapshot queries.
8. Program enrollment actions can optionally instantiate development records from a selected active program template.

### Route Protection Model

- Public routes: sign in, password reset, invite acceptance.
- Protected routes: all portal routes under `/app`.
- Role-specific route groups should improve navigation and layout, but database access must still be enforced with RLS.
- Admin routes should check both application-level role helpers and Supabase RLS.

## 4. Folder Structure

Recommended initial structure:

```text
/
  docs/
    PRD.md
    TECHNICAL_ARCHITECTURE.md
  src/
    app/
      (auth)/
        login/
        reset-password/
        accept-invite/
      (portal)/
        layout.tsx
        page.tsx
        admin/
          page.tsx
          users/
          programs/
          program-templates/
          assignments/
        coach/
          page.tsx
          students/
        student/
          page.tsx
          snapshot/
        parent/
          page.tsx
          players/
        fitness/
          page.tsx
          students/
        students/
          [studentId]/
            page.tsx
            snapshot/
            profile/
            priorities/
            lessons/
            practice-plans/
            goals/
            assessments/
            metrics/
            tournaments/
            files/
            fitness/
      api/
        storage/
          signed-url/
    components/
      app-shell/
      dashboard/
        student-snapshot/
        admin-dashboard/
        coach-dashboard/
        parent-dashboard/
        fitness-dashboard/
      forms/
      tables/
      ui/
    features/
      assessments/
      assignments/
      auth/
      files/
      fitness/
      goals/
      lessons/
      metrics/
      practice-plans/
      priorities/
      program-templates/
      programs/
      students/
      tournaments/
      users/
    lib/
      supabase/
        client.ts
        server.ts
        middleware.ts
      auth/
        roles.ts
        permissions.ts
      db/
        types.ts
        queries/
        mutations/
      validation/
      utils/
    styles/
      globals.css
  supabase/
    migrations/
    seed.sql
    policies/
```

### Folder Guidance

- `src/app/(portal)/students/[studentId]/snapshot` should be the canonical Student Snapshot route.
- `src/app/(portal)/page.tsx` should redirect users to the correct default experience by role.
- Student users should land on their own Student Snapshot Dashboard.
- Coaches, admins, parents, and Fitness/PT users should land on role dashboards that link into authorized Student Snapshot views.
- Feature folders should hold feature-specific components, schemas, and server actions.
- Shared Supabase and permission helpers should live under `src/lib`.

## 5. Supabase Database Schema

### Naming Convention

Use snake_case table and column names in PostgreSQL. The PRD entity names map to the following tables:

| PRD Entity | Supabase Table |
|---|---|
| User | `profiles` |
| Role | `roles` |
| UserRole | `user_roles` |
| StudentProfile | `student_profiles` |
| CoachProfile | `coach_profiles` |
| FitnessProfile | `fitness_profiles` |
| ParentStudentLink | `parent_student_links` |
| CoachStudentAssignment | `coach_student_assignments` |
| FitnessStudentAssignment | `fitness_student_assignments` |
| Program | `programs` |
| ProgramTemplate | `program_templates` |
| ProgramTemplateItem | `program_template_items` |
| StudentProgramEnrollment | `student_program_enrollments` |
| Lesson | `lessons` |
| LessonNote | `lesson_notes` |
| PracticePlan | `practice_plans` |
| PracticePlanItem | `practice_plan_items` |
| Goal | `goals` |
| DevelopmentPriority | `development_priorities` |
| Assessment | `assessments` |
| ProgressMetric | `progress_metrics` |
| TournamentResult | `tournament_results` |
| FileAsset | `file_assets` |
| VideoAsset | `video_assets` |
| InternalNote | `internal_notes` |
| FitnessPlan | `fitness_plans` |
| WorkoutAssignment | `workout_assignments` |
| MovementScreen | `movement_screens` |
| FitnessNote | `fitness_notes` |
| AuditLog | `audit_logs` |

### Core Types

Recommended PostgreSQL enums:

```sql
create type app_role as enum ('admin', 'coach', 'student', 'parent', 'fitness_pt');
create type record_status as enum ('active', 'inactive', 'archived');
create type visibility_level as enum ('internal', 'staff', 'student_parent', 'private');
create type goal_status as enum ('active', 'completed', 'paused', 'archived');
create type plan_status as enum ('draft', 'active', 'completed', 'archived');
create type priority_level as enum ('low', 'medium', 'high');
create type workout_completion_state as enum ('not_started', 'in_progress', 'completed', 'missed');
create type tournament_status as enum ('upcoming', 'completed', 'cancelled');
create type template_status as enum ('draft', 'active', 'archived');
create type template_item_type as enum ('development_priority', 'assessment', 'practice_plan', 'goal', 'workout_assignment');
```

### Table Blueprint

The first migration should create the MVP tables below. Column types are intentionally explicit enough to start schema implementation.

```sql
profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone text,
  status record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
)

roles (
  id uuid primary key default gen_random_uuid(),
  name app_role not null unique,
  description text
)

user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  role_id uuid not null references roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, role_id)
)

student_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  date_of_birth date,
  junior_player boolean not null default false,
  handedness text,
  graduation_year int,
  school text,
  goals_summary text,
  notes_summary text,
  status record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)

coach_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  bio text,
  specialties text[],
  status record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)

fitness_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  credentials text,
  specialties text[],
  status record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)
```

Assignment and enrollment tables:

```sql
parent_student_links (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references profiles(id) on delete cascade,
  student_user_id uuid not null references profiles(id) on delete cascade,
  relationship text,
  status record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (parent_user_id, student_user_id)
)

coach_student_assignments (
  id uuid primary key default gen_random_uuid(),
  coach_user_id uuid not null references profiles(id) on delete cascade,
  student_user_id uuid not null references profiles(id) on delete cascade,
  is_primary boolean not null default true,
  start_date date not null default current_date,
  end_date date,
  status record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)

fitness_student_assignments (
  id uuid primary key default gen_random_uuid(),
  fitness_user_id uuid not null references profiles(id) on delete cascade,
  student_user_id uuid not null references profiles(id) on delete cascade,
  start_date date not null default current_date,
  end_date date,
  status record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)

programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  default_program_template_id uuid,
  status record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)

program_templates (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs(id) on delete cascade,
  name text not null,
  description text,
  version int not null default 1,
  status template_status not null default 'draft',
  is_default boolean not null default false,
  created_by_user_id uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)

program_template_items (
  id uuid primary key default gen_random_uuid(),
  program_template_id uuid not null references program_templates(id) on delete cascade,
  item_type template_item_type not null,
  title text not null,
  description text,
  category text,
  default_payload jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  status record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)

student_program_enrollments (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references profiles(id) on delete cascade,
  program_id uuid not null references programs(id),
  program_template_id uuid references program_templates(id),
  template_applied_at timestamptz,
  template_applied_by_user_id uuid references profiles(id),
  start_date date not null default current_date,
  end_date date,
  status record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)
```

Player development tables:

```sql
development_priorities (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references profiles(id) on delete cascade,
  created_by_user_id uuid not null references profiles(id),
  source_program_template_id uuid references program_templates(id),
  source_program_template_item_id uuid references program_template_items(id),
  owner_user_id uuid references profiles(id),
  title text not null,
  description text,
  category text,
  priority_level priority_level not null default 'medium',
  status record_status not null default 'active',
  target_date date,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)

lessons (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references profiles(id) on delete cascade,
  coach_user_id uuid not null references profiles(id),
  lesson_date timestamptz not null,
  title text,
  focus_area text,
  summary text,
  visibility visibility_level not null default 'student_parent',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)

lesson_notes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  author_user_id uuid not null references profiles(id),
  body text not null,
  visibility visibility_level not null default 'student_parent',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)

practice_plans (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references profiles(id) on delete cascade,
  coach_user_id uuid not null references profiles(id),
  source_program_template_id uuid references program_templates(id),
  source_program_template_item_id uuid references program_template_items(id),
  title text not null,
  description text,
  assigned_date date not null default current_date,
  due_date date,
  status plan_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)

practice_plan_items (
  id uuid primary key default gen_random_uuid(),
  practice_plan_id uuid not null references practice_plans(id) on delete cascade,
  title text not null,
  instructions text,
  duration_minutes int,
  frequency text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)

goals (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references profiles(id) on delete cascade,
  created_by_user_id uuid not null references profiles(id),
  source_program_template_id uuid references program_templates(id),
  source_program_template_item_id uuid references program_template_items(id),
  title text not null,
  description text,
  category text,
  status goal_status not null default 'active',
  target_date date,
  progress_value numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)

assessments (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references profiles(id) on delete cascade,
  assessor_user_id uuid not null references profiles(id),
  source_program_template_id uuid references program_templates(id),
  source_program_template_item_id uuid references program_template_items(id),
  assessment_type text not null,
  assessment_date date not null default current_date,
  title text not null,
  summary text,
  findings text,
  score numeric,
  score_unit text,
  visibility visibility_level not null default 'student_parent',
  file_asset_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)

progress_metrics (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references profiles(id) on delete cascade,
  recorded_by_user_id uuid not null references profiles(id),
  name text not null,
  category text,
  value numeric not null,
  unit text,
  recorded_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)

tournament_results (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references profiles(id) on delete cascade,
  recorded_by_user_id uuid not null references profiles(id),
  event_name text not null,
  event_type text,
  start_date date not null,
  end_date date,
  course_name text,
  location text,
  score text,
  finish_position int,
  field_size int,
  status tournament_status not null default 'upcoming',
  preparation_notes text,
  result_notes text,
  stats jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)
```

Media, internal notes, and fitness tables:

```sql
file_assets (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references profiles(id) on delete cascade,
  uploaded_by_user_id uuid not null references profiles(id),
  file_name text not null,
  file_type text,
  mime_type text,
  file_size bigint,
  storage_bucket text not null,
  storage_key text not null,
  title text,
  description text,
  category text,
  visibility visibility_level not null default 'student_parent',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)

video_assets (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references profiles(id) on delete cascade,
  uploaded_by_user_id uuid not null references profiles(id),
  title text not null,
  description text,
  storage_bucket text not null,
  storage_key text not null,
  thumbnail_key text,
  duration_seconds int,
  category text,
  visibility visibility_level not null default 'student_parent',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)

internal_notes (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references profiles(id) on delete cascade,
  author_user_id uuid not null references profiles(id),
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)

fitness_plans (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references profiles(id) on delete cascade,
  fitness_user_id uuid not null references profiles(id),
  title text not null,
  description text,
  assigned_date date not null default current_date,
  due_date date,
  status plan_status not null default 'active',
  visibility visibility_level not null default 'student_parent',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)

workout_assignments (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references profiles(id) on delete cascade,
  assigned_by_user_id uuid not null references profiles(id),
  fitness_plan_id uuid references fitness_plans(id) on delete set null,
  source_program_template_id uuid references program_templates(id),
  source_program_template_item_id uuid references program_template_items(id),
  title text not null,
  description text,
  assigned_date date not null default current_date,
  due_date date,
  frequency text,
  status plan_status not null default 'active',
  completion_state workout_completion_state not null default 'not_started',
  completed_at timestamptz,
  exercise_details jsonb,
  visibility visibility_level not null default 'student_parent',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)

movement_screens (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references profiles(id) on delete cascade,
  fitness_user_id uuid not null references profiles(id),
  screen_date date not null default current_date,
  summary text,
  findings text,
  file_asset_id uuid references file_assets(id),
  visibility visibility_level not null default 'student_parent',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)

fitness_notes (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references profiles(id) on delete cascade,
  fitness_user_id uuid not null references profiles(id),
  body text not null,
  visibility visibility_level not null default 'student_parent',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)

audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
)
```

### Indexes

Add indexes for all permission and dashboard filters:

- `user_roles(user_id)`
- `program_templates(program_id, status)`
- `program_template_items(program_template_id, item_type, status)`
- `student_program_enrollments(student_user_id, status)`
- `student_program_enrollments(program_id, status)`
- `parent_student_links(parent_user_id, status)`
- `parent_student_links(student_user_id, status)`
- `coach_student_assignments(coach_user_id, status)`
- `coach_student_assignments(student_user_id, status)`
- `fitness_student_assignments(fitness_user_id, status)`
- `fitness_student_assignments(student_user_id, status)`
- Student-scoped indexes on all feature tables: `(student_user_id, status)` where applicable.
- Source template indexes on generated records: `(source_program_template_id)` and `(source_program_template_item_id)` where applicable.
- Date indexes for dashboard feeds: lesson date, assessment date, recorded_at, tournament start date, due date, created_at.

### Program Template Instantiation

Program templates define reusable defaults for:

- Development priorities.
- Assessments.
- Practice plans.
- Goals.
- Workout assignments.

When an admin enrolls a student in a program, the enrollment flow should:

1. Create or update the active `student_program_enrollments` row.
2. If a template is selected, read active `program_template_items` for that template.
3. Create student-specific records in the corresponding destination tables.
4. Populate `source_program_template_id` and `source_program_template_item_id` on each generated record.
5. Set `template_applied_at` and `template_applied_by_user_id` on the enrollment.
6. Return the user to the Student Snapshot Dashboard so the generated priorities, goals, practice plan, assessments, and workout status are visible immediately.

`program_template_items.default_payload` should hold item-specific defaults that do not fit common fields. For example:

- Assessment defaults: assessment type, suggested scoring unit, visibility.
- Practice plan defaults: due date offset, practice items, frequency.
- Goal defaults: target date offset, progress starting value.
- Workout defaults: due date offset, frequency, exercise details.

Template-generated records should be copied, not dynamically linked for content. Later edits to a template must not silently change existing student records.

Because `programs.default_program_template_id` references `program_templates`, add that foreign key after both tables are created in the migration.

## 6. Authentication Strategy

### Supabase Auth

Use Supabase Auth for:
- Email and password login.
- Password reset.
- Invite-based account creation for staff, students, and parents.
- Server-side session validation in Next.js middleware.

### Profile Creation

When a Supabase auth user is created, a `profiles` row must be created. This can be handled by:
- A Supabase database trigger on `auth.users`.
- Or an admin onboarding server action that creates both the auth user and the profile.

For MVP, prefer a controlled admin invite/onboarding flow so roles and assignments are created intentionally.

### Session Handling

- Use Supabase SSR helpers for Next.js.
- Middleware should refresh sessions and redirect unauthenticated users away from protected routes.
- Authenticated users visiting auth pages should redirect to their default portal route.
- Application routes should never rely only on client-side auth checks.

### Default Redirects

After login:
- Student: own Student Snapshot Dashboard.
- Coach: Coach Dashboard.
- Parent: Parent Portal with linked junior player selector.
- Fitness/PT: Fitness/PT Dashboard.
- Admin: Admin Dashboard.

If a user has multiple roles, use this priority for MVP: admin, coach, fitness_pt, parent, student. This can later become user-selectable.

## 7. User Roles and Permissions

### Roles

- `admin`: Full platform access and management.
- `coach`: Access to assigned students and coach-authored development records.
- `student`: Access to own visible student record.
- `parent`: Access to linked junior player visible records.
- `fitness_pt`: Access to assigned students and fitness-related records.

### Access Helpers

Implement role and permission helpers before building feature screens:

- `hasRole(userId, role)`
- `isAdmin(userId)`
- `isAssignedCoach(userId, studentUserId)`
- `isLinkedParent(userId, studentUserId)`
- `isAssignedFitness(userId, studentUserId)`
- `canViewStudent(userId, studentUserId)`
- `canEditStudentDevelopment(userId, studentUserId)`
- `canViewStudentFamilyVisible(userId, studentUserId)`
- `canViewInternalNotes(userId, studentUserId)`

These helpers should mirror database RLS policies and be used only for routing, navigation, and UI state. Supabase RLS remains the final source of enforcement.

### Permission Summary

- Admin can view and manage all data.
- Coach can view assigned students and create core development records.
- Student can view own visible records and cannot view internal notes.
- Parent can view linked junior player visible records and cannot view internal notes.
- Fitness/PT can view assigned students and create fitness records, assessments, movement screens, and workout assignments.

## 8. Row Level Security Policies

### RLS Principles

- Enable RLS on every application table.
- Use `auth.uid()` to identify the current user.
- Use helper SQL functions for shared checks.
- Keep policy logic readable and consistent across tables.
- Never expose private storage objects without a signed URL or RLS-protected storage policy.

### Recommended SQL Helper Functions

```sql
is_admin(user_id uuid) returns boolean
has_role(user_id uuid, role_name app_role) returns boolean
is_assigned_coach(user_id uuid, student_id uuid) returns boolean
is_linked_parent(user_id uuid, student_id uuid) returns boolean
is_assigned_fitness(user_id uuid, student_id uuid) returns boolean
can_view_student(user_id uuid, student_id uuid) returns boolean
can_view_visible_record(user_id uuid, student_id uuid, visibility visibility_level) returns boolean
```

`can_view_student` should return true when:
- User is admin.
- User is the student.
- User is an active assigned coach.
- User is an active linked parent.
- User is an active assigned Fitness/PT user.

`can_view_visible_record` should return true when:
- Admin can view all.
- Assigned coach can view student development records.
- Assigned Fitness/PT can view assigned student records, subject to feature area.
- Student and parent can view records with `visibility = 'student_parent'`.
- Internal records remain staff-only.

### Policy Patterns

Profiles:

```sql
select: user can view own profile, admin can view all, assigned staff/parent can view the student's profile.
insert/update/delete: admin only, except limited self-profile updates through server actions.
```

Assignments and roles:

```sql
select: admin can view all; users can view assignment rows relevant to themselves.
insert/update/delete: admin only.
```

Student development records:

```sql
select: can_view_visible_record(auth.uid(), student_user_id, visibility).
insert: admin or assigned coach for golf development records.
update: admin or assigned coach; optionally restrict coach update to own records where required.
delete/archive: admin only for MVP, with archive preferred over hard delete.
```

Fitness records:

```sql
select: admin, assigned coach, assigned Fitness/PT, student/parent when visibility allows.
insert: admin or assigned Fitness/PT.
update: admin or assigned Fitness/PT; optionally restrict Fitness/PT to own records.
delete/archive: admin only for MVP.
```

Internal notes:

```sql
select: admin or assigned coach only.
insert: admin or assigned coach.
update: admin or authoring assigned coach.
delete/archive: admin only for MVP.
```

Admin tables:

```sql
programs select: authenticated users may view active programs relevant to their students.
programs write: admin only.
program_templates select/write: admin only for MVP.
program_template_items select/write: admin only for MVP.
audit_logs select/write: service role for inserts; admin for read access.
```

### Storage RLS

Storage objects should use paths that include the student user id:

```text
student-files/{student_user_id}/{asset_id}/{filename}
student-videos/{student_user_id}/{asset_id}/{filename}
movement-screens/{student_user_id}/{asset_id}/{filename}
thumbnails/{student_user_id}/{asset_id}/{filename}
```

Storage policies should allow:
- Admin access to all objects.
- Assigned coach access to assigned student files/videos.
- Assigned Fitness/PT access to movement and fitness files for assigned students.
- Student and linked parent read access only when the matching metadata row is visible.

Because Supabase Storage policies cannot easily inspect every feature table cleanly, the MVP should prefer server-generated signed URLs after checking the metadata table with RLS.

## 9. File and Video Storage Plan

### Buckets

Use private Supabase Storage buckets:

- `student-files`: PDFs, images, documents, general uploads.
- `student-videos`: swing videos and training clips.
- `movement-screens`: Fitness/PT screen files and related uploads.
- `thumbnails`: generated or uploaded video thumbnails.

### Upload Flow

1. User selects a file in an authorized student context.
2. Server action validates permission, file type, size, and student assignment.
3. Application creates a metadata row in `file_assets` or `video_assets`.
4. File is uploaded to a private bucket under a deterministic path.
5. Metadata row stores bucket, storage key, size, MIME type, category, title, and visibility.
6. Dashboard and detail pages request signed URLs only after the metadata row passes RLS.

### MVP Limits

Recommended initial limits:

- General files: 25 MB.
- Images: 15 MB.
- Videos: 500 MB.
- Allowed file types: PDF, common images, common videos, and common document formats.

Final limits should be confirmed before production because storage and bandwidth costs are a known PRD risk.

### Video Handling

MVP should store and play uploaded video files directly from signed URLs. Transcoding, annotation, side-by-side comparison, and slow-motion tools belong to the future media roadmap.

## 10. Dashboard Structure

### Default Homepage Rules

- Student users land on their own Student Snapshot Dashboard.
- Admin users land on Admin Dashboard.
- Coach users land on Coach Dashboard.
- Parent users land on Parent Portal.
- Fitness/PT users land on Fitness/PT Dashboard.
- Any authorized user who opens a specific student record lands on that student's Snapshot Dashboard first.

### Student Snapshot Dashboard

The Student Snapshot Dashboard is the primary student record view and must display:

- Current development priorities.
- Active goals.
- Current practice plan.
- Recent assessment results.
- Recent progress metrics.
- Latest lesson note.
- Latest uploaded video.
- Upcoming tournaments.
- Workout status.

Recommended query strategy:

- `development_priorities`: active rows ordered by `sort_order`, `priority_level`, and `target_date`.
- `goals`: active rows ordered by `target_date`.
- `practice_plans`: most recent active plan.
- `assessments`: most recent 3 visible assessments.
- `progress_metrics`: most recent 5 metrics.
- `lesson_notes`: latest visible note joined through latest lesson.
- `video_assets`: latest visible video.
- `tournament_results`: upcoming rows where `status = 'upcoming'`, ordered by `start_date`.
- `workout_assignments`: active rows grouped by completion state and due date.

### Admin Dashboard

MVP modules:
- User management.
- Program management.
- Program template management.
- Program enrollment actions that can generate student records from templates.
- Coach, parent, and Fitness/PT assignments.
- Student list with search/filter.
- Links to Student Snapshot Dashboards.

### Coach Dashboard

MVP modules:
- Assigned student list.
- Student Snapshot links.
- Recent lesson activity.
- Practice plans needing updates.
- Development priorities needing review.
- Upcoming tournaments.
- Quick actions for notes, plans, goals, assessments, metrics, uploads, and priorities.

### Parent Portal

MVP modules:
- Linked junior player selector.
- Snapshot view for selected junior player.
- Lesson notes, practice plans, goals, assessments, progress, tournaments, workout status, and visible uploads.

### Fitness/PT Dashboard

MVP modules:
- Assigned student list.
- Snapshot links.
- Fitness plans.
- Workout assignments.
- Movement screens.
- Fitness notes.

## 11. MVP Build Phases

### Phase 0: Repository and Tooling Setup

- Initialize Next.js with TypeScript.
- Configure Tailwind CSS.
- Add Supabase client/server utilities.
- Add environment variable documentation.
- Add baseline linting and formatting.
- Add initial app shell and protected route scaffolding.

### Phase 1: Supabase Foundation

- Create initial Supabase migrations.
- Add enums, tables, indexes, and timestamp triggers.
- Seed roles.
- Add profile creation flow.
- Implement RLS helper functions.
- Enable RLS and add first-pass policies.

### Phase 2: Authentication and Role Routing

- Build login, reset password, and invite acceptance flows.
- Implement middleware session refresh and protected route handling.
- Implement role-based redirects.
- Build role-aware navigation shell.

### Phase 3: Admin Foundations

- Build user management.
- Build role assignment.
- Build program management.
- Build program template management.
- Build enrollment flow that can create student records from selected program templates.
- Build coach, parent, and Fitness/PT student assignment flows.
- Validate admin-only access paths.

### Phase 4: Student Snapshot and Student Records

- Build Student Snapshot Dashboard.
- Build student profile view.
- Build development priorities, active goals, current practice plan, assessments, progress metrics, latest lesson note, latest video, upcoming tournaments, and workout status panels.
- Add authorized student detail routing for admin, coach, student, parent, and Fitness/PT users.

### Phase 5: Coach Development Workflows

- Create lesson notes.
- Create practice plans and practice plan items.
- Create goals.
- Create development priorities.
- Create assessments.
- Record progress metrics.
- Record tournament results and upcoming tournaments.
- Add internal notes.
- Upload videos and files.

### Phase 6: Parent, Student, and Fitness/PT Experiences

- Build student self-service portal views.
- Build parent linked-player portal.
- Build Fitness/PT dashboard.
- Build fitness plans, workout assignments, movement screens, and fitness notes.
- Validate visibility rules for family-facing and internal content.

### Phase 7: Hardening and Launch Readiness

- RLS test coverage.
- Permission regression tests.
- Storage upload validation.
- Responsive layout pass.
- Accessibility pass.
- Seed/demo data for stakeholder review.
- Production deployment checklist.

## 12. Deployment Plan

### Environments

Use three environments:

- Local: Developer machine with local env vars.
- Preview: Vercel preview deployments connected to a Supabase staging project.
- Production: Vercel production deployment connected to a Supabase production project.

### Environment Variables

Required variables:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
```

Rules:
- `SUPABASE_SERVICE_ROLE_KEY` must be server-only and never exposed to the browser.
- Preview and production must use separate Supabase projects.
- Local `.env.local` should not be committed.

### Supabase Deployment

- Store migrations in `supabase/migrations`.
- Apply migrations to staging first.
- Validate RLS policies with test users for all five roles.
- Promote the same migration set to production.
- Seed only required roles and production-safe baseline data.

### Vercel Deployment

- Connect the repository to Vercel.
- Configure environment variables per environment.
- Use preview deployments for every pull request.
- Run type checks, linting, and tests before production promotion.
- Protect production deployment behind main branch approval.

### Production Launch Checklist

- Supabase production project created.
- Production environment variables configured in Vercel.
- Auth redirect URLs configured for production domain.
- Storage buckets created as private buckets.
- RLS enabled and verified on all tables.
- Admin seed user or invite flow ready.
- Backup strategy enabled for Supabase database.
- File/video size limits confirmed.
- First programs configured.
- Staff onboarding plan ready.

## 13. First Coding Task Recommendation

The first coding task should be repository scaffolding and Supabase foundation setup:

- Initialize the Next.js, TypeScript, Tailwind, Supabase, and Vercel-ready project.
- Add the folder structure from this document.
- Add Supabase migration scaffolding for enums, core user/role/profile tables, assignment tables, program template tables, and helper functions.
- Add a protected portal layout placeholder.
- Do not build feature screens until authentication, role routing, and core RLS are in place.
