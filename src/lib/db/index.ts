// Drizzle client over a local SQLite file. Auto-runs migrations on first
// load so the user never has to run a separate step.
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { runMigrations } from "./migrate";
import * as schema from "./schema";

const DATA_DIR =
  process.env.COURSE_FACTORY_DATA_DIR ??
  path.join(process.cwd(), ".local-data");
const DB_PATH = path.join(DATA_DIR, "course-factory.db");

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let _sqlite: Database.Database | null = null;

export function getDb() {
  if (_db) return _db;

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(path.join(DATA_DIR, "sources"), { recursive: true });

  _sqlite = new Database(DB_PATH);
  _sqlite.pragma("journal_mode = WAL");
  _sqlite.pragma("foreign_keys = ON");
  _sqlite.pragma("synchronous = NORMAL");

  _db = drizzle(_sqlite, { schema });

  // Apply schema (idempotent — uses CREATE TABLE IF NOT EXISTS under the
  // hood, see migrate.ts).
  runMigrations(_sqlite);

  return _db;
}

export function getRawSqlite() {
  if (!_sqlite) getDb();
  return _sqlite!;
}

export function getDataDir() {
  return DATA_DIR;
}

export function getSourcesDir() {
  return path.join(DATA_DIR, "sources");
}

// Re-export schema for ergonomic imports.
export * from "./schema";
