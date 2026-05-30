# ✨ Glint — Campus Social Platform

> A premium, private social platform for college campuses. Built with Next.js 15, Supabase, TypeScript, and Tailwind CSS.

![Glint](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🏫 **Multi-Campus** | Each college is an isolated ecosystem |
| 📰 **Campus Feed** | Instagram-style posts with likes, comments, infinite scroll |
| 🤫 **Confessions** | Fully anonymous posting with tags & trending |
| 🛒 **Marketplace** | Buy/sell within your campus community |
| 🏛️ **Clubs** | Create and join campus clubs & communities |
| 📅 **Events** | Discover hackathons, fests, seminars |
| 👤 **Profiles** | Rich profiles with skills, social links, stats |
| 🛡️ **Admin Panel** | Moderation dashboard, reports, pin posts |
| 🔔 **Realtime** | Live notifications via Supabase realtime |
| 🌓 **Dark/Light Mode** | System-aware theme with smooth transitions |

---

## 📁 Project Structure

```
glint/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Landing page (auto-redirects logged in users)
│   │   ├── layout.tsx               # Root layout with theme provider
│   │   ├── loading.tsx              # Global loading UI
│   │   ├── error.tsx                # Global error boundary
│   │   ├── not-found.tsx            # 404 page
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx      # Multi-step signup
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── callback/route.ts   # Supabase OAuth callback
│   │   └── app/
│   │       ├── layout.tsx           # App shell (sidebar + navbar)
│   │       ├── feed/page.tsx        # Home feed
│   │       ├── marketplace/page.tsx
│   │       ├── confessions/page.tsx
│   │       ├── clubs/page.tsx
│   │       ├── events/page.tsx
│   │       ├── profile/
│   │       │   ├── page.tsx         # Own profile
│   │       │   └── [username]/page.tsx  # Public profile
│   │       ├── settings/page.tsx
│   │       ├── admin/page.tsx       # Admin-only panel
│   │       └── notifications/page.tsx
│   ├── components/
│   │   ├── ui/                      # Base UI primitives
│   │   ├── layout/                  # Sidebar, Navbar, Notifications
│   │   ├── landing/                 # Landing page sections
│   │   ├── feed/                    # Feed client
│   │   ├── marketplace/             # Marketplace client
│   │   ├── confessions/             # Confessions client
│   │   ├── clubs/                   # Clubs client
│   │   ├── events/                  # Events client
│   │   ├── profile/                 # Profile + Settings
│   │   └── admin/                   # Admin dashboard
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts            # Browser client
│   │   │   └── server.ts            # Server client + admin client
│   │   ├── actions/
│   │   │   ├── auth.ts              # Auth server actions
│   │   │   ├── posts.ts             # Post CRUD + likes/comments
│   │   │   ├── marketplace.ts       # Marketplace CRUD
│   │   │   ├── content.ts           # Confessions, clubs, events
│   │   │   └── profile.ts           # Profile update, follow, report
│   │   ├── hooks/index.ts           # Custom React hooks
│   │   ├── store.ts                 # Zustand global store
│   │   └── utils/index.ts           # Helpers, formatters, constants
│   └── types/index.ts               # All TypeScript types
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql   # Full DB schema with RLS
│       ├── 002_storage.sql          # Storage buckets + policies
│       └── 003_realtime_and_search.sql  # Realtime + notifications + search
├── middleware.ts                    # Route protection
└── ...config files
```

---

## ⚡ Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd glint
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and anon key

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Database Migrations

In your **Supabase Dashboard → SQL Editor**, run each migration file in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_storage.sql`
3. `supabase/migrations/003_realtime_and_search.sql`

### 5. Configure Supabase Auth

In **Supabase Dashboard → Authentication → URL Configuration**:
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

### 6. Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deployment (Vercel)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Add all environment variables from `.env.local`
4. Deploy!

### 3. Update Supabase Auth URLs

In **Supabase Dashboard → Authentication → URL Configuration**:
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/auth/callback`

---

## 🔑 Making Someone an Admin

Run in Supabase SQL Editor:

```sql
update public.profiles
set is_admin = true
where email = 'admin@yourcollege.edu';
```

---

## 🏫 Adding a College

```sql
insert into public.colleges (name, slug, location, verified)
values ('Your College Name', 'your-college', 'City, State', true);
```

---

## 🔐 Environment Variables Reference

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) | ✅ |
| `NEXT_PUBLIC_APP_URL` | Your app's URL | ✅ |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

---

## 📊 Database Schema

| Table | Purpose |
|---|---|
| `colleges` | Campus registry |
| `profiles` | User profiles (linked to auth.users) |
| `posts` | Feed posts with like/comment counts |
| `comments` | Post comments |
| `likes` | Post & confession likes |
| `confessions` | Anonymous confessions |
| `confession_comments` | Comments on confessions |
| `marketplace_items` | Campus buy/sell listings |
| `marketplace_messages` | Buyer-seller messages |
| `clubs` | Campus clubs/communities |
| `club_members` | Club membership with roles |
| `events` | Campus events |
| `event_interests` | Event RSVPs |
| `notifications` | Real-time notifications |
| `reports` | Content moderation reports |
| `follows` | User follow relationships |

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — feel free to use this for your campus!

---

<p align="center">Made with ❤️ for college communities everywhere</p>
#   G l i n t  
 #   G l i n t  
 