// SQLite schema for local Course Factory development.
// Translation from the Postgres schema in supabase/migrations/0001_init.sql.
//
// Differences from Postgres:
// - UUIDs are generated in app code via crypto.randomUUID(), stored as text
// - jsonb columns → text columns (we JSON.stringify/parse at the boundary)
// - timestamptz → integer (unix ms)
// - vector(1536) → text (JSON-encoded array, decoded for in-memory cosine)
// - text[] → text (JSON-encoded array)
// - RLS dropped — local mode is single-user (admin password gate)
import {
  sqliteTable,
  text,
  integer,
  real,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";

// ─── Course Factory (private) ────────────────────────────────────────────

export const courseProjects = sqliteTable(
  "course_projects",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    category: text("category"),
    difficulty: text("difficulty"), // beginner | intermediate | advanced | mixed
    audience: text("audience"),
    learningGoals: text("learning_goals"),
    tags: text("tags").default("[]").notNull(), // JSON array of strings
    estimatedMinutes: integer("estimated_minutes"),
    status: text("status").default("draft").notNull(), // draft | ingesting | outline_ready | generating | review | published | archived
    outline: text("outline"), // JSON-encoded Outline
    metadata: text("metadata").default("{}").notNull(),
    createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
    updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
  },
  (t) => ({
    statusIdx: index("course_projects_status_idx").on(t.status),
  })
);

export const sources = sqliteTable(
  "sources",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => courseProjects.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // pdf | url | text | transcript
    title: text("title"),
    url: text("url"),
    author: text("author"),
    publicationDate: text("publication_date"),
    license: text("license"),
    copyrightRisk: text("copyright_risk").default("unknown").notNull(),
    storagePath: text("storage_path"),
    contentHash: text("content_hash"),
    rawText: text("raw_text"),
    tokenCount: integer("token_count"),
    status: text("status").default("pending").notNull(), // pending | extracting | chunking | embedding | ready | error
    error: text("error"),
    metadata: text("metadata").default("{}").notNull(),
    createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
    updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
  },
  (t) => ({
    projectIdx: index("sources_project_idx").on(t.projectId),
    statusIdx: index("sources_status_idx").on(t.status),
    projectHashIdx: uniqueIndex("sources_project_hash_unique").on(
      t.projectId,
      t.contentHash
    ),
  })
);

export const sourceChunks = sqliteTable(
  "source_chunks",
  {
    id: text("id").primaryKey(),
    sourceId: text("source_id")
      .notNull()
      .references(() => sources.id, { onDelete: "cascade" }),
    projectId: text("project_id")
      .notNull()
      .references(() => courseProjects.id, { onDelete: "cascade" }),
    chunkIndex: integer("chunk_index").notNull(),
    content: text("content").notNull(),
    tokenCount: integer("token_count"),
    embedding: text("embedding"), // JSON-encoded number[]
    metadata: text("metadata").default("{}").notNull(),
    createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  },
  (t) => ({
    projectIdx: index("source_chunks_project_idx").on(t.projectId),
    sourceIdx: index("source_chunks_source_idx").on(t.sourceId),
  })
);

export const concepts = sqliteTable(
  "concepts",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => courseProjects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    category: text("category"),
    embedding: text("embedding"),
    sourceChunkIds: text("source_chunk_ids").default("[]").notNull(),
    metadata: text("metadata").default("{}").notNull(),
    createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  },
  (t) => ({ projectIdx: index("concepts_project_idx").on(t.projectId) })
);

export const modules = sqliteTable(
  "modules",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => courseProjects.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    title: text("title").notNull(),
    summary: text("summary"),
    estimatedMinutes: integer("estimated_minutes"),
    keyConcepts: text("key_concepts").default("[]").notNull(),
    status: text("status").default("draft").notNull(),
    createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
    updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
  },
  (t) => ({
    projectPosIdx: index("modules_project_pos_idx").on(t.projectId, t.position),
  })
);

export const lessons = sqliteTable(
  "lessons",
  {
    id: text("id").primaryKey(),
    moduleId: text("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    projectId: text("project_id")
      .notNull()
      .references(() => courseProjects.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    title: text("title").notNull(),
    hook: text("hook"),
    objective: text("objective"),
    simplifiedExplanation: text("simplified_explanation"),
    technicalExplanation: text("technical_explanation"),
    analogy: text("analogy"),
    examples: text("examples").default("[]").notNull(),
    diagrams: text("diagrams").default("[]").notNull(),
    commonMistakes: text("common_mistakes").default("[]").notNull(),
    summary: text("summary"),
    bodyMarkdown: text("body_markdown"),
    status: text("status").default("draft").notNull(),
    metadata: text("metadata").default("{}").notNull(),
    createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
    updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
  },
  (t) => ({
    modulePosIdx: index("lessons_module_pos_idx").on(t.moduleId, t.position),
    projectIdx: index("lessons_project_idx").on(t.projectId),
  })
);

export const lessonChunks = sqliteTable(
  "lesson_chunks",
  {
    id: text("id").primaryKey(),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    projectId: text("project_id")
      .notNull()
      .references(() => courseProjects.id, { onDelete: "cascade" }),
    chunkIndex: integer("chunk_index").notNull(),
    content: text("content").notNull(),
    tokenCount: integer("token_count"),
    embedding: text("embedding"), // JSON-encoded number[]
    metadata: text("metadata").default("{}").notNull(),
    createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  },
  (t) => ({
    projectIdx: index("lesson_chunks_project_idx").on(t.projectId),
    lessonIdx: index("lesson_chunks_lesson_idx").on(t.lessonId),
  })
);

export const quizzes = sqliteTable("quizzes", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => courseProjects.id, { onDelete: "cascade" }),
  moduleId: text("module_id").references(() => modules.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id").references(() => lessons.id, { onDelete: "cascade" }),
  title: text("title"),
  scoring: text("scoring").default("{}").notNull(),
  status: text("status").default("draft").notNull(),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
});

export const quizQuestions = sqliteTable("quiz_questions", {
  id: text("id").primaryKey(),
  quizId: text("quiz_id")
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  type: text("type").notNull(),
  prompt: text("prompt").notNull(),
  choices: text("choices").default("[]").notNull(),
  correctAnswer: text("correct_answer"),
  explanation: text("explanation"),
  points: integer("points").default(1).notNull(),
});

export const glossaryTerms = sqliteTable("glossary_terms", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => courseProjects.id, { onDelete: "cascade" }),
  term: text("term").notNull(),
  definition: text("definition").notNull(),
  relatedTerms: text("related_terms").default("[]").notNull(),
  metadata: text("metadata").default("{}").notNull(),
});

export const assignments = sqliteTable("assignments", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => courseProjects.id, { onDelete: "cascade" }),
  moduleId: text("module_id").references(() => modules.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id").references(() => lessons.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  instructions: text("instructions").notNull(),
  rubric: text("rubric").default("{}").notNull(),
  estimatedMinutes: integer("estimated_minutes"),
});

export const processingJobs = sqliteTable("processing_jobs", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => courseProjects.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  status: text("status").default("pending").notNull(),
  progress: real("progress").default(0).notNull(),
  payload: text("payload").default("{}").notNull(),
  result: text("result"),
  error: text("error"),
  startedAt: integer("started_at"),
  completedAt: integer("completed_at"),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
});

// ─── Public portal (used in Batch 3+) ────────────────────────────────────

export const publishedCourses = sqliteTable("published_courses", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => courseProjects.id, { onDelete: "cascade" }),
  slug: text("slug").unique().notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  heroUrl: text("hero_url"),
  category: text("category"),
  difficulty: text("difficulty"),
  priceCents: integer("price_cents").default(0).notNull(),
  currency: text("currency").default("USD").notNull(),
  durationMinutes: integer("duration_minutes"),
  outcomes: text("outcomes").default("[]").notNull(),
  prerequisites: text("prerequisites").default("[]").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  publishedAt: integer("published_at").notNull().$defaultFn(() => Date.now()),
  metadata: text("metadata").default("{}").notNull(),
});

export const contentSafetyFlags = sqliteTable("content_safety_flags", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => courseProjects.id, { onDelete: "cascade" }),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  riskType: text("risk_type").notNull(),
  severity: text("severity").notNull(),
  details: text("details").default("{}").notNull(),
  resolved: integer("resolved", { mode: "boolean" }).default(false).notNull(),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
});

export type CourseProject = typeof courseProjects.$inferSelect;
export type Source = typeof sources.$inferSelect;
export type Module = typeof modules.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
