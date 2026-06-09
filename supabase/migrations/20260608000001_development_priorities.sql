create table public.development_priorities (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references public.student_profiles(user_id) on delete cascade,
  created_by_user_id uuid not null references public.profiles(id),
  source_program_template_id uuid references public.program_templates(id) on delete set null,
  source_program_template_item_id uuid references public.program_template_items(id) on delete set null,
  owner_user_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  category text,
  priority_level public.priority_level not null default 'medium',
  target_date date,
  sort_order int not null default 0,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint development_priorities_title_not_blank
    check (length(btrim(title)) > 0)
);

create or replace function public.preserve_development_priority_immutable_fields()
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

create trigger preserve_development_priority_immutable_fields
  before update on public.development_priorities
  for each row execute function public.preserve_development_priority_immutable_fields();

create trigger set_development_priorities_updated_at
  before update on public.development_priorities
  for each row execute function public.set_updated_at();

create index development_priorities_student_status_sort_idx
  on public.development_priorities (student_user_id, status, sort_order);

create index development_priorities_student_level_idx
  on public.development_priorities (student_user_id, priority_level);

create index development_priorities_template_idx
  on public.development_priorities (source_program_template_id, source_program_template_item_id);

alter table public.development_priorities enable row level security;

create policy "development_priorities_select_authorized"
  on public.development_priorities for select
  to authenticated
  using (
    public.is_admin()
    or public.is_assigned_coach(student_user_id)
    or (
      status = 'active'
      and (
        auth.uid() = student_user_id
        or public.is_linked_parent(student_user_id)
        or public.is_assigned_fitness(student_user_id)
      )
    )
  );

create policy "development_priorities_insert_coach_or_admin"
  on public.development_priorities for insert
  to authenticated
  with check (
    created_by_user_id = auth.uid()
    and (
      public.is_admin()
      or public.is_assigned_coach(student_user_id)
    )
  );

create policy "development_priorities_update_coach_or_admin"
  on public.development_priorities for update
  to authenticated
  using (
    public.is_admin()
    or public.is_assigned_coach(student_user_id)
  )
  with check (
    public.is_admin()
    or public.is_assigned_coach(student_user_id)
  );
