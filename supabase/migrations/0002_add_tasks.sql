-- Adds the "Tableau de bord" tasks/follow-ups table (Pipeline calls +
-- Administratif dossiers like RCCM/Banque/Crédit/Franchise). Run this once
-- in the Supabase SQL editor if your project predates this migration
-- (schema.sql already includes it for fresh installs).

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  notes text not null default '',
  category text not null default 'pipeline',
  dossier text not null default '',
  status text not null default 'a_faire',
  client_id uuid references clients(id) on delete set null,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tasks_status on tasks(status);

alter table tasks enable row level security;

create policy "authenticated full access" on tasks
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
