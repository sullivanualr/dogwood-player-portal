create type public.metric_category as enum (
  'swing',
  'scoring',
  'skills',
  'putting',
  'wedge',
  'speed',
  'fitness',
  'practice',
  'custom'
);

create type public.progress_metric_status as enum ('draft', 'published', 'archived');

create table public.progress_metrics (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references public.student_profiles(user_id) on delete cascade,
  created_by_user_id uuid not null references public.profiles(id),
  metric_name text not null,
  category public.metric_category not null,
  value double precision not null,
  unit text,
  recorded_at timestamptz not null default now(),
  notes text,
  visibility public.visibility_level not null default 'internal',
  status public.progress_metric_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint progress_metrics_name_not_blank
    check (length(btrim(metric_name)) > 0),
  constraint progress_metrics_unit_not_blank
    check (unit is null or length(btrim(unit)) > 0),
  constraint progress_metrics_published_at_required_when_published
    check (status <> 'published' or published_at is not null)
);

create or replace function public.is_fitness_metric_category(
  metric_category public.metric_category
)
returns boolean
language sql
immutable
as $$
  select metric_category = 'fitness';
$$;

create or replace function public.preserve_progress_metric_immutable_fields()
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

create or replace function public.set_progress_metric_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published' then
    if tg_op = 'INSERT' then
      new.published_at = now();
    elsif old.status is distinct from 'published' then
      new.published_at = now();
    else
      new.published_at = old.published_at;
    end if;
  elsif new.status <> 'published' then
    new.published_at = null;
  end if;

  return new;
end;
$$;

create trigger preserve_progress_metric_immutable_fields
  before update on public.progress_metrics
  for each row execute function public.preserve_progress_metric_immutable_fields();

create trigger set_progress_metric_published_at
  before insert or update on public.progress_metrics
  for each row execute function public.set_progress_metric_published_at();

create trigger set_progress_metrics_updated_at
  before update on public.progress_metrics
  for each row execute function public.set_updated_at();

create index progress_metrics_student_status_recorded_idx
  on public.progress_metrics (student_user_id, status, recorded_at desc);

create index progress_metrics_student_category_recorded_idx
  on public.progress_metrics (student_user_id, category, recorded_at desc);

create index progress_metrics_student_visibility_idx
  on public.progress_metrics (student_user_id, visibility);

alter table public.progress_metrics enable row level security;

create policy "progress_metrics_select_authorized"
  on public.progress_metrics for select
  to authenticated
  using (
    public.is_admin()
    or public.is_assigned_coach(student_user_id)
    or (
      public.is_assigned_fitness(student_user_id)
      and public.is_fitness_metric_category(category)
    )
    or (
      status = 'published'
      and visibility = 'student_parent'
      and (
        auth.uid() = student_user_id
        or public.is_linked_parent(student_user_id)
      )
    )
  );

create policy "progress_metrics_insert_authorized"
  on public.progress_metrics for insert
  to authenticated
  with check (
    created_by_user_id = auth.uid()
    and (
      public.is_admin()
      or public.is_assigned_coach(student_user_id)
      or (
        public.is_assigned_fitness(student_user_id)
        and public.is_fitness_metric_category(category)
      )
    )
  );

create policy "progress_metrics_update_authorized"
  on public.progress_metrics for update
  to authenticated
  using (
    public.is_admin()
    or public.is_assigned_coach(student_user_id)
    or (
      public.is_assigned_fitness(student_user_id)
      and public.is_fitness_metric_category(category)
    )
  )
  with check (
    public.is_admin()
    or public.is_assigned_coach(student_user_id)
    or (
      public.is_assigned_fitness(student_user_id)
      and public.is_fitness_metric_category(category)
    )
  );
