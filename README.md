# ⚡ ExpressCheck - Simple Member Check-In Web Application

A production-ready, responsive, mobile-friendly **Check-In Web Application** built for an AI Operations Specialist take-home assessment.

---

## 🌐 Live Application & Links

- **Live URL**: [https://amb3r-sui.github.io/simple-checkin-app/](https://amb3r-sui.github.io/simple-checkin-app/)
- **GitHub Repository**: [https://github.com/amb3r-sui/simple-checkin-app](https://github.com/amb3r-sui/simple-checkin-app)

---

## 🚀 1. Project Overview

ExpressCheck is an intuitive member check-in kiosk web application. It allows members to quickly enter their phone number to check in. The app queries a real **Supabase** backend to verify registration status, update check-in records, track timestamps, and dynamically maintain a running count of checked-in people.

---

## ✨ 2. Features & Workflow

- **Phone Number Normalization**: Automatically trims whitespace and strips non-digit characters (`(0917) 123-4567` -> `09171234567`) to prevent duplicates due to formatting differences.
- **Existing Member Check-In**:
  - If registered & not checked in: Updates `checked_in = true`, sets `checked_in_at = NOW()`, increments running count, and displays `✓ Checked in: [Name]`.
  - If already checked in: Does not double-count; displays `Already checked in: [Name]`.
- **New Member Registration Flow**:
  - If phone number is not found in database: Prompts for full name via a clean modal dialog (`"Phone number not found. What's your name?"`).
  - Upon submission, creates the person record in Supabase, immediately checks them in, updates count, and displays `✓ Checked in: [Name]`.
- **Real Backend Running Count**: The checked-in counter (`Checked In: 24`) queries Supabase (`SELECT COUNT(*) FROM people WHERE checked_in = true`) and persists across page reloads.
- **Recent Activity Feed**: Displays a live log of recent check-ins with masked phone numbers for privacy.
- **Loading & Safety States**: Buttons are disabled during active API requests to avoid accidental duplicate submissions.

---

## 🛠️ 3. Tech Stack

- **Frontend Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **Backend & Database**: Supabase (PostgreSQL with Row Level Security)
- **Deployment**: GitHub Pages (Static hosting for Vite production build)

---

## 🗄️ 4. Supabase Database Setup

The database uses a clean, single-table structure (`people`).

To configure your own Supabase backend:

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in Supabase and run the DDL script in [`supabase_schema.sql`](./supabase_schema.sql):

```sql
CREATE TABLE IF NOT EXISTS public.people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on people" ON public.people FOR SELECT USING (true);
CREATE POLICY "Allow public insert on people" ON public.people FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on people" ON public.people FOR UPDATE USING (true);

CREATE INDEX IF NOT EXISTS idx_people_phone ON public.people(phone);
CREATE INDEX IF NOT EXISTS idx_people_checked_in ON public.people(checked_in);
```

---

## 🔐 5. Environment Variables

Store your Supabase credentials in `.env` for local development. **Never** expose the Supabase `service_role` key in frontend code.

Refer to `.env.example`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

---

## 💻 6. Local Development Instructions

```bash
# 1. Clone repository
git clone https://github.com/amb3r-sui/simple-checkin-app.git
cd simple-checkin-app

# 2. Install dependencies
npm install

# 3. Create .env file (optional if using Supabase credentials)
cp .env.example .env

# 4. Run local Vite dev server
npm run dev

# 5. Build for production
npm run build
```

---

## 🚀 7. Deployment Instructions

This application is configured for deployment to **GitHub Pages** (or Vercel / Netlify):

```bash
# Build production bundle and push to gh-pages branch
npm run build
npx gh-pages -d dist
```

---

## 🏗️ 8. Architecture Explanation

- **`src/types/index.ts`**: Centralized TypeScript interface definitions (`Person`, `CheckInResult`, `AppStats`).
- **`src/lib/supabase.ts`**: Database interaction module. Contains phone normalization logic, Supabase client initialization (`createClient`), API CRUD helpers (`checkInByPhone`, `registerAndCheckIn`, `getAppStats`), and automatic local storage fallback when cloud credentials are unconfigured.
- **`src/components/CheckInCard.tsx`**: Main interactive component handling phone entry, digit keypad, input validation, and feedback banners.
- **`src/components/RegistrationModal.tsx`**: Accessible modal overlay for first-time user registration.
- **`src/components/StatsOverview.tsx`**: Dashboard counters rendering real-time checked-in metrics.

---

## ⚠️ 9. Known Limitations & Potential Enhancements

- **SMS Verification**: Phone numbers are normalized and validated for basic format/length, but SMS OTP verification is not included to keep kiosk check-in rapid and frictionless.
- **Daily Reset / Un-check-in**: Currently, `checked_in` is boolean state. In a multi-day event context, a automated daily cron job or reset trigger can set `checked_in = false` at midnight.
