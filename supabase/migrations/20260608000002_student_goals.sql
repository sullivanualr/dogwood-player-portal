create table public.student_goals (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references public.student_profiles(user_id) on delete cascade,
  created_by_user_id uuid not null references public.profiles(id),
  source_program_template_id uuid references public.program_templates(id) on delete set null,
  source_program_template_item_id uuid references public.program_template_items(id) on delete set null,
  owner_user_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  category text,
  status public.goal_status not null default 'active',
  target_date date,
  progress_value double precision not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_goals_title_not_blank
    check (length(btrim(title)) > 0),
  constraint student_goals_progress_value_range
    check (progress_value >= 0 and progress_value <= 100)
);

create or replace function public.preserve_student_goal_immutable_fields()
returns trigger
language plpgsql
as $$
begin
  new.student_user_id = old.student_user_id;
  new.created_by_user_id = old.created_by_user_id;
  new.source_program_template_id = old.source_program_template_id;
  new.source_program_template_item_id = old.source_program_template_item_id;
  new.owner_user_id = old.owner_user_id;
  new.created_at = old.created_at;
  return new;
end;
$$;

create trigger preserve_student_goal_immutable_fields
  before update on public.student_goals
  for each row execute function public.preserve_student_goal_immutable_fields();

create trigger set_student_goals_updated_at
  before update on public.student_goals
  for each row execute function public.set_updated_at();

create index student_goals_student_status_target_idx
  on public.student_goals (student_user_id, status, target_date);

create index student_goals_student_category_idx
  on public.student_goals (student_user_id, category);

create index student_goals_template_idx
  on public.student_goals (source_program_template_id, source_program_template_item_id);

alter table public.student_goals enable row level security;

create policy "student_goals_select_authorized"
  on public.student_goals for select
  to authenticated
  using (
    public.is_admin()
    or public.is_assigned_coach(student_user_id)
    or public.is_assigned_fitness(student_user_id)
    or (
      status = 'active'
      and (
        auth.uid() = student_user_id
        or public.is_linked_parent(student_user_id)
      )
    )
  );

create policy "student_goals_insert_coach_or_admin"
  on public.student_goals for insert
  to authenticated
  with check (
    created_by_user_id = auth.uid()
    and owner_user_id = auth.uid()
    and (
      public.is_admin()
      or public.is_assigned_coach(student_user_id)
    )
  );

create policy "student_goals_update_coach_or_admin"
  on public.student_goals for update
  to authenticated
  using (
    public.is_admin()
    or public.is_assigned_coach(student_user_id)
  )
  with check (
    public.is_admin()
    or public.is_assigned_coach(student_user_id)
  );
