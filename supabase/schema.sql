-- Paisa production schema for Supabase/Postgres.
-- Run this in the Supabase SQL editor before enabling shared cloud storage.

create extension if not exists pgcrypto;

do $$ begin
  create type public.household_role as enum ('owner', 'member');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type public.expense_type as enum ('shared', 'personal');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type public.goal_status as enum ('active', 'completed', 'paused', 'archived');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type public.notification_type as enum ('expense_added', 'goal_updated', 'budget_warning', 'report_sent');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  currency_code text not null default 'INR' check (currency_code ~ '^[A-Z]{3}$'),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.household_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 160),
  merchant text,
  amount numeric(12, 2) not null check (amount > 0),
  category text not null default 'Other',
  subcategory text,
  paid_by_user_id uuid references auth.users(id) on delete set null,
  expense_type public.expense_type not null default 'shared',
  spent_on date not null default current_date,
  notes text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  category text not null,
  month date not null,
  amount numeric(12, 2) not null check (amount >= 0),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, category, month),
  check (extract(day from month) = 1)
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 160),
  target_amount numeric(12, 2) not null check (target_amount > 0),
  deadline date,
  color text not null default 'blue',
  status public.goal_status not null default 'active',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.goal_contributions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  contributed_on date not null default current_date,
  contributed_by uuid references auth.users(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.income (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  person_id uuid references auth.users(id) on delete set null,
  source text not null default 'Income',
  received_on date not null default current_date,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learned_categories (
  household_id uuid not null references public.households(id) on delete cascade,
  merchant_key text not null,
  category text not null,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (household_id, merchant_key)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text not null,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.report_deliveries (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  requested_by uuid not null references auth.users(id) on delete restrict,
  recipient_email text not null,
  report_month date not null,
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed')),
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  check (extract(day from report_month) = 1)
);

-- Temporary bridge for the current frontend storage adapter.
-- Remove this table after the app is migrated to the normalized tables above.
create table if not exists public.household_state (
  id text primary key,
  expenses jsonb not null default '[]'::jsonb,
  budgets jsonb not null default '[]'::jsonb,
  goals jsonb not null default '[]'::jsonb,
  income jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.is_household_member(target_household_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.household_members where household_id = target_household_id and user_id = auth.uid());
$$;

create or replace function public.is_household_owner(target_household_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.household_members where household_id = target_household_id and user_id = auth.uid() and role = 'owner');
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
drop trigger if exists households_set_updated_at on public.households;
drop trigger if exists expenses_set_updated_at on public.expenses;
drop trigger if exists budgets_set_updated_at on public.budgets;
drop trigger if exists goals_set_updated_at on public.goals;
drop trigger if exists income_set_updated_at on public.income;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger households_set_updated_at before update on public.households for each row execute function public.set_updated_at();
create trigger expenses_set_updated_at before update on public.expenses for each row execute function public.set_updated_at();
create trigger budgets_set_updated_at before update on public.budgets for each row execute function public.set_updated_at();
create trigger goals_set_updated_at before update on public.goals for each row execute function public.set_updated_at();
create trigger income_set_updated_at before update on public.income for each row execute function public.set_updated_at();

create index if not exists expenses_household_date_idx on public.expenses (household_id, spent_on desc);
create index if not exists expenses_household_category_idx on public.expenses (household_id, category);
create index if not exists budgets_household_month_idx on public.budgets (household_id, month);
create index if not exists goals_household_status_idx on public.goals (household_id, status);
create index if not exists goal_contributions_goal_date_idx on public.goal_contributions (goal_id, contributed_on desc);
create index if not exists income_household_date_idx on public.income (household_id, received_on desc);
create index if not exists notifications_recipient_unread_idx on public.notifications (recipient_user_id, read_at, created_at desc);

create or replace view public.goal_progress as
select
  g.id,
  g.household_id,
  g.title,
  g.target_amount,
  g.deadline,
  g.color,
  g.status,
  coalesce(sum(gc.amount), 0)::numeric(12, 2) as saved_amount,
  greatest(g.target_amount - coalesce(sum(gc.amount), 0), 0)::numeric(12, 2) as remaining_amount,
  least((coalesce(sum(gc.amount), 0) / nullif(g.target_amount, 0)) * 100, 100)::numeric(5, 2) as progress_percent
from public.goals g
left join public.goal_contributions gc on gc.goal_id = g.id
group by g.id;

create or replace view public.monthly_household_summary as
select
  h.id as household_id,
  months.month,
  coalesce(income.total_income, 0)::numeric(12, 2) as total_income,
  coalesce(expenses.total_expenses, 0)::numeric(12, 2) as total_expenses,
  (coalesce(income.total_income, 0) - coalesce(expenses.total_expenses, 0))::numeric(12, 2) as savings,
  coalesce(budgets.total_budget, 0)::numeric(12, 2) as total_budget
from public.households h
cross join lateral (
  select distinct date_trunc('month', spent_on)::date as month from public.expenses where household_id = h.id
  union
  select distinct date_trunc('month', received_on)::date from public.income where household_id = h.id
  union
  select distinct month from public.budgets where household_id = h.id
) months
left join lateral (
  select sum(amount) as total_income from public.income
  where household_id = h.id and date_trunc('month', received_on)::date = months.month
) income on true
left join lateral (
  select sum(amount) as total_expenses from public.expenses
  where household_id = h.id and date_trunc('month', spent_on)::date = months.month
) expenses on true
left join lateral (
  select sum(amount) as total_budget from public.budgets
  where household_id = h.id and month = months.month
) budgets on true;

alter view public.goal_progress set (security_invoker = true);
alter view public.monthly_household_summary set (security_invoker = true);

alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.expenses enable row level security;
alter table public.budgets enable row level security;
alter table public.goals enable row level security;
alter table public.goal_contributions enable row level security;
alter table public.income enable row level security;
alter table public.learned_categories enable row level security;
alter table public.notifications enable row level security;
alter table public.report_deliveries enable row level security;
alter table public.household_state enable row level security;

drop policy if exists "Users can view their profile" on public.profiles;
drop policy if exists "Users can update their profile" on public.profiles;
drop policy if exists "Members can view households" on public.households;
drop policy if exists "Users can create households" on public.households;
drop policy if exists "Owners can update households" on public.households;
drop policy if exists "Members can view membership" on public.household_members;
drop policy if exists "Owners can manage membership" on public.household_members;
drop policy if exists "Members can manage expenses" on public.expenses;
drop policy if exists "Members can manage budgets" on public.budgets;
drop policy if exists "Members can manage goals" on public.goals;
drop policy if exists "Members can manage goal contributions" on public.goal_contributions;
drop policy if exists "Members can manage income" on public.income;
drop policy if exists "Members can manage learned categories" on public.learned_categories;
drop policy if exists "Users can manage their notifications" on public.notifications;
drop policy if exists "Members can view report deliveries" on public.report_deliveries;
drop policy if exists "Members can create report deliveries" on public.report_deliveries;
drop policy if exists "Allow shared household access" on public.household_state;

create policy "Users can view their profile" on public.profiles for select using (id = auth.uid());
create policy "Users can update their profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "Members can view households" on public.households for select using (public.is_household_member(id));
create policy "Users can create households" on public.households for insert with check (created_by = auth.uid());
create policy "Owners can update households" on public.households for update using (public.is_household_owner(id)) with check (public.is_household_owner(id));
create policy "Members can view membership" on public.household_members for select using (user_id = auth.uid() or public.is_household_member(household_id));
create policy "Owners can manage membership" on public.household_members for all using (public.is_household_owner(household_id)) with check (public.is_household_owner(household_id));
create policy "Members can manage expenses" on public.expenses for all using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "Members can manage budgets" on public.budgets for all using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "Members can manage goals" on public.goals for all using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "Members can manage goal contributions" on public.goal_contributions for all using (exists (select 1 from public.goals where goals.id = goal_id and public.is_household_member(goals.household_id))) with check (exists (select 1 from public.goals where goals.id = goal_id and public.is_household_member(goals.household_id)));
create policy "Members can manage income" on public.income for all using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "Members can manage learned categories" on public.learned_categories for all using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "Users can manage their notifications" on public.notifications for all using (recipient_user_id = auth.uid()) with check (recipient_user_id = auth.uid());
create policy "Members can view report deliveries" on public.report_deliveries for select using (public.is_household_member(household_id));
create policy "Members can create report deliveries" on public.report_deliveries for insert with check (requested_by = auth.uid() and public.is_household_member(household_id));
create policy "Allow shared household access" on public.household_state for all using (id = 'couple-household') with check (id = 'couple-household');
