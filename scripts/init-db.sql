-- =============================================================================
-- Synapse AI – Database Initialization Script
--
-- Usage (PostgreSQL):
--   psql -U synapseai -d synapseai -f scripts/init-db.sql
--
-- This script is idempotent – safe to run multiple times.
-- =============================================================================

-- Enable pgvector extension for semantic search (optional, skip if unavailable)
CREATE EXTENSION IF NOT EXISTS vector;

-- ── Users ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "user" (
    id          SERIAL PRIMARY KEY,
    email       TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);

-- ── Chat Sessions ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS session (
    id          TEXT PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    name        TEXT NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_user_id ON session(user_id);

-- ── Threads (LangGraph) ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS thread (
    id          TEXT PRIMARY KEY,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Tasks (AI-powered to-do items) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS task (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    title               TEXT NOT NULL,
    description         TEXT NOT NULL DEFAULT '',
    completed           BOOLEAN NOT NULL DEFAULT FALSE,
    priority            TEXT NOT NULL DEFAULT 'medium',
    category            TEXT NOT NULL DEFAULT '',
    due_date            TEXT NOT NULL DEFAULT '',
    ai_priority_score   DOUBLE PRECISION,
    ai_suggested_due_date TEXT,
    ai_summary          TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_task_user_id   ON task(user_id);
CREATE INDEX IF NOT EXISTS idx_task_completed ON task(completed);
CREATE INDEX IF NOT EXISTS idx_task_priority  ON task(priority);

-- ── LangGraph Checkpoint Tables ────────────────────────────────────────────
-- These are normally auto-created by langgraph-checkpoint-postgres.
-- Including stubs here so manual DB inspection shows complete schema.

CREATE TABLE IF NOT EXISTS checkpoints (
    thread_id   TEXT NOT NULL,
    checkpoint_ns TEXT NOT NULL DEFAULT '',
    checkpoint_id TEXT NOT NULL,
    parent_checkpoint_id TEXT,
    type        TEXT,
    checkpoint  JSONB NOT NULL,
    metadata    JSONB NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id)
);

CREATE TABLE IF NOT EXISTS checkpoint_writes (
    thread_id   TEXT NOT NULL,
    checkpoint_ns TEXT NOT NULL DEFAULT '',
    checkpoint_id TEXT NOT NULL,
    task_id     TEXT NOT NULL,
    idx         INTEGER NOT NULL,
    channel     TEXT NOT NULL,
    type        TEXT,
    value       JSONB,
    PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id, task_id, idx)
);

-- Done!
