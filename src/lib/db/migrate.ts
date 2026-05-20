// Hand-written migration runner. We keep one canonical "current schema"
// here as IF NOT EXISTS DDL so first-run on a fresh machine just works
// without any drizzle-kit CLI step. When the schema evolves we'll bump
// SCHEMA_VERSION and add forward migrations.
import type Database from "better-sqlite3";

const SCHEMA_VERSION = 1;

const CURRENT_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS course_projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  difficulty TEXT,
  audience TEXT,
  learning_goals TEXT,
  tags TEXT NOT NULL DEFAULT '[]',
  estimated_minutes INTEGER,
  status TEXT NOT NULL DEFAULT 'draft',
  outline TEXT,
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS course_projects_status_idx ON course_projects(status);

CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES course_projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT,
  url TEXT,
  author TEXT,
  publication_date TEXT,
  license TEXT,
  copyright_risk TEXT NOT NULL DEFAULT 'unknown',
  storage_path TEXT,
  content_hash TEXT,
  raw_text TEXT,
  token_count INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sources_project_idx ON sources(project_id);
CREATE INDEX IF NOT EXISTS sources_status_idx ON sources(status);
CREATE UNIQUE INDEX IF NOT EXISTS sources_project_hash_unique
  ON sources(project_id, content_hash) WHERE content_hash IS NOT NULL;

CREATE TABLE IF NOT EXISTS source_chunks (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES course_projects(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  token_count INTEGER,
  embedding TEXT,
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS source_chunks_project_idx ON source_chunks(project_id);
CREATE INDEX IF NOT EXISTS source_chunks_source_idx ON source_chunks(source_id);

CREATE TABLE IF NOT EXISTS concepts (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES course_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  embedding TEXT,
  source_chunk_ids TEXT NOT NULL DEFAULT '[]',
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS concepts_project_idx ON concepts(project_id);

CREATE TABLE IF NOT EXISTS modules (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES course_projects(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  estimated_minutes INTEGER,
  key_concepts TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS modules_project_pos_idx ON modules(project_id, position);

CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES course_projects(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  title TEXT NOT NULL,
  hook TEXT,
  objective TEXT,
  simplified_explanation TEXT,
  technical_explanation TEXT,
  analogy TEXT,
  examples TEXT NOT NULL DEFAULT '[]',
  diagrams TEXT NOT NULL DEFAULT '[]',
  common_mistakes TEXT NOT NULL DEFAULT '[]',
  summary TEXT,
  body_markdown TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS lessons_module_pos_idx ON lessons(module_id, position);
CREATE INDEX IF NOT EXISTS lessons_project_idx ON lessons(project_id);

CREATE TABLE IF NOT EXISTS lesson_chunks (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES course_projects(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  token_count INTEGER,
  embedding TEXT,
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS lesson_chunks_project_idx ON lesson_chunks(project_id);
CREATE INDEX IF NOT EXISTS lesson_chunks_lesson_idx ON lesson_chunks(lesson_id);

CREATE TABLE IF NOT EXISTS quizzes (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES course_projects(id) ON DELETE CASCADE,
  module_id TEXT REFERENCES modules(id) ON DELETE CASCADE,
  lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT,
  scoring TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  type TEXT NOT NULL,
  prompt TEXT NOT NULL,
  choices TEXT NOT NULL DEFAULT '[]',
  correct_answer TEXT,
  explanation TEXT,
  points INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS glossary_terms (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES course_projects(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  related_terms TEXT NOT NULL DEFAULT '[]',
  metadata TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES course_projects(id) ON DELETE CASCADE,
  module_id TEXT REFERENCES modules(id) ON DELETE CASCADE,
  lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  instructions TEXT NOT NULL,
  rubric TEXT NOT NULL DEFAULT '{}',
  estimated_minutes INTEGER
);

CREATE TABLE IF NOT EXISTS processing_jobs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES course_projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  progress REAL NOT NULL DEFAULT 0,
  payload TEXT NOT NULL DEFAULT '{}',
  result TEXT,
  error TEXT,
  started_at INTEGER,
  completed_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS published_courses (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES course_projects(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  thumbnail_url TEXT,
  hero_url TEXT,
  category TEXT,
  difficulty TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  duration_minutes INTEGER,
  outcomes TEXT NOT NULL DEFAULT '[]',
  prerequisites TEXT NOT NULL DEFAULT '[]',
  is_active INTEGER NOT NULL DEFAULT 1,
  published_at INTEGER NOT NULL,
  metadata TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS content_safety_flags (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES course_projects(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  risk_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '{}',
  resolved INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS _meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

export function runMigrations(db: Database.Database) {
  db.exec(CURRENT_SCHEMA_SQL);
  const row = db
    .prepare("SELECT value FROM _meta WHERE key = 'schema_version'")
    .get() as { value: string } | undefined;
  if (!row) {
    db.prepare(
      "INSERT INTO _meta (key, value) VALUES ('schema_version', ?)"
    ).run(String(SCHEMA_VERSION));
  }
}
