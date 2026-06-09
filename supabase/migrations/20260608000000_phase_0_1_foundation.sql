create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'coach', 'student', 'parent', 'fitness_pt');
create type public.record_status as enum ('active', 'inactive', 'archived');
create type public.visibility_level as enum ('internal', 'staff', 'student_parent', 'private');
create type public.goal_status as enum ('active', 'completed', 'paused', 'archived');
create type public.plan_status as enum ('draft', 'active', 'completed', 'archived');
create type public.priority_level as enum ('low', 'medium', 'high');
create type public.workout_completion_state as enum ('not_started', 'in_progress', 'completed', 'missed');
create type public.tournament_status as enum ('upcoming', 'completed', 'cancelled');
create type public.template_status as enum ('draft', 'active', 'archived');
create type public.template_item_type as enum ('development_priority', 'assessment', 'practice_plan', 'goal', 'workout_assignment');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone text,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name public.app_role not null unique,
  description text
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, role_id)
);

create table public.student_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  date_of_birth date,
  junior_player boolean not null default false,
  handedness text,
  graduation_year int,
  school text,
  goals_summary text,
  notes_summary text,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.coach_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  bio text,
  specialties text[],
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.fitness_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  credentials text,
  specialties text[],
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.parent_student_links (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references public.profiles(id) on delete cascade,
  student_user_id uuid not null references public.profiles(id) on delete cascade,
  relationship text,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (parent_user_id, student_user_id)
);

create table public.coach_student_assignments (
  id uuid primary key default gen_random_uuid(),
  coach_user_id uuid not null references public.profiles(id) on delete cascade,
  student_user_id uuid not null references public.profiles(id) on delete cascade,
  is_primary boolean not null default true,
  start_date date not null default current_date,
  end_date date,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.fitness_student_assignments (
  id uuid primary key default gen_random_uuid(),
  fitness_user_id uuid not null references public.profiles(id) on delete cascade,
  student_user_id uuid not null references public.profiles(id) on delete cascade,
  start_date date not null default current_date,
  end_date date,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  default_program_template_id uuid,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.program_templates (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  name text not null,
  description text,
  version int not null default 1,
  status public.template_status not null default 'draft',
  is_default boolean not null default false,
  created_by_user_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.programs
  add constraint programs_default_program_template_id_fkey
  foreign key (default_program_template_id)
  references public.program_templates(id)
  on delete set null;

create table public.program_template_items (
  id uuid primary key default gen_random_uuid(),
  program_template_id uuid not null references public.program_templates(id) on delete cascade,
  item_type public.template_item_type not null,
  title text not null,
  description text,
  category text,
  default_payload jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_program_enrollments (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references public.profiles(id) on delete cascade,
  program_id uuid not null references public.programs(id),
  program_template_id uuid references public.program_templates(id),
  template_applied_at timestamptz,
  template_applied_by_user_id uuid references public.profiles(id),
  start_date date not null default current_date,
  end_date date,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_student_profiles_updated_at
  before update on public.student_profiles
  for each row execute function public.set_updated_at();

create trigger set_coach_profiles_updated_at
  before update on public.coach_profiles
  for each row execute function public.set_updated_at();

create trigger set_fitness_profiles_updated_at
  before update on public.fitness_profiles
  for each row execute function public.set_updated_at();

create trigger set_parent_student_links_updated_at
  before update on public.parent_student_links
  for each row execute function public.set_updated_at();

create trigger set_coach_student_assignments_updated_at
  before update on public.coach_student_assignments
  for each row execute function public.set_updated_at();

create trigger set_fitness_student_assignments_updated_at
  before update on public.fitness_student_assignments
  for each row execute function public.set_updated_at();

create trigger set_programs_updated_at
  before update on public.programs
  for each row execute function public.set_updated_at();

create trigger set_program_templates_updated_at
  before update on public.program_templates
  for each row execute function public.set_updated_at();

create trigger set_program_template_items_updated_at
  before update on public.program_template_items
  for each row execute function public.set_updated_at();

create trigger set_student_program_enrollments_updated_at
  before update on public.student_program_enrollments
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, email, phone)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'first_name', ''), 'New'),
    coalesce(nullif(new.raw_user_meta_data ->> 'last_name', ''), 'User'),
    coalesce(new.email, ''),
    new.phone
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.roles (name, description)
values
  ('admin', 'Full platform administration access'),
  ('coach', 'Golf coach access to assigned students'),
  ('student', 'Student access to own visible development record'),
  ('parent', 'Parent access to linked junior player records'),
  ('fitness_pt', 'Fitness/PT access to assigned students')
on conflict (name) do nothing;

create or replace function public.has_role(
  role_name public.app_role,
  user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = $2
      and r.name = $1
  );
$$;

create or replace function public.is_admin(user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role('admin', $1);
$$;

create or replace function public.is_assigned_coach(
  student_id uuid,
  user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.coach_student_assignments csa
    where csa.coach_user_id = $2
      and csa.student_user_id = $1
      and csa.status = 'active'
      and csa.start_date <= current_date
      and (csa.end_date is null or csa.end_date >= current_date)
  );
$$;

create or replace function public.is_linked_parent(
  student_id uuid,
  user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.parent_student_links psl
    where psl.parent_user_id = $2
      and psl.student_user_id = $1
      and psl.status = 'active'
  );
$$;

create or replace function public.is_assigned_fitness(
  student_id uuid,
  user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.fitness_student_assignments fsa
    where fsa.fitness_user_id = $2
      and fsa.student_user_id = $1
      and fsa.status = 'active'
      and fsa.start_date <= current_date
      and (fsa.end_date is null or fsa.end_date >= current_date)
  );
$$;

create or replace function public.can_view_student(
  student_id uuid,
  user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin($2)
    or $2 = $1
    or public.is_assigned_coach($1, $2)
    or public.is_linked_parent($1, $2)
    or public.is_assigned_fitness($1, $2);
$$;

create or replace function public.can_view_visible_record(
  student_id uuid,
  visibility public.visibility_level,
  user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin($3)
    or public.is_assigned_coach($1, $3)
    or (
      public.is_assigned_fitness($1, $3)
      and $2 in ('staff', 'student_parent')
    )
    or (
      $3 = $1
      and $2 = 'student_parent'
    )
    or (
      public.is_linked_parent($1, $3)
      and $2 = 'student_parent'
    );
$$;

create index user_roles_user_id_idx on public.user_roles (user_id);
create index user_roles_role_id_idx on public.user_roles (role_id);
create index student_profiles_user_id_status_idx on public.student_profiles (user_id, status);
create index coach_profiles_user_id_status_idx on public.coach_profiles (user_id, status);
create index fitness_profiles_user_id_status_idx on public.fitness_profiles (user_id, status);
create index parent_student_links_parent_status_idx on public.parent_student_links (parent_user_id, status);
create index parent_student_links_student_status_idx on public.parent_student_links (student_user_id, status);
create index coach_student_assignments_coach_status_idx on public.coach_student_assignments (coach_user_id, status);
create index coach_student_assignments_student_status_idx on public.coach_student_assignments (student_user_id, status);
create index fitness_student_assignments_fitness_status_idx on public.fitness_student_assignments (fitness_user_id, status);
create index fitness_student_assignments_student_status_idx on public.fitness_student_assignments (student_user_id, status);
create index programs_status_idx on public.programs (status);
create index program_templates_program_status_idx on public.program_templates (program_id, status);
create index program_template_items_template_type_status_idx on public.program_template_items (program_template_id, item_type, status);
create index student_program_enrollments_student_status_idx on public.student_program_enrollments (student_user_id, status);
create index student_program_enrollments_program_status_idx on public.student_program_enrollments (program_id, status);

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.student_profiles enable row level security;
alter table public.coach_profiles enable row level security;
alter table public.fitness_profiles enable row level security;
alter table public.parent_student_links enable row level security;
alter table public.coach_student_assignments enable row level security;
alter table public.fitness_student_assignments enable row level security;
alter table public.programs enable row level security;
alter table public.program_templates enable row level security;
alter table public.program_template_items enable row level security;
alter table public.student_program_enrollments enable row level security;

create policy "profiles_select_authorized"
  on public.profiles for select
  to authenticated
  using (
    id = auth.uid()
    or public.is_admin()
    or public.can_view_student(id)
  );

create policy "profiles_update_self_or_admin"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "profiles_insert_admin"
  on public.profiles for insert
  to authenticated
  with check (public.is_admin());

create policy "roles_select_authenticated"
  on public.roles for select
  to authenticated
  using (true);

create policy "roles_write_admin"
  on public.roles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "user_roles_select_self_or_admin"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "user_roles_write_admin"
  on public.user_roles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "student_profiles_select_authorized"
  on public.student_profiles for select
  to authenticated
  using (public.can_view_student(user_id));

create policy "student_profiles_write_admin"
  on public.student_profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "coach_profiles_select_self_or_admin"
  on public.coach_profiles for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "coach_profiles_write_admin"
  on public.coach_profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "fitness_profiles_select_self_or_admin"
  on public.fitness_profiles for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "fitness_profiles_write_admin"
  on public.fitness_profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "parent_student_links_select_relevant_or_admin"
  on public.parent_student_links for select
  to authenticated
  using (
    public.is_admin()
    or parent_user_id = auth.uid()
    or student_user_id = auth.uid()
    or public.is_assigned_coach(student_user_id)
    or public.is_assigned_fitness(student_user_id)
  );

create policy "parent_student_links_write_admin"
  on public.parent_student_links for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "coach_student_assignments_select_relevant_or_admin"
  on public.coach_student_assignments for select
  to authenticated
  using (
    public.is_admin()
    or coach_user_id = auth.uid()
    or student_user_id = auth.uid()
    or public.is_linked_parent(student_user_id)
    or public.is_assigned_fitness(student_user_id)
  );

create policy "coach_student_assignments_write_admin"
  on public.coach_student_assignments for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "fitness_student_assignments_select_relevant_or_admin"
  on public.fitness_student_assignments for select
  to authenticated
  using (
    public.is_admin()
    or fitness_user_id = auth.uid()
    or student_user_id = auth.uid()
    or public.is_assigned_coach(student_user_id)
    or public.is_linked_parent(student_user_id)
  );

create policy "fitness_student_assignments_write_admin"
  on public.fitness_student_assignments for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "programs_select_authenticated"
  on public.programs for select
  to authenticated
  using (status = 'active' or public.is_admin());

create policy "programs_write_admin"
  on public.programs for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "program_templates_select_admin"
  on public.program_templates for select
  to authenticated
  using (public.is_admin());

create policy "program_templates_write_admin"
  on public.program_templates for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "program_template_items_select_admin"
  on public.program_template_items for select
  to authenticated
  using (public.is_admin());

create policy "program_template_items_write_admin"
  on public.program_template_items for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "student_program_enrollments_select_authorized"
  on public.student_program_enrollments for select
  to authenticated
  using (public.can_view_student(student_user_id));

create policy "student_program_enrollments_write_admin"
  on public.student_program_enrollments for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
