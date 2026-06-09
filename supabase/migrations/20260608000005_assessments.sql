create type public.assessment_type as enum (
  'trackman_combine',
  'upgame_assessment',
  'wedge_test',
  'putting_test',
  'speed_test',
  'skills_assessment',
  'movement_screen',
  'fitness_assessment',
  'other'
);

create type public.assessment_status as enum ('draft', 'published', 'archived');

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references public.student_profiles(user_id) on delete cascade,
  created_by_user_id uuid not null references public.profiles(id),
  assessment_type public.assessment_type not null,
  assessment_date date not null default current_date,
  title text not null,
  summary text,
  findings text,
  score double precision,
  score_unit text,
  visibility public.visibility_level not null default 'internal',
  status public.assessment_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assessments_title_not_blank
    check (length(btrim(title)) > 0),
  constraint assessments_score_unit_not_blank
    check (score_unit is null or length(btrim(score_unit)) > 0),
  constraint assessments_published_at_required_when_published
    check (status <> 'published' or published_at is not null)
);

create or replace function public.is_fitness_assessment_type(
  assessment_type public.assessment_type
)
returns boolean
language sql
immutable
as $$
  select assessment_type in ('movement_screen', 'fitness_assessment');
$$;

create or replace function public.preserve_assessment_immutable_fields()
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

create or replace function public.set_assessment_published_at()
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

create trigger preserve_assessment_immutable_fields
  before update on public.assessments
  for each row execute function public.preserve_assessment_immutable_fields();

create trigger set_assessment_published_at
  before insert or update on public.assessments
  for each row execute function public.set_assessment_published_at();

create trigger set_assessments_updated_at
  before update on public.assessments
  for each row execute function public.set_updated_at();

create index assessments_student_status_date_idx
  on public.assessments (student_user_id, status, assessment_date desc);

create index assessments_student_type_date_idx
  on public.assessments (student_user_id, assessment_type, assessment_date desc);

create index assessments_student_visibility_idx
  on public.assessments (student_user_id, visibility);

alter table public.assessments enable row level security;

create policy "assessments_select_authorized"
  on public.assessments for select
  to authenticated
  using (
    public.is_admin()
    or public.is_assigned_coach(student_user_id)
    or (
      public.is_assigned_fitness(student_user_id)
      and public.is_fitness_assessment_type(assessment_type)
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

create policy "assessments_insert_authorized"
  on public.assessments for insert
  to authenticated
  with check (
    created_by_user_id = auth.uid()
    and (
      public.is_admin()
      or public.is_assigned_coach(student_user_id)
      or (
        public.is_assigned_fitness(student_user_id)
        and public.is_fitness_assessment_type(assessment_type)
      )
    )
  );

create policy "assessments_update_authorized"
  on public.assessments for update
  to authenticated
  using (
    public.is_admin()
    or public.is_assigned_coach(student_user_id)
    or (
      public.is_assigned_fitness(student_user_id)
      and public.is_fitness_assessment_type(assessment_type)
    )
  )
  with check (
    public.is_admin()
    or public.is_assigned_coach(student_user_id)
    or (
      public.is_assigned_fitness(student_user_id)
      and public.is_fitness_assessment_type(assessment_type)
    )
  );
