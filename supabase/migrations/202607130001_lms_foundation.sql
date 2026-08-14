create extension if not exists "pgcrypto";

create type public.course_status as enum ('draft', 'saved', 'published');
create type public.course_difficulty as enum ('beginner', 'intermediate', 'advanced');
create type public.resource_kind as enum ('document', 'code', 'image', 'link', 'archive', 'other');
create type public.theme_preference as enum ('light', 'dark', 'system');
create type public.auth_provider as enum ('email', 'google');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  first_name text,
  last_name text,
  avatar_url text,
  date_of_birth date,
  bio text,
  auth_provider public.auth_provider not null default 'email',
  theme_preference public.theme_preference not null default 'system',
  language text not null default 'en' check (language = 'en'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  slug text not null,
  description text not null default '',
  learning_outcomes text[] not null default '{}',
  thumbnail_url text,
  category text not null default 'Design',
  difficulty public.course_difficulty not null default 'beginner',
  preview_video_url text,
  status public.course_status not null default 'draft',
  duration_minutes integer not null default 0 check (duration_minutes >= 0),
  rating numeric(3, 2) not null default 0 check (rating >= 0 and rating <= 5),
  enrolled_count integer not null default 0 check (enrolled_count >= 0),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint courses_slug_unique unique (slug)
);

create table public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, sort_order)
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  module_id uuid not null references public.course_modules(id) on delete cascade,
  title text not null,
  description text,
  youtube_url text not null,
  duration_minutes integer not null default 0 check (duration_minutes >= 0),
  core_concept text,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module_id, sort_order)
);

create table public.lesson_resources (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  title text not null,
  file_path text,
  external_url text,
  file_name text,
  file_size text,
  resource_kind public.resource_kind not null default 'document',
  created_at timestamptz not null default now(),
  check (file_path is not null or external_url is not null)
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  progress_percent numeric(5, 2) not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  completed_at timestamptz,
  last_watched_lesson_id uuid references public.lessons(id) on delete set null,
  last_watched_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  is_completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table public.study_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_date date not null,
  minutes_studied integer not null default 0 check (minutes_studied >= 0),
  lessons_completed integer not null default 0 check (lessons_completed >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, activity_date)
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

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger courses_set_updated_at
before update on public.courses
for each row execute function public.set_updated_at();

create trigger course_modules_set_updated_at
before update on public.course_modules
for each row execute function public.set_updated_at();

create trigger lessons_set_updated_at
before update on public.lessons
for each row execute function public.set_updated_at();

create trigger enrollments_set_updated_at
before update on public.enrollments
for each row execute function public.set_updated_at();

create trigger study_activity_set_updated_at
before update on public.study_activity
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, avatar_url, auth_provider)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'given_name'),
    coalesce(new.raw_user_meta_data ->> 'last_name', new.raw_user_meta_data ->> 'family_name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture'),
    case
      when new.app_metadata ->> 'provider' = 'google' then 'google'::public.auth_provider
      else 'email'::public.auth_provider
    end
  )
  on conflict (id) do update set
    email = excluded.email,
    first_name = coalesce(public.profiles.first_name, excluded.first_name),
    last_name = coalesce(public.profiles.last_name, excluded.last_name),
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_resources enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.study_activity enable row level security;

create policy "profiles are viewable by authenticated users"
on public.profiles for select
to authenticated
using (true);

create policy "users update their own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "users insert their own profile"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

create policy "published courses are visible to authenticated users"
on public.courses for select
to authenticated
using (status = 'published' or instructor_id = auth.uid());

create policy "authenticated users can create owned courses"
on public.courses for insert
to authenticated
with check (instructor_id = auth.uid());

create policy "instructors update owned courses"
on public.courses for update
to authenticated
using (instructor_id = auth.uid())
with check (instructor_id = auth.uid());

create policy "instructors delete owned courses"
on public.courses for delete
to authenticated
using (instructor_id = auth.uid());

create policy "course modules follow course visibility"
on public.course_modules for select
to authenticated
using (
  exists (
    select 1 from public.courses
    where courses.id = course_modules.course_id
      and (courses.status = 'published' or courses.instructor_id = auth.uid())
  )
);

create policy "instructors manage owned modules"
on public.course_modules for all
to authenticated
using (
  exists (
    select 1 from public.courses
    where courses.id = course_modules.course_id
      and courses.instructor_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.courses
    where courses.id = course_modules.course_id
      and courses.instructor_id = auth.uid()
  )
);

create policy "lessons follow course visibility"
on public.lessons for select
to authenticated
using (
  exists (
    select 1 from public.courses
    where courses.id = lessons.course_id
      and (courses.status = 'published' or courses.instructor_id = auth.uid())
  )
);

create policy "instructors manage owned lessons"
on public.lessons for all
to authenticated
using (
  exists (
    select 1 from public.courses
    where courses.id = lessons.course_id
      and courses.instructor_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.courses
    where courses.id = lessons.course_id
      and courses.instructor_id = auth.uid()
  )
);

create policy "resources follow course visibility"
on public.lesson_resources for select
to authenticated
using (
  exists (
    select 1 from public.courses
    where courses.id = lesson_resources.course_id
      and (courses.status = 'published' or courses.instructor_id = auth.uid())
  )
);

create policy "instructors manage owned resources"
on public.lesson_resources for all
to authenticated
using (
  exists (
    select 1 from public.courses
    where courses.id = lesson_resources.course_id
      and courses.instructor_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.courses
    where courses.id = lesson_resources.course_id
      and courses.instructor_id = auth.uid()
  )
);

create policy "users view own enrollments"
on public.enrollments for select
to authenticated
using (user_id = auth.uid());

create policy "users enroll themselves in published courses"
on public.enrollments for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.courses
    where courses.id = enrollments.course_id
      and courses.status = 'published'
  )
);

create policy "users update own enrollments"
on public.enrollments for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "users manage own lesson progress"
on public.lesson_progress for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "users manage own study activity"
on public.study_activity for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('course-thumbnails', 'course-thumbnails', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('lesson-resources', 'lesson-resources', true, 10485760, array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/markdown',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/zip'
  ])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "users manage own avatar files"
on storage.objects for all
to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "public view avatars"
on storage.objects for select
to public
using (bucket_id = 'avatars');

create policy "instructors manage course thumbnails"
on storage.objects for all
to authenticated
using (bucket_id = 'course-thumbnails' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'course-thumbnails' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "public view course thumbnails"
on storage.objects for select
to public
using (bucket_id = 'course-thumbnails');

create policy "instructors manage lesson resources"
on storage.objects for all
to authenticated
using (bucket_id = 'lesson-resources' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'lesson-resources' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "authenticated users view lesson resources"
on storage.objects for select
to authenticated
using (bucket_id = 'lesson-resources');
