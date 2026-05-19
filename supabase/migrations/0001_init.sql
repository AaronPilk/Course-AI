-- =============================================================================
-- Course Factory — initial schema
-- =============================================================================
-- One Postgres database powering both the private Course Factory (admin)
-- and the public Course Portal (customers). RLS keeps the two sides safe.
-- =============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- =============================================================================
-- 1. Profiles (1:1 with auth.users)
-- =============================================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- 2. Course Factory (private)
-- =============================================================================

create table public.course_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  category text,
  difficulty text check (difficulty in ('beginner','intermediate','advanced','mixed')),
  audience text,
  learning_goals text,
  tags text[] not null default '{}',
  estimated_minutes int,
  status text not null default 'draft'
    check (status in ('draft','ingesting','outline_ready','generating','review','published','archived')),
  outline jsonb,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.course_projects (owner_id);
create index on public.course_projects (status);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.course_projects(id) on delete cascade,
  type text not null check (type in ('pdf','url','text','transcript')),
  title text,
  url text,
  author text,
  publication_date date,
  license text,
  copyright_risk text not null default 'unknown'
    check (copyright_risk in ('unknown','low','medium','high')),
  storage_path text,
  content_hash text,
  raw_text text,
  token_count int,
  status text not null default 'pending'
    check (status in ('pending','extracting','chunking','embedding','ready','error')),
  error text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.sources (project_id);
create index on public.sources (status);
create unique index sources_project_content_hash_idx
  on public.sources (project_id, content_hash)
  where content_hash is not null;

create table public.source_chunks (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete cascade,
  project_id uuid not null references public.course_projects(id) on delete cascade,
  chunk_index int not null,
  content text not null,
  token_count int,
  embedding vector(1536),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index on public.source_chunks (project_id);
create index on public.source_chunks (source_id);
create index source_chunks_embedding_idx
  on public.source_chunks
  using hnsw (embedding vector_cosine_ops);

create table public.concepts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.course_projects(id) on delete cascade,
  name text not null,
  description text,
  category text check (category in (
    'concept','terminology','workflow','formula','architecture',
    'historical','application','mistake','advanced'
  )),
  embedding vector(1536),
  source_chunk_ids uuid[] not null default '{}',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index on public.concepts (project_id);
create index concepts_embedding_idx
  on public.concepts
  using hnsw (embedding vector_cosine_ops);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.course_projects(id) on delete cascade,
  position int not null,
  title text not null,
  summary text,
  estimated_minutes int,
  key_concepts text[] not null default '{}',
  status text not null default 'draft'
    check (status in ('draft','generating','review','approved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.modules (project_id, position);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  project_id uuid not null references public.course_projects(id) on delete cascade,
  position int not null,
  title text not null,
  hook text,
  objective text,
  simplified_explanation text,
  technical_explanation text,
  analogy text,
  examples jsonb not null default '[]',
  diagrams jsonb not null default '[]',
  common_mistakes text[] not null default '{}',
  summary text,
  body_markdown text,
  status text not null default 'draft'
    check (status in ('draft','generating','review','approved')),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.lessons (module_id, position);
create index on public.lessons (project_id);

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.course_projects(id) on delete cascade,
  module_id uuid references public.modules(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  title text,
  scoring jsonb not null default '{}',
  status text not null default 'draft'
    check (status in ('draft','generating','review','approved')),
  created_at timestamptz not null default now()
);
create index on public.quizzes (project_id);

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  position int not null,
  type text not null check (type in ('multiple_choice','true_false','scenario','short_answer')),
  prompt text not null,
  choices jsonb not null default '[]',
  correct_answer jsonb,
  explanation text,
  points int not null default 1
);
create index on public.quiz_questions (quiz_id, position);

create table public.glossary_terms (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.course_projects(id) on delete cascade,
  term text not null,
  definition text not null,
  related_terms text[] not null default '{}',
  metadata jsonb not null default '{}'
);
create index on public.glossary_terms (project_id);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.course_projects(id) on delete cascade,
  module_id uuid references public.modules(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  title text not null,
  instructions text not null,
  rubric jsonb not null default '{}',
  estimated_minutes int
);
create index on public.assignments (project_id);

create table public.processing_jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.course_projects(id) on delete cascade,
  type text not null,
  status text not null default 'pending'
    check (status in ('pending','running','completed','failed')),
  progress numeric(5,2) not null default 0,
  payload jsonb not null default '{}',
  result jsonb,
  error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.processing_jobs (project_id);
create index on public.processing_jobs (status, created_at);

-- =============================================================================
-- 3. Public portal
-- =============================================================================

create table public.published_courses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.course_projects(id) on delete cascade,
  slug text unique not null,
  title text not null,
  subtitle text,
  description text,
  thumbnail_url text,
  hero_url text,
  category text,
  difficulty text,
  price_cents int not null default 0,
  currency text not null default 'USD',
  duration_minutes int,
  outcomes text[] not null default '{}',
  prerequisites text[] not null default '{}',
  is_active boolean not null default true,
  published_at timestamptz not null default now(),
  metadata jsonb not null default '{}'
);
create index on public.published_courses (is_active, published_at desc);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.published_courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  progress_percent numeric(5,2) not null default 0,
  last_lesson_id uuid references public.lessons(id) on delete set null,
  unique (user_id, course_id)
);
create index on public.enrollments (user_id);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.published_courses(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  time_spent_seconds int not null default 0,
  notes text,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);
create index on public.lesson_progress (user_id, course_id);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  course_id uuid not null references public.published_courses(id) on delete cascade,
  score numeric(5,2),
  max_score numeric(5,2),
  passed boolean,
  answers jsonb not null default '{}',
  completed_at timestamptz not null default now()
);
create index on public.quiz_attempts (user_id, quiz_id);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.published_courses(id) on delete cascade,
  certificate_url text,
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- =============================================================================
-- 4. Content safety
-- =============================================================================

create table public.content_safety_flags (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.course_projects(id) on delete cascade,
  target_type text not null check (target_type in ('lesson','source','quiz')),
  target_id uuid not null,
  risk_type text not null check (risk_type in (
    'similarity','copyright','uncited','protected_diagram','high_risk_source'
  )),
  severity text not null check (severity in ('low','medium','high')),
  details jsonb not null default '{}',
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.content_safety_flags (project_id, resolved);

-- =============================================================================
-- 5. Vector retrieval function
-- =============================================================================

create or replace function public.match_chunks(
  p_project_id uuid,
  p_query vector(1536),
  p_match_count int default 8
)
returns table (
  id uuid,
  source_id uuid,
  content text,
  similarity float
)
language sql
stable
as $$
  select
    sc.id,
    sc.source_id,
    sc.content,
    1 - (sc.embedding <=> p_query) as similarity
  from public.source_chunks sc
  where sc.project_id = p_project_id
    and sc.embedding is not null
  order by sc.embedding <=> p_query
  limit p_match_count;
$$;

-- =============================================================================
-- 6. updated_at trigger
-- =============================================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

do $$
declare t text;
begin
  for t in
    select unnest(array[
      'profiles','course_projects','sources','lessons',
      'modules','lesson_progress'
    ])
  loop
    execute format(
      'create trigger %I_set_updated_at before update on public.%I
       for each row execute function public.set_updated_at();',
      t, t
    );
  end loop;
end$$;

-- =============================================================================
-- 7. Row-Level Security
-- =============================================================================

alter table public.profiles            enable row level security;
alter table public.course_projects     enable row level security;
alter table public.sources             enable row level security;
alter table public.source_chunks       enable row level security;
alter table public.concepts            enable row level security;
alter table public.modules             enable row level security;
alter table public.lessons             enable row level security;
alter table public.quizzes             enable row level security;
alter table public.quiz_questions      enable row level security;
alter table public.glossary_terms      enable row level security;
alter table public.assignments         enable row level security;
alter table public.processing_jobs     enable row level security;
alter table public.published_courses   enable row level security;
alter table public.enrollments         enable row level security;
alter table public.lesson_progress     enable row level security;
alter table public.quiz_attempts       enable row level security;
alter table public.certificates        enable row level security;
alter table public.content_safety_flags enable row level security;

-- Helper: is current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- profiles
create policy "profiles self read"  on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles self update" on public.profiles
  for update using (id = auth.uid());

-- course_projects (and descendants) — owner or admin
create policy "projects owner all" on public.course_projects
  for all using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

-- generic factory-side policy: row's project must be owned by user (or admin)
create or replace function public.user_owns_project(p_id uuid)
returns boolean
language sql
stable
as $$
  select exists(
    select 1 from public.course_projects
    where id = p_id and (owner_id = auth.uid() or public.is_admin())
  );
$$;

create policy "sources via project"           on public.sources
  for all using (public.user_owns_project(project_id))
  with check (public.user_owns_project(project_id));
create policy "source_chunks via project"     on public.source_chunks
  for all using (public.user_owns_project(project_id))
  with check (public.user_owns_project(project_id));
create policy "concepts via project"          on public.concepts
  for all using (public.user_owns_project(project_id))
  with check (public.user_owns_project(project_id));
create policy "modules via project"           on public.modules
  for all using (public.user_owns_project(project_id))
  with check (public.user_owns_project(project_id));
create policy "lessons via project"           on public.lessons
  for all using (public.user_owns_project(project_id))
  with check (public.user_owns_project(project_id));
create policy "quizzes via project"           on public.quizzes
  for all using (public.user_owns_project(project_id))
  with check (public.user_owns_project(project_id));
create policy "glossary via project"          on public.glossary_terms
  for all using (public.user_owns_project(project_id))
  with check (public.user_owns_project(project_id));
create policy "assignments via project"       on public.assignments
  for all using (public.user_owns_project(project_id))
  with check (public.user_owns_project(project_id));
create policy "jobs via project"              on public.processing_jobs
  for all using (public.user_owns_project(project_id))
  with check (public.user_owns_project(project_id));
create policy "safety flags via project"      on public.content_safety_flags
  for all using (public.user_owns_project(project_id))
  with check (public.user_owns_project(project_id));

create policy "quiz_questions via project"    on public.quiz_questions
  for all using (
    exists (
      select 1 from public.quizzes q
      where q.id = quiz_id and public.user_owns_project(q.project_id)
    )
  )
  with check (
    exists (
      select 1 from public.quizzes q
      where q.id = quiz_id and public.user_owns_project(q.project_id)
    )
  );

-- public portal: anyone can read active courses
create policy "published courses public read" on public.published_courses
  for select using (is_active = true or public.is_admin());
create policy "published courses admin write" on public.published_courses
  for all using (public.is_admin()) with check (public.is_admin());

-- enrollments / progress / attempts / certs: user owns own row, admins read all
create policy "enrollments self" on public.enrollments
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
create policy "lesson_progress self" on public.lesson_progress
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
create policy "quiz_attempts self" on public.quiz_attempts
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
create policy "certificates self" on public.certificates
  for select using (user_id = auth.uid() or public.is_admin());
create policy "certificates admin write" on public.certificates
  for all using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- 8. Storage bucket for source PDFs
-- =============================================================================
-- (Run this part once via the Supabase Studio SQL editor, since it touches
--  the storage schema. Left here as documentation.)
--
-- insert into storage.buckets (id, name, public)
--   values ('sources', 'sources', false)
--   on conflict (id) do nothing;
--
-- create policy "sources bucket: owner read" on storage.objects
--   for select using (
--     bucket_id = 'sources' and (
--       auth.uid()::text = (storage.foldername(name))[1] or public.is_admin()
--     )
--   );
-- create policy "sources bucket: owner write" on storage.objects
--   for insert with check (
--     bucket_id = 'sources' and (
--       auth.uid()::text = (storage.foldername(name))[1] or public.is_admin()
--     )
--   );
