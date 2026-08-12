-- Supabase DDL Schema for Simple Check-In Web Application
-- Copy and paste this script into your Supabase SQL Editor to create the required table & security policies.

-- 1. Create the `people` table
CREATE TABLE IF NOT EXISTS public.people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for Anonymous / Kiosk Access
-- Allow anonymous users to view people (for phone lookup & checked-in count)
CREATE POLICY "Allow public select on people" ON public.people
    FOR SELECT USING (true);

-- Allow anonymous users to insert new people
CREATE POLICY "Allow public insert on people" ON public.people
    FOR INSERT WITH CHECK (true);

-- Allow anonymous users to update checked_in status & checked_in_at timestamp
CREATE POLICY "Allow public update on people" ON public.people
    FOR UPDATE USING (true);

-- 4. Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_people_phone ON public.people(phone);
CREATE INDEX IF NOT EXISTS idx_people_checked_in ON public.people(checked_in);
CREATE INDEX IF NOT EXISTS idx_people_checked_in_at ON public.people(checked_in_at DESC);
