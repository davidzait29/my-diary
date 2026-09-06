-- Run this in your Supabase SQL editor
-- Dashboard → SQL Editor → New query → paste → Run

-- Owner table (master + visitor password hashes)
CREATE TABLE IF NOT EXISTS owner (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  password_hash TEXT NOT NULL,
  visitor_password_hash TEXT,          -- NULL means visitor access disabled
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Entries table
CREATE TABLE IF NOT EXISTS entries (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Untitled',
  entry_date DATE NOT NULL,
  content TEXT NOT NULL,
  content_preview TEXT,
  word_count INTEGER DEFAULT 0,
  char_count INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS entries_entry_date_idx ON entries (entry_date DESC);
CREATE INDEX IF NOT EXISTS entries_search_idx ON entries USING GIN (
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))
);

-- Row Level Security
ALTER TABLE owner ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Block all anon/authenticated direct access (backend uses service_role which bypasses RLS)
CREATE POLICY "No public access to owner" ON owner
  FOR ALL TO anon, authenticated USING (false);

CREATE POLICY "No public access to entries" ON entries
  FOR ALL TO anon, authenticated USING (false);
