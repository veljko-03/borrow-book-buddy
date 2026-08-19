-- Borrow Book — run this once in your Supabase project's SQL editor.

-- 1. Profiles (one row per auth user)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

grant select on public.profiles to authenticated;
grant insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select to authenticated using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);

-- Auto-create a profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Books catalog
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  genre text,
  created_at timestamptz not null default now()
);

grant select on public.books to anon, authenticated;
grant all on public.books to service_role;

alter table public.books enable row level security;

drop policy if exists "Books are public" on public.books;
create policy "Books are public" on public.books for select using (true);

insert into public.books (title, author, genre)
select * from (values
  ('The Left Hand of Darkness', 'Ursula K. Le Guin', 'Science fiction'),
  ('Beloved', 'Toni Morrison', 'Literary fiction'),
  ('Dune', 'Frank Herbert', 'Science fiction'),
  ('Norwegian Wood', 'Haruki Murakami', 'Literary fiction'),
  ('The Name of the Rose', 'Umberto Eco', 'Historical mystery'),
  ('Thinking, Fast and Slow', 'Daniel Kahneman', 'Non-fiction'),
  ('A Wizard of Earthsea', 'Ursula K. Le Guin', 'Fantasy'),
  ('The Bell Jar', 'Sylvia Plath', 'Literary fiction'),
  ('Sapiens', 'Yuval Noah Harari', 'History'),
  ('Never Let Me Go', 'Kazuo Ishiguro', 'Literary fiction')
) as seed(title, author, genre)
where not exists (select 1 from public.books);

-- 3. Borrows
create table if not exists public.borrows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  borrowed_at date not null default current_date,
  due_date date,
  notes text,
  created_at timestamptz not null default now()
);

grant select, insert, delete on public.borrows to authenticated;
grant all on public.borrows to service_role;

alter table public.borrows enable row level security;

drop policy if exists "Borrows are viewable by authenticated users" on public.borrows;
create policy "Borrows are viewable by authenticated users"
  on public.borrows for select to authenticated using (true);

drop policy if exists "Users can create own borrows" on public.borrows;
create policy "Users can create own borrows"
  on public.borrows for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users can delete own borrows" on public.borrows;
create policy "Users can delete own borrows"
  on public.borrows for delete to authenticated using (auth.uid() = user_id);
