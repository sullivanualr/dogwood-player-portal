create table public.fitness_plans (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references public.student_profiles(user_id) on delete cascade,
  created_by_user_id uuid not null references public.profiles(id),
  title text not null,
  description text,
  assigned_date date not null default current_date,
  due_date date,
  status public.plan_status not null default 'draft',
  visibility public.visibility_level not null default 'internal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fitness_plans_title_not_blank
    check (length(btrim(title)) > 0),
  constraint fitness_plans_due_date_after_assigned
    check (due_date is null or due_date >= assigned_date)
);

create table public.workout_assignments (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references public.student_profiles(user_id) on delete cascade,
  created_by_user_id uuid not null references public.profiles(id),
  title text not null,
  description text,
  assigned_date date not null default current_date,
  due_date date,
  frequency text,
  status public.plan_status not null default 'draft',
  completion_state public.workout_completion_state not null default 'not_started',
  completed_at timestamptz,
  exercise_details text,
  visibility public.visibility_level not null default 'internal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workout_assignments_title_not_blank
    check (length(btrim(title)) > 0),
  constraint workout_assignments_frequency_not_blank
    check (frequency is null or length(btrim(frequency)) > 0),
  constraint workout_assignments_due_date_after_assigned
    check (due_date is null or due_date >= assigned_date),
  constraint workout_assignments_completed_at_matches_state
    check (
      (completion_state = 'completed' and completed_at is not null)
      or (completion_state <> 'completed' and completed_at is null)
    )
);

create or replace function public.preserve_fitness_plan_immutable_fields()
returns trigger
language plpgsql
as $$
begin
  new.student_user_id = old.student_user_id;
  new.created_by_user_id = old.created_by_user_id;
  new.created_at = old.created_at;
  return new;
end;
$$;

create or replace function public.preserve_workout_assignment_fields()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    new.student_user_id = old.student_user_id;
    new.created_by_user_id = old.created_by_user_id;
    new.created_at = old.created_at;
  end if;

  if new.completion_state = 'completed' then
    if tg_op = 'UPDATE' then
      new.completed_at = coalesce(old.completed_at, now());
    else
      new.completed_at = coalesce(new.completed_at, now());
    end if;
  elsif new.completion_state is distinct from 'completed' then
    new.completed_at = null;
  end if;

  if tg_op = 'UPDATE'
    and auth.uid() = old.student_user_id
    and not public.is_admin()
    and not public.is_assigned_fitness(old.student_user_id)
  then
    new.title = old.title;
    new.description = old.description;
    new.assigned_date = old.assigned_date;
    new.due_date = old.due_date;
    new.frequency = old.frequency;
    new.status = old.status;
    new.exercise_details = old.exercise_details;
    new.visibility = old.visibility;
  end if;

  return new;
end;
$$;

create trigger preserve_fitness_plan_immutable_fields
  before update on public.fitness_plans
  for each row execute function public.preserve_fitness_plan_immutable_fields();

create trigger set_fitness_plans_updated_at
  before update on public.fitness_plans
  for each row execute function public.set_updated_at();

create trigger preserve_workout_assignment_fields
  before insert or update on public.workout_assignments
  for each row execute function public.preserve_workout_assignment_fields();

create trigger set_workout_assignments_updated_at
  before update on public.workout_assignments
  for each row execute function public.set_updated_at();

create index fitness_plans_student_status_assigned_idx
  on public.fitness_plans (student_user_id, status, assigned_date desc);

create index fitness_plans_student_visibility_idx
  on public.fitness_plans (student_user_id, visibility);

create index workout_assignments_student_status_due_idx
  on public.workout_assignments (student_user_id, status, due_date asc);

create index workout_assignments_student_completion_idx
  on public.workout_assignments (student_user_id, completion_state, due_date asc);

create index workout_assignments_student_visibility_idx
  on public.workout_assignments (student_user_id, visibility);

alter table public.fitness_plans enable row level security;
alter table public.workout_assignments enable row level security;

create policy "fitness_plans_select_authorized"
  on public.fitness_plans for select
  to authenticated
  using (
    public.is_admin()
    or public.is_assigned_fitness(student_user_id)
    or public.is_assigned_coach(student_user_id)
    or (
      status <> 'archived'
      and visibility = 'student_parent'
      and (
        auth.uid() = student_user_id
        or public.is_linked_parent(student_user_id)
      )
    )
  );

create policy "fitness_plans_insert_authorized"
  on public.fitness_plans for insert
  to authenticated
  with check (
    created_by_user_id = auth.uid()
    and (
      public.is_admin()
      or public.is_assigned_fitness(student_user_id)
    )
  );

create policy "fitness_plans_update_authorized"
  on public.fitness_plans for update
  to authenticated
  using (
    public.is_admin()
    or public.is_assigned_fitness(student_user_id)
  )
  with check (
    public.is_admin()
    or public.is_assigned_fitness(student_user_id)
  );

create policy "workout_assignments_select_authorized"
  on public.workout_assignments for select
  to authenticated
  using (
    public.is_admin()
    or public.is_assigned_fitness(student_user_id)
    or public.is_assigned_coach(student_user_id)
    or (
      status <> 'archived'
      and visibility = 'student_parent'
      and (
        auth.uid() = student_user_id
        or public.is_linked_parent(student_user_id)
      )
    )
  );

create policy "workout_assignments_insert_authorized"
  on public.workout_assignments for insert
  to authenticated
  with check (
    created_by_user_id = auth.uid()
    and (
      public.is_admin()
      or public.is_assigned_fitness(student_user_id)
    )
  );

create policy "workout_assignments_update_authorized"
  on public.workout_assignments for update
  to authenticated
  using (
    public.is_admin()
    or public.is_assigned_fitness(student_user_id)
    or (
      auth.uid() = student_user_id
      and status <> 'archived'
      and visibility = 'student_parent'
    )
  )
  with check (
    public.is_admin()
    or public.is_assigned_fitness(student_user_id)
    or (
      auth.uid() = student_user_id
      and status <> 'archived'
      and visibility = 'student_parent'
      and completion_state in ('in_progress', 'completed')
    )
  );
