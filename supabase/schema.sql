create table if not exists public.household_state (
  id text primary key,
  expenses jsonb not null default '[]'::jsonb,
  budgets jsonb not null default '[]'::jsonb,
  goals jsonb not null default '[]'::jsonb,
  income jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.household_state enable row level security;

create policy "Allow shared household access"
on public.household_state
for all
using (id = 'couple-household')
with check (id = 'couple-household');

insert into public.household_state (id)
values ('couple-household')
on conflict (id) do nothing;
