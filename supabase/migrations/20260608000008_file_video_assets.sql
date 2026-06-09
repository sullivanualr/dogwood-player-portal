create type public.asset_status as enum ('draft', 'published', 'archived');

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('student-files', 'student-files', false, 26214400),
  ('student-videos', 'student-videos', false, 524288000),
  ('movement-screens', 'movement-screens', false, 524288000),
  ('thumbnails', 'thumbnails', false, 15728640)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

create table public.file_assets (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references public.student_profiles(user_id) on delete cascade,
  created_by_user_id uuid not null references public.profiles(id),
  title text not null,
  description text,
  category text not null default 'general',
  visibility public.visibility_level not null default 'internal',
  status public.asset_status not null default 'draft',
  file_name text not null,
  file_type text,
  mime_type text not null,
  file_size bigint not null,
  storage_bucket text not null,
  storage_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint file_assets_title_not_blank
    check (length(btrim(title)) > 0),
  constraint file_assets_category_not_blank
    check (length(btrim(category)) > 0),
  constraint file_assets_file_name_not_blank
    check (length(btrim(file_name)) > 0),
  constraint file_assets_mime_type_not_blank
    check (length(btrim(mime_type)) > 0),
  constraint file_assets_file_size_positive
    check (file_size > 0),
  constraint file_assets_bucket_allowed
    check (storage_bucket in ('student-files', 'movement-screens')),
  constraint file_assets_storage_key_not_blank
    check (length(btrim(storage_key)) > 0),
  unique (storage_bucket, storage_key)
);

create table public.video_assets (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references public.student_profiles(user_id) on delete cascade,
  created_by_user_id uuid not null references public.profiles(id),
  title text not null,
  description text,
  category text not null default 'general',
  visibility public.visibility_level not null default 'internal',
  status public.asset_status not null default 'draft',
  file_name text not null,
  mime_type text not null,
  file_size bigint not null,
  storage_bucket text not null default 'student-videos',
  storage_key text not null,
  thumbnail_key text,
  duration_seconds integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint video_assets_title_not_blank
    check (length(btrim(title)) > 0),
  constraint video_assets_category_not_blank
    check (length(btrim(category)) > 0),
  constraint video_assets_file_name_not_blank
    check (length(btrim(file_name)) > 0),
  constraint video_assets_mime_type_not_blank
    check (length(btrim(mime_type)) > 0),
  constraint video_assets_file_size_positive
    check (file_size > 0),
  constraint video_assets_bucket_allowed
    check (storage_bucket in ('student-videos', 'movement-screens')),
  constraint video_assets_storage_key_not_blank
    check (length(btrim(storage_key)) > 0),
  constraint video_assets_duration_non_negative
    check (duration_seconds is null or duration_seconds >= 0),
  unique (storage_bucket, storage_key)
);

create or replace function public.is_fitness_asset_category(category text)
returns boolean
language sql
immutable
as $$
  select lower(btrim(category)) in ('fitness', 'movement', 'movement_screen');
$$;

create or replace function public.preserve_file_asset_immutable_fields()
returns trigger
language plpgsql
as $$
begin
  new.student_user_id = old.student_user_id;
  new.created_by_user_id = old.created_by_user_id;
  new.file_name = old.file_name;
  new.file_type = old.file_type;
  new.mime_type = old.mime_type;
  new.file_size = old.file_size;
  new.storage_bucket = old.storage_bucket;
  new.storage_key = old.storage_key;
  new.created_at = old.created_at;
  return new;
end;
$$;

create or replace function public.preserve_video_asset_immutable_fields()
returns trigger
language plpgsql
as $$
begin
  new.student_user_id = old.student_user_id;
  new.created_by_user_id = old.created_by_user_id;
  new.file_name = old.file_name;
  new.mime_type = old.mime_type;
  new.file_size = old.file_size;
  new.storage_bucket = old.storage_bucket;
  new.storage_key = old.storage_key;
  new.created_at = old.created_at;
  return new;
end;
$$;

create trigger preserve_file_asset_immutable_fields
  before update on public.file_assets
  for each row execute function public.preserve_file_asset_immutable_fields();

create trigger set_file_assets_updated_at
  before update on public.file_assets
  for each row execute function public.set_updated_at();

create trigger preserve_video_asset_immutable_fields
  before update on public.video_assets
  for each row execute function public.preserve_video_asset_immutable_fields();

create trigger set_video_assets_updated_at
  before update on public.video_assets
  for each row execute function public.set_updated_at();

create index file_assets_student_status_created_idx
  on public.file_assets (student_user_id, status, created_at desc);

create index file_assets_student_category_created_idx
  on public.file_assets (student_user_id, category, created_at desc);

create index file_assets_student_visibility_idx
  on public.file_assets (student_user_id, visibility);

create index video_assets_student_status_created_idx
  on public.video_assets (student_user_id, status, created_at desc);

create index video_assets_student_category_created_idx
  on public.video_assets (student_user_id, category, created_at desc);

create index video_assets_student_visibility_idx
  on public.video_assets (student_user_id, visibility);

alter table public.file_assets enable row level security;
alter table public.video_assets enable row level security;

create policy "file_assets_select_authorized"
  on public.file_assets for select
  to authenticated
  using (
    public.is_admin()
    or public.is_assigned_coach(student_user_id)
    or (
      public.is_assigned_fitness(student_user_id)
      and public.is_fitness_asset_category(category)
    )
    or (
      status <> 'archived'
      and visibility = 'student_parent'
      and (
        auth.uid() = student_user_id
        or public.is_linked_parent(student_user_id)
      )
    )
  );

create policy "file_assets_insert_authorized"
  on public.file_assets for insert
  to authenticated
  with check (
    created_by_user_id = auth.uid()
    and (
      public.is_admin()
      or public.is_assigned_coach(student_user_id)
      or (
        public.is_assigned_fitness(student_user_id)
        and public.is_fitness_asset_category(category)
      )
    )
  );

create policy "file_assets_update_authorized"
  on public.file_assets for update
  to authenticated
  using (
    public.is_admin()
    or public.is_assigned_coach(student_user_id)
    or (
      public.is_assigned_fitness(student_user_id)
      and public.is_fitness_asset_category(category)
    )
  )
  with check (
    public.is_admin()
    or public.is_assigned_coach(student_user_id)
    or (
      public.is_assigned_fitness(student_user_id)
      and public.is_fitness_asset_category(category)
    )
  );

create policy "video_assets_select_authorized"
  on public.video_assets for select
  to authenticated
  using (
    public.is_admin()
    or public.is_assigned_coach(student_user_id)
    or (
      public.is_assigned_fitness(student_user_id)
      and public.is_fitness_asset_category(category)
    )
    or (
      status <> 'archived'
      and visibility = 'student_parent'
      and (
        auth.uid() = student_user_id
        or public.is_linked_parent(student_user_id)
      )
    )
  );

create policy "video_assets_insert_authorized"
  on public.video_assets for insert
  to authenticated
  with check (
    created_by_user_id = auth.uid()
    and (
      public.is_admin()
      or public.is_assigned_coach(student_user_id)
      or (
        public.is_assigned_fitness(student_user_id)
        and public.is_fitness_asset_category(category)
      )
    )
  );

create policy "video_assets_update_authorized"
  on public.video_assets for update
  to authenticated
  using (
    public.is_admin()
    or public.is_assigned_coach(student_user_id)
    or (
      public.is_assigned_fitness(student_user_id)
      and public.is_fitness_asset_category(category)
    )
  )
  with check (
    public.is_admin()
    or public.is_assigned_coach(student_user_id)
    or (
      public.is_assigned_fitness(student_user_id)
      and public.is_fitness_asset_category(category)
    )
  );
