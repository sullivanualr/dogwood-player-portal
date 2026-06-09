create table public.practice_plans (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references public.student_profiles(user_id) on delete cascade,
  created_by_user_id uuid not null references public.profiles(id),
  source_program_template_id uuid references public.program_templates(id) on delete set null,
  source_program_template_item_id uuid references public.program_template_items(id) on delete set null,
  owner_user_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  assigned_date date not null default current_date,
  due_date date,
  status public.plan_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint practice_plans_title_not_blank
    check (length(btrim(title)) > 0),
  constraint practice_plans_due_date_after_assigned_date
    check (due_date is null or due_date >= assigned_date)
);

create table public.practice_plan_items (
  id uuid primary key default gen_random_uuid(),
  practice_plan_id uuid not null references public.practice_plans(id) on delete cascade,
  title text not null,
  instructions text,
  duration_minutes int,
  frequency text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint practice_plan_items_title_not_blank
    check (length(btrim(title)) > 0),
  constraint practice_plan_items_duration_minutes_non_negative
    check (duration_minutes is null or duration_minutes >= 0)
);

create or replace function public.preserve_practice_plan_immutable_fields()
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

create or replace function public.preserve_practice_plan_item_immutable_fields()
returns trigger
language plpgsql
as $$
begin
  new.practice_plan_id = old.practice_plan_id;
  new.created_at = old.created_at;
  return new;
end;
$$;

create trigger preserve_practice_plan_immutable_fields
  before update on public.practice_plans
  for each row execute function public.preserve_practice_plan_immutable_fields();

create trigger preserve_practice_plan_item_immutable_fields
  before update on public.practice_plan_items
  for each row execute function public.preserve_practice_plan_item_immutable_fields();

create trigger set_practice_plans_updated_at
  before update on public.practice_plans
  for each row execute function public.set_updated_at();

create trigger set_practice_plan_items_updated_at
  before update on public.practice_plan_items
  for each row execute function public.set_updated_at();

create index practice_plans_student_status_assigned_idx
  on public.practice_plans (student_user_id, status, assigned_date desc);

create index practice_plans_student_due_date_idx
  on public.practice_plans (student_user_id, due_date);

create index practice_plans_template_idx
  on public.practice_plans (source_program_template_id, source_program_template_item_id);

create index practice_plan_items_plan_sort_idx
  on public.practice_plan_items (practice_plan_id, sort_order);

alter table public.practice_plans enable row level security;
alter table public.practice_plan_items enable row level security;

create policy "practice_plans_select_authorized"
  on public.practice_plans for select
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

create policy "practice_plans_insert_coach_or_admin"
  on public.practice_plans for insert
  to authenticated
  with check (
    created_by_user_id = auth.uid()
    and owner_user_id = auth.uid()
    and (
      public.is_admin()
      or public.is_assigned_coach(student_user_id)
    )
  );

create policy "practice_plans_update_coach_or_admin"
  on public.practice_plans for update
  to authenticated
  using (
    public.is_admin()
    or public.is_assigned_coach(student_user_id)
  )
  with check (
    public.is_admin()
    or public.is_assigned_coach(student_user_id)
  );

create policy "practice_plan_items_select_authorized"
  on public.practice_plan_items for select
  to authenticated
  using (
    exists (
      select 1
      from public.practice_plans pp
      where pp.id = public.practice_plan_items.practice_plan_id
        and (
          public.is_admin()
          or public.is_assigned_coach(pp.student_user_id)
          or public.is_assigned_fitness(pp.student_user_id)
          or (
            pp.status = 'active'
            and (
              auth.uid() = pp.student_user_id
              or public.is_linked_parent(pp.student_user_id)
            )
          )
        )
    )
  );

create policy "practice_plan_items_insert_coach_or_admin"
  on public.practice_plan_items for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.practice_plans pp
      where pp.id = public.practice_plan_items.practice_plan_id
        and (
          public.is_admin()
          or public.is_assigned_coach(pp.student_user_id)
        )
    )
  );

create policy "practice_plan_items_update_coach_or_admin"
  on public.practice_plan_items for update
  to authenticated
  using (
    exists (
      select 1
      from public.practice_plans pp
      where pp.id = public.practice_plan_items.practice_plan_id
        and (
          public.is_admin()
          or public.is_assigned_coach(pp.student_user_id)
        )
    )
  )
  with check (
    exists (
      select 1
      from public.practice_plans pp
      where pp.id = public.practice_plan_items.practice_plan_id
        and (
          public.is_admin()
          or public.is_assigned_coach(pp.student_user_id)
        )
    )
  );
