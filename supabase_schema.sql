-- Supabase Schema for Simple Check-In Web Application
-- Run this script in your Supabase SQL Editor to create the required tables & policies.

-- 1. Create Members Table
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    check_in_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create Check-Ins Table
CREATE TABLE IF NOT EXISTS public.check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for Public / Anonymous Access (For Check-In Kiosk mode)
-- Members table policies
CREATE POLICY "Allow public select on members" ON public.members
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on members" ON public.members
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on members" ON public.members
    FOR UPDATE USING (true);

-- Check-ins table policies
CREATE POLICY "Allow public select on check_ins" ON public.check_ins
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on check_ins" ON public.check_ins
    FOR INSERT WITH CHECK (true);

-- 5. Create Indexes for fast phone lookups and recent check-ins queries
CREATE INDEX IF NOT EXISTS idx_members_phone ON public.members(phone);
CREATE INDEX IF NOT EXISTS idx_check_ins_created_at ON public.check_ins(created_at DESC);
