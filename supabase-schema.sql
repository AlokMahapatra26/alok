-- ==============================================================================
-- PostgreSQL Database Schema for Alok Mahapatra (Journal & Stories)
-- Compatible with Supabase, Neon, Railway, Docker, or any standard PostgreSQL (v13+)
-- ==============================================================================

-- 0. Ensure UUID extension is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. Tables Definition
-- ==============================================================================

-- Stories Table
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  excerpt TEXT NOT NULL,
  category TEXT DEFAULT 'Story',
  read_time TEXT DEFAULT '5 min',
  content TEXT[] NOT NULL DEFAULT '{}',
  cover_image TEXT DEFAULT '',
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure cover_image column exists if table was created previously
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS cover_image TEXT DEFAULT '';

-- Diary Entries Table
CREATE TABLE IF NOT EXISTS public.diary_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT[] NOT NULL DEFAULT '{}',
  mood TEXT DEFAULT 'Reflective',
  mood_emoji TEXT DEFAULT '🌧️',
  location TEXT DEFAULT '',
  weather TEXT DEFAULT '',
  time_of_day TEXT DEFAULT '',
  read_time TEXT DEFAULT '2 min',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comments Table (reader reflections on stories)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_slug TEXT NOT NULL,
  author TEXT NOT NULL,
  text TEXT NOT NULL,
  likes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 2. Performance Indexes
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_stories_slug ON public.stories(slug);
CREATE INDEX IF NOT EXISTS idx_stories_published ON public.stories(published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diary_entries_slug ON public.diary_entries(slug);
CREATE INDEX IF NOT EXISTS idx_diary_entries_created_at ON public.diary_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_story_slug ON public.comments(story_slug, created_at DESC);

-- ==============================================================================
-- 3. Row Level Security (RLS) & Policies for Supabase
-- If running outside Supabase on standard PostgreSQL, the block below is optional.
-- ==============================================================================

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Stories Policies (Idempotent: drop before create)
DROP POLICY IF EXISTS "Public can view published stories" ON public.stories;
CREATE POLICY "Public can view published stories"
  ON public.stories FOR SELECT
  USING (published = true);

DROP POLICY IF EXISTS "Author can manage stories" ON public.stories;
CREATE POLICY "Author can manage stories"
  ON public.stories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Diary Entries Policies
DROP POLICY IF EXISTS "Public can view diary entries" ON public.diary_entries;
CREATE POLICY "Public can view diary entries"
  ON public.diary_entries FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Author can manage diary entries" ON public.diary_entries;
CREATE POLICY "Author can manage diary entries"
  ON public.diary_entries FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Comments Policies
DROP POLICY IF EXISTS "Public can view comments" ON public.comments;
CREATE POLICY "Public can view comments"
  ON public.comments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Readers can submit comments" ON public.comments;
CREATE POLICY "Readers can submit comments"
  ON public.comments FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Readers can like comments" ON public.comments;
CREATE POLICY "Readers can like comments"
  ON public.comments FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Author can delete comments" ON public.comments;
CREATE POLICY "Author can delete comments"
  ON public.comments FOR DELETE
  TO authenticated
  USING (true);

-- ==============================================================================
-- Thoughts About Me Table (Public Wall / Guestbook on /more)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.thoughts_about_me (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  relation TEXT DEFAULT '',
  reply TEXT DEFAULT '',
  replied_at TIMESTAMPTZ,
  likes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.thoughts_about_me ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view thoughts" ON public.thoughts_about_me;
CREATE POLICY "Public can view thoughts"
  ON public.thoughts_about_me FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public can submit thoughts" ON public.thoughts_about_me;
CREATE POLICY "Public can submit thoughts"
  ON public.thoughts_about_me FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update thoughts likes or author reply" ON public.thoughts_about_me;
CREATE POLICY "Anyone can update thoughts likes or author reply"
  ON public.thoughts_about_me FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Author can delete thoughts" ON public.thoughts_about_me;
CREATE POLICY "Author can delete thoughts"
  ON public.thoughts_about_me FOR DELETE
  USING (true);

