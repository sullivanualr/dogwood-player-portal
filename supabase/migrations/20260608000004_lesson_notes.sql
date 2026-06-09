create type public.lesson_note_status as enum ('draft', 'published', 'archived');

create table public.lesson_notes (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references public.student_profiles(user_id) on delete cascade,
  coach_user_id uuid references public.profiles(id) on delete set null,
  created_by_user_id uuid not null references public.profiles(id),
  title text not null,
  lesson_date date not null default current_date,
  focus_area text,
  summary text,
  note_body text,
  visibility public.visibility_level not null default 'internal',
  status public.lesson_note_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lesson_notes_title_not_blank
    check (length(btrim(title)) > 0),
  constraint lesson_notes_published_at_required_when_published
    check (status <> 'published' or published_at is not null)
);

create or replace function public.preserve_lesson_note_immutable_fields()
returns trigger
language plpgsql
as $$
begin
  new.coach_user_id = old.coach_user_id;
  new.student_user_id = old.student_user_id;
  new.created_by_user_id = old.created_by_user_id;
  new.created_at = old.created_at;
  return new;
end;
$$;

create or replace function public.set_lesson_note_published_at()
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

create trigger preserve_lesson_note_immutable_fields
  before update on public.lesson_notes
  for each row execute function public.preserve_lesson_note_immutable_fields();

create trigger set_lesson_note_published_at
  before insert or update on public.lesson_notes
  for each row execute function public.set_lesson_note_published_at();

create trigger set_lesson_notes_updated_at
  before update on public.lesson_notes
  for each row execute function public.set_updated_at();

create index lesson_notes_student_status_date_idx
  on public.lesson_notes (student_user_id, status, lesson_date desc);

create index lesson_notes_student_visibility_idx
  on public.lesson_notes (student_user_id, visibility);

create index lesson_notes_coach_date_idx
  on public.lesson_notes (coach_user_id, lesson_date desc);

alter table public.lesson_notes enable row level security;

create policy "lesson_notes_select_authorized"
  on public.lesson_notes for select
  to authenticated
  using (
    public.is_admin()
    or public.is_assigned_coach(student_user_id)
    or (
      status = 'published'
      and public.can_view_visible_record(student_user_id, visibility)
    )
  );

create policy "lesson_notes_insert_coach_or_admin"
  on public.lesson_notes for insert
  to authenticated
  with check (
    created_by_user_id = auth.uid()
    and (
      coach_user_id is null
      or coach_user_id = auth.uid()
      or public.is_admin()
    )
    and (
      public.is_admin()
      or public.is_assigned_coach(student_user_id)
    )
  );

create policy "lesson_notes_update_coach_or_admin"
  on public.lesson_notes for update
  to authenticated
  using (
    public.is_admin()
    or public.is_assigned_coach(student_user_id)
  )
  with check (
    public.is_admin()
    or public.is_assigned_coach(student_user_id)
  );
