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

---

# Adding orders & messaging

Run this after everything above. It adds a separate `orders` table
(created by admins only, not generated automatically from enquiries),
a per-order `messages` thread, and a helper function admins use to
find a client's account by email.

```sql
-- Let enquiries remember who submitted them, if they were signed in
alter table enquiries add column user_id uuid references profiles(id);

-- The old insert policy only allowed the "anon" role — widen it so
-- signed-in customers can submit too
drop policy if exists "Anyone can submit an enquiry" on enquiries;
create policy "Anyone can submit an enquiry"
on enquiries
for insert
to anon, authenticated
with check (true);

-- Orders: created by admins only, visible to the client they belong to
create table orders (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  enquiry_id bigint references enquiries(id) on delete set null,
  service text not null,
  status text not null default 'pending' check (status in ('pending','in_progress','completed','cancelled')),
  price numeric,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table orders enable row level security;

create policy "Clients can read their own orders, admins read all"
on orders for select
to authenticated
using (
  user_id = auth.uid()
  or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

create policy "Admins can create orders"
on orders for insert
to authenticated
with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

create policy "Admins can update orders"
on orders for update
to authenticated
using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Messages: one thread per order, readable/writable by that order's
-- client and any admin
create table messages (
  id bigint generated always as identity primary key,
  order_id bigint references orders(id) on delete cascade not null,
  sender_id uuid references profiles(id) not null,
  sender_role text not null check (sender_role in ('client','admin')),
  body text not null,
  read boolean not null default false,
  created_at timestamptz default now()
);

alter table messages enable row level security;

create policy "Order participants can read messages"
on messages for select
to authenticated
using (
  exists (
    select 1 from orders
    where orders.id = messages.order_id
      and (orders.user_id = auth.uid() or exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
  )
);

create policy "Order participants can send messages"
on messages for insert
to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1 from orders
    where orders.id = messages.order_id
      and (orders.user_id = auth.uid() or exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
  )
);

create policy "Order participants can mark messages read"
on messages for update
to authenticated
using (
  exists (
    select 1 from orders
    where orders.id = messages.order_id
      and (orders.user_id = auth.uid() or exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
  )
)
with check (
  exists (
    select 1 from orders
    where orders.id = messages.order_id
      and (orders.user_id = auth.uid() or exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
  )
);

-- Turn on live updates for the chat threads
alter publication supabase_realtime add table messages;

-- Lets an admin turn a client's email into their account id, so they
-- can create an order without you needing to look up ids manually.
-- Refuses to run for anyone who isn't an admin.
create or replace function admin_lookup_user_id(lookup_email text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role text;
  target_id uuid;
begin
  select role into caller_role from profiles where id = auth.uid();
  if caller_role is distinct from 'admin' then
    raise exception 'not authorized';
  end if;

  select id into target_id from profiles where email = lookup_email limit 1;
  return target_id;
end;
$$;

grant execute on function admin_lookup_user_id(text) to authenticated;
```

If `alter publication supabase_realtime add table messages;` errors
saying the table's already in the publication, that's fine — it just
means Realtime is already on for it. You can also check/set this in
the dashboard under **Database → Replication**.

## How the order workflow works
1. A customer sends a quote request (`quote.html`) or general enquiry
   (`contact.html`) — same as before, lands in `enquiries`.
2. You (admin) look at `admin.html`, and against any enquiry click
   **Create order**, which pre-fills the "New order" form with that
   enquiry's service and email.
3. Creating the order needs the customer to already have an account
   with that email (the RPC above looks it up) — if they don't, ask
   them to sign up first, then create the order.
4. The order now shows up on the customer's dashboard (`account.html`)
   under Pending orders, and both sides can message each other on
   `order.html` (customer) / `admin-order.html` (you) — messages
   appear live on both ends without refreshing.
5. You update the order's status from `admin-order.html`; once it's
   `completed` or `cancelled` it moves into the customer's Order
   history.
