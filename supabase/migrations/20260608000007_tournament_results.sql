create type public.tournament_result_status as enum (
  'upcoming',
  'completed',
  'cancelled',
  'archived'
);

create table public.tournament_results (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references public.student_profiles(user_id) on delete cascade,
  created_by_user_id uuid not null references public.profiles(id),
  event_name text not null,
  event_type text,
  start_date date not null,
  end_date date,
  course_name text,
  location text,
  score integer,
  finish_position text,
  field_size integer,
  status public.tournament_result_status not null default 'upcoming',
  preparation_notes text,
  result_notes text,
  coach_takeaways text,
  visibility public.visibility_level not null default 'internal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tournament_results_event_name_not_blank
    check (length(btrim(event_name)) > 0),
  constraint tournament_results_event_type_not_blank
    check (event_type is null or length(btrim(event_type)) > 0),
  constraint tournament_results_course_name_not_blank
    check (course_name is null or length(btrim(course_name)) > 0),
  constraint tournament_results_location_not_blank
    check (location is null or length(btrim(location)) > 0),
  constraint tournament_results_finish_position_not_blank
    check (finish_position is null or length(btrim(finish_position)) > 0),
  constraint tournament_results_end_date_after_start_date
    check (end_date is null or end_date >= start_date),
  constraint tournament_results_field_size_positive
    check (field_size is null or field_size > 0)
);

create or replace function public.preserve_tournament_result_immutable_fields()
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

create trigger preserve_tournament_result_immutable_fields
  before update on public.tournament_results
  for each row execute function public.preserve_tournament_result_immutable_fields();

create trigger set_tournament_results_updated_at
  before update on public.tournament_results
  for each row execute function public.set_updated_at();

create index tournament_results_student_status_start_idx
  on public.tournament_results (student_user_id, status, start_date desc);

create index tournament_results_student_start_idx
  on public.tournament_results (student_user_id, start_date desc);

create index tournament_results_student_visibility_idx
  on public.tournament_results (student_user_id, visibility);

alter table public.tournament_results enable row level security;

create policy "tournament_results_select_authorized"
  on public.tournament_results for select
  to authenticated
  using (
    public.is_admin()
    or public.is_assigned_coach(student_user_id)
    or public.is_assigned_fitness(student_user_id)
    or (
      status <> 'archived'
      and visibility = 'student_parent'
      and (
        auth.uid() = student_user_id
        or public.is_linked_parent(student_user_id)
      )
    )
  );

create policy "tournament_results_insert_coach_or_admin"
  on public.tournament_results for insert
  to authenticated
  with check (
    created_by_user_id = auth.uid()
    and (
      public.is_admin()
      or public.is_assigned_coach(student_user_id)
    )
  );

create policy "tournament_results_update_coach_or_admin"
  on public.tournament_results for update
  to authenticated
  using (
    public.is_admin()
    or public.is_assigned_coach(student_user_id)
  )
  with check (
    public.is_admin()
    or public.is_assigned_coach(student_user_id)
  );
