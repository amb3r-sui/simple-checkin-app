# ⚡ ExpressCheck - Simple Member Check-In Web Application

A sleek, modern, mobile-friendly check-in web application built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, and **Supabase**.

---

## 🌐 Deliverables

- **Live Demo**: [https://amb3r-sui.github.io/simple-checkin-app/](https://amb3r-sui.github.io/simple-checkin-app/)
- **GitHub Repository**: [https://github.com/amb3r-sui/simple-checkin-app](https://github.com/amb3r-sui/simple-checkin-app)

---

## ✨ Features

1. **Phone Number Check-In**: Type or tap digits on the custom keypad, submit, and instantly see `"Checked in: [Member Name]"` on screen with confetti celebration.
2. **Real-time Counter Increment**: The total check-in count and visit count increment instantly by 1 with subtle scale animation.
3. **Supabase Real Backend**: Integrated with Supabase REST API & Realtime client SDK (`@supabase/supabase-js`) for persistent cloud database operations, with automatic local state synchronization fallback.
4. **New Member Registration (Bonus Feature)**: If a entered phone number is not registered, the app prompts for the user's name via a polished modal dialog and registers them seamlessly.
5. **Recent Activity Feed**: Displays real-time recent check-ins with relative timestamps (e.g. "Just now", "2m ago") and masked phone numbers for privacy.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **Backend / Database**: Supabase (PostgreSQL with RLS)
- **Deployment**: GitHub Pages

---

## 🗄️ Supabase Database Setup

To link your own Supabase project:

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** and run the contents of [`supabase_schema.sql`](./supabase_schema.sql).
3. Copy your project URL and Anon Public Key from **Project Settings -> API**.
4. Set environment variables in `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Build for production
npm run build
```
