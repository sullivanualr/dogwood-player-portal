# Dogwood Player Portal

Dogwood Player Portal is a private player development web app for Dogwood Golf & Social. It tracks student profiles, coach assignments, program enrollments, development priorities, goals, practice plans, lesson notes, assessments, progress metrics, tournaments, files/videos, and fitness/workout assignments.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- Vercel

## Local Setup Quick Start

For detailed owner-friendly setup instructions, see:

```text
docs/LOCAL_TESTING.md
```

1. Install Node.js 20 LTS or newer.
2. Install dependencies:

```bash
npm install
```

3. Copy environment variables:

```bash
cp .env.example .env.local
```

4. Fill in:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Create/connect a Supabase project.
6. Apply migrations:

```bash
npx supabase login
npx supabase link --project-ref <YOUR_PROJECT_REF>
npx supabase db push
```

7. Create the first admin user in Supabase Authentication, then assign the `admin` role using the SQL in `docs/LOCAL_TESTING.md`.
8. Start the app:

```bash
npm run dev
```

9. Open:

```text
http://localhost:3000
```

## Supabase

Database migrations live in:

```text
supabase/migrations
```

They create:

- Enums
- Profiles
- Roles
- User roles
- Student, coach, and Fitness/PT profiles
- Parent, coach, and Fitness/PT assignment tables
- Programs
- Program templates
- Program template items
- Student program enrollments
- Development priorities
- Goals
- Practice plans and practice plan items
- Lesson notes
- Assessments
- Progress metrics
- Tournament results
- File and video asset records
- Fitness plans and workout assignments
- Storage buckets and storage policies
- Timestamp triggers
- Auth user profile creation trigger
- RLS helper functions
- RLS policies
- Indexes

The role seed lives at:

```text
supabase/seed.sql
```

The foundation migration also inserts the standard roles, so `seed.sql` is mainly useful if roles need to be re-run manually.

## Useful Commands

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
```
