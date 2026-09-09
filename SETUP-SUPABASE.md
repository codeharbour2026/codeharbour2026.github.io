# Connecting Supabase

## 1. Create your project
Go to supabase.com → New project. Once it's ready, go to
**Project Settings → API** and copy:
- Project URL
- anon public key

Paste both into `supabase-config.js` (replace the placeholder strings) —
make sure they stay wrapped in quotes:

```js
window.SUPABASE_URL = "https://your-project-ref.supabase.co";
window.SUPABASE_ANON_KEY = "your-long-anon-key-here";
```

## 2. Run the full schema
In the Supabase SQL Editor, run this in one go. It creates the
enquiries table, a `profiles` table that tracks whether an account is
a `customer` or an `admin`, and a trigger so every new sign-up
automatically gets a `customer` profile row.

```sql
-- Enquiries from the contact form and quote builder
create table enquiries (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  service text,
  message text not null,
  created_at timestamptz default now()
);

alter table enquiries enable row level security;

create policy "Anyone can submit an enquiry"
on enquiries
for insert
to anon
with check (true);

-- One row per account, tracking role
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can read their own profile"
on profiles
for select
to authenticated
using (auth.uid() = id);

-- Only admins (checked via their own profile row) can read enquiries
create policy "Only admins can read enquiries"
on enquiries
for select
to authenticated
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- Auto-create a profile row (role defaults to 'customer') for every new sign-up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
```

## 3. Allow public sign-up (for customers)
Go to **Authentication → Providers → Email** and make sure "Allow new
users to sign up" is **on**. Anyone who signs up through `signup.html`
gets a `customer` role automatically — they can never reach the admin
dashboard.

## 4. Create your admin account — database only
This is the one step that isn't done through the website, on purpose.

1. Go to **Authentication → Users → Add user** and create your own
   account (e.g. `admin@techindustries.example`) with a password.
   This also fires the trigger from step 2, so a `profiles` row is
   created for you with the default `customer` role.
2. Go to **Table Editor → profiles**, find the row with your email,
   and change `role` from `customer` to `admin`.

There's no button anywhere on the site that can create an admin — the
only way is this manual role change in the dashboard.

## 5. Try it
- **Customer side:** `signup.html` → creates an account → lands on
  `account.html`. The nav's Sign in/Sign up buttons should swap to
  "My account / Sign out" once logged in.
- **Enquiries:** submit the contact form or a quote request — a row
  should appear in the `enquiries` table.
- **Admin side:** `login.html` → sign in with the account you promoted
  to `admin` in step 4 → lands on `admin.html` with the enquiry list.
  If you try signing a plain customer account into `login.html`, it
  will sign them straight back out and show "That account doesn't
  have admin access."

## Note on hosting
Every script here that talks to Supabase is loaded as an ES module,
which browsers only run correctly over `http://` or `https://` — not
directly from a `file://` path. Serve the folder with any static host
(Netlify, Vercel, GitHub Pages, or `npx serve` locally) rather than
double-clicking the HTML files.
