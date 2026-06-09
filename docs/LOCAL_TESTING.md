# Dogwood Player Portal Local Testing Guide

This guide walks a non-technical owner through the first local test of the Dogwood Player Portal.

You will set up three things:

- Node/npm, which runs the app on your computer.
- Supabase, which stores users, roles, files, and player data.
- The project environment file, which connects the app to Supabase.

## 1. Install Node/npm If Needed

1. Open PowerShell on Windows or Terminal on Mac.
2. Check whether Node and npm are installed:

```bash
node -v
npm -v
```

3. If both commands show version numbers, continue.
4. If either command fails, install the current LTS version from [nodejs.org](https://nodejs.org/).
5. Close and reopen PowerShell or Terminal.
6. Run the two commands again to confirm installation.

Recommended:

- Node.js 20 LTS or newer.
- npm 10 or newer.

## 2. Clone Or Pull The GitHub Repo

If you do not have the project folder yet:

```bash
git clone <YOUR_GITHUB_REPO_URL>
cd dogwood-player-portal
```

If you already have the project folder:

```bash
cd <YOUR_PROJECT_FOLDER>
git pull
```

Replace `<YOUR_GITHUB_REPO_URL>` and `<YOUR_PROJECT_FOLDER>` with the real GitHub URL and local folder path.

## 3. Install Dependencies

From the project folder, run:

```bash
npm install
```

This installs Next.js, React, TypeScript, Tailwind CSS, and Supabase libraries.

## 4. Create `.env.local`

In the project folder, copy the example environment file:

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Mac Terminal:

```bash
cp .env.example .env.local
```

Open `.env.local` in a text editor. You will fill it in after creating Supabase.

## 5. Create Or Connect A Supabase Project

1. Go to [supabase.com](https://supabase.com/).
2. Sign in or create an account.
3. Create a new project.
4. Save the database password somewhere secure.
5. Wait for the project to finish provisioning.

## 6. Add Supabase Environment Variables

In Supabase:

1. Open the project.
2. Go to **Project Settings**.
3. Go to **API**.
4. Copy these values:

- Project URL
- anon public key
- service_role secret key

In `.env.local`, fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Important:

- Never publish `SUPABASE_SERVICE_ROLE_KEY`.
- Do not paste real keys into GitHub issues, screenshots, chat messages, or documentation.

## 7. Apply Migrations

The migrations create the database tables, roles, permissions, RLS policies, and storage buckets.

Recommended method:

1. From the project folder, log in to Supabase:

```bash
npx supabase login
```

2. Link the local project to your Supabase project:

```bash
npx supabase link --project-ref <YOUR_PROJECT_REF>
```

The project ref is the short ID in your Supabase URL:

```text
https://YOUR_PROJECT_REF.supabase.co
```

3. Push migrations:

```bash
npx supabase db push
```

Alternative manual method:

1. Open Supabase.
2. Go to **SQL Editor**.
3. Open each file in `supabase/migrations`.
4. Run them in filename order, starting with `20260608000000_phase_0_1_foundation.sql`.

## 8. Seed Roles

The foundation migration inserts the five app roles automatically:

- admin
- coach
- student
- parent
- fitness_pt

If you need to re-run the role seed manually:

1. Open Supabase **SQL Editor**.
2. Copy the contents of `supabase/seed.sql`.
3. Run it.

## 9. Create The First Admin User

The first admin must be created directly in Supabase because the app does not yet have an admin user.

1. In Supabase, go to **Authentication**.
2. Go to **Users**.
3. Click **Add user**.
4. Enter the admin email and password.
5. Confirm the user immediately if Supabase shows an email confirmation option.
6. If available, add user metadata:

```json
{
  "first_name": "First",
  "last_name": "Admin"
}
```

7. Save the user.
8. Copy the new user's UUID from Supabase.
9. Go to **SQL Editor**.
10. Run this SQL, replacing the email and name values if needed:

```sql
update public.profiles
set
  first_name = 'First',
  last_name = 'Admin',
  email = 'admin@example.com',
  status = 'active'
where id = 'PASTE_ADMIN_USER_UUID_HERE';

insert into public.user_roles (user_id, role_id)
select
  'PASTE_ADMIN_USER_UUID_HERE',
  roles.id
from public.roles
where roles.name = 'admin'
on conflict (user_id, role_id) do nothing;
```

11. Confirm the admin user exists:

```sql
select
  profiles.email,
  roles.name as role
from public.user_roles
join public.profiles on profiles.id = user_roles.user_id
join public.roles on roles.id = user_roles.role_id
where profiles.id = 'PASTE_ADMIN_USER_UUID_HERE';
```

You should see one row with role `admin`.

## 10. Run The App Locally

From the project folder:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The login page should show Dogwood branding.

## 11. Test Login

1. Go to `http://localhost:3000/login`.
2. Sign in with the first admin email and password.
3. You should be redirected to `/admin`.
4. If you see a missing environment variable message, recheck `.env.local` and restart the app.

## 12. Test Admin Setup

After logging in as admin:

1. Open `/admin`.
2. Confirm you can see admin setup links.
3. Open `/admin/users`.
4. Create basic users for:

- Coach
- Parent
- Student
- Fitness/PT, optional for first test

## 13. Test Creating A Student

1. Go to `/admin/users`.
2. Create a user with the Student role.
3. Use a real email you can test with, or a test email for local setup.
4. Confirm the student appears in the user table.

## 14. Test Assigning Coach, Parent, And Program

1. Go to `/admin/programs`.
2. Create a program, for example `Junior Development`.
3. Go to `/admin/assignments`.
4. Assign a coach to the student.
5. Assign a parent to the student.
6. Assign the program to the student.
7. Confirm the assignment lists update.

## 15. Test Student Snapshot

As admin:

1. Go to `/coach` or `/admin`.
2. Open the student's **Student Snapshot** link.
3. Confirm the page loads at:

```text
/students/<studentId>/snapshot
```

4. Confirm the snapshot shows:

- Student name
- Current coach
- Current program
- Empty states for priorities, goals, plans, notes, assessments, metrics, files, tournaments, and workouts

Optional:

1. Sign out.
2. Sign in as the student.
3. Confirm the student lands on their own snapshot.

## 16. Common Troubleshooting

### `npm` Is Not Recognized

Node/npm is not installed or the terminal has not been restarted.

Fix:

1. Install Node.js LTS from [nodejs.org](https://nodejs.org/).
2. Close and reopen PowerShell or Terminal.
3. Run `node -v` and `npm -v`.

### `git` Is Not Recognized

Git is not installed.

Fix:

1. Install Git from [git-scm.com](https://git-scm.com/).
2. Close and reopen PowerShell or Terminal.
3. Run `git --version`.

### The App Says Supabase Environment Variables Are Missing

The `.env.local` file is missing or incomplete.

Fix:

1. Confirm `.env.local` exists in the project root.
2. Confirm it includes `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Restart `npm run dev`.

### Login Fails

Possible causes:

- Wrong email or password.
- The user was not created in Supabase Authentication.
- The Supabase user email is not confirmed.
- Migrations were not applied.
- The first admin role was not assigned.

Fix:

1. Confirm the user exists in Supabase **Authentication > Users**.
2. Confirm the user is marked confirmed in Supabase Authentication.
3. Confirm the user has a row in `public.profiles`.
4. Confirm the user has the correct row in `public.user_roles`.

### Admin Logs In But Cannot See Admin Pages

The admin role is missing.

Fix:

Run the first-admin SQL from step 9 again with the correct Supabase user UUID.

### `npx supabase db push` Fails

Possible causes:

- Not logged in to Supabase CLI.
- Project is not linked.
- Wrong project ref.
- Database password was entered incorrectly.

Fix:

```bash
npx supabase login
npx supabase link --project-ref <YOUR_PROJECT_REF>
npx supabase db push
```

### The App Runs But Pages Look Empty

This can be normal for a fresh test account. Most student pages show empty states until an admin, coach, or Fitness/PT user creates records.

### File Or Video Uploads Fail

Possible causes:

- Storage bucket migrations were not applied.
- File is too large.
- File type is not allowed.
- The user does not have permission for that student.

Fix:

1. Confirm all migrations were applied.
2. Confirm the file is within the size limit.
3. Confirm the user has the correct role and assignment.

### Port 3000 Is Already In Use

Another app is already running on port 3000.

Fix:

```bash
npm run dev -- --port 3001
```

Then open:

```text
http://localhost:3001
```

If using port 3001, update `.env.local` temporarily:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3001
```
