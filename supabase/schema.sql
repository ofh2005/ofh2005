-- ============================================================
-- Nia Al Oud Distribution — CRM schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`).
-- Single-user internal tool: RLS just requires an authenticated session.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Réglages globaux (ligne unique) ----------
create table if not exists settings (
  id int primary key default 1 check (id = 1),
  exchange_rate numeric not null default 153.4,
  packaging_factor numeric not null default 1.0,
  net_treasury numeric not null default 0,
  net_treasury_after_order numeric not null default 0,
  marge_reelle_globale numeric not null default 0,
  treasury_note text not null default '',
  updated_at timestamptz not null default now()
);

insert into settings (id) values (1) on conflict (id) do nothing;

-- ---------- Machines ----------
create table if not exists machines (
  id text primary key,
  name text not null,
  coverage text not null default '',
  capacity text not null default '',
  weight_kg numeric not null default 0,
  aed_retail numeric not null default 0,
  aed_franchise numeric not null default 0,
  b2b numeric not null default 0,
  b2c numeric not null default 0,
  location numeric not null default 0,
  is_estimate_franchise boolean not null default false,
  sort_order int not null default 0
);

-- ---------- Huiles / consommables ----------
create table if not exists oils (
  id text primary key,
  name text not null,
  catalog_price numeric not null default 0,
  weight_kg numeric not null default 0,
  aed_retail numeric not null default 0,
  aed_franchise numeric not null default 0,
  is_estimate_franchise boolean not null default false,
  sort_order int not null default 0
);

-- ---------- Clients / Prospects ----------
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  ville text not null default 'Douala',
  segment text not null default 'Hôtel',
  phone text not null default '',
  email text not null default '',
  status text not null default 'prospect',
  tariff text not null default 'B2B',
  transport_rate numeric not null default 7500,
  domestic_transport_fee numeric not null default 10000,
  manual_weight numeric,
  marge_reelle numeric,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Lignes machines par client ----------
create table if not exists client_machine_items (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  machine_id text not null references machines(id),
  qty numeric not null default 1,
  price_override numeric
);

-- ---------- Lignes huiles/consommables par client ----------
create table if not exists client_oil_items (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  oil_id text not null references oils(id),
  qty numeric not null default 1,
  price_override numeric,
  label text not null default ''
);

create index if not exists idx_client_machine_items_client on client_machine_items(client_id);
create index if not exists idx_client_oil_items_client on client_oil_items(client_id);
create index if not exists idx_clients_status on clients(status);

-- ============================================================
-- Row Level Security — single authenticated user, full access
-- ============================================================
alter table settings enable row level security;
alter table machines enable row level security;
alter table oils enable row level security;
alter table clients enable row level security;
alter table client_machine_items enable row level security;
alter table client_oil_items enable row level security;

create policy "authenticated full access" on settings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on machines
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on oils
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on clients
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on client_machine_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on client_oil_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================
-- Seed: catalogue de référence (machines & huiles de départ)
-- Les clients réels sont importés séparément via scripts/seed.ts
-- ============================================================
insert into machines (id, name, coverage, capacity, weight_kg, aed_retail, aed_franchise, b2b, b2c, location, is_estimate_franchise, sort_order) values
  ('dr_small', 'DR Small', '100 m² / 300 m³', '170 ml', 4, 1050, 400, 228500, 213000, 40000, true, 1),
  ('dr_medium', 'DR Medium', '400 m² / 1200 m³', '500 ml', 4, 1890, 500, 324000, 302000, 56500, true, 2),
  ('sa_big', 'Stand Alone Big', '900 m² / 2700 m³', '1000 ml', 7, 2205, 575, 419500, 390500, 73500, false, 3),
  ('sa_mini', 'Stand Alone Mini', '600 m² / 1800 m³', '500 ml', 5, 1785, 400, 324000, 302000, 56500, false, 4),
  ('eco_tulip', 'Eco Tulip', '80 m² / 300 m³', '170 ml', 2, 630, 200, 162000, 151000, 28500, false, 5),
  ('zen', 'Zen Diffuser', '60 m² / 300 m³', '200 ml', 1, 420, 110, 95500, 88500, 16500, false, 6),
  ('home_scent', 'Home Scent', '72 m² / 300 m³', '170 ml', 1, 787.5, 200, 162000, 151000, 28500, false, 7),
  ('plugin', 'Plug-in', '20 – 30 m²', '30 ml', 1.5, 131.25, 85, 47500, 44500, 8500, false, 8),
  ('lcd', 'LCD Volitalia', 'Directionnelle', '300 ml aérosol', 1.5, 78.75, 35, 28500, 26500, 5000, false, 9)
on conflict (id) do nothing;

insert into oils (id, name, catalog_price, weight_kg, aed_retail, aed_franchise, is_estimate_franchise, sort_order) values
  ('oil170', 'Huile 170ml', 30500, 0.30, 157.5, 25, false, 1),
  ('oil500', 'Huile 500ml', 50500, 0.50, 262.5, 65, false, 2),
  ('oil1000', 'Huile 1000ml', 101000, 1, 525, 135, false, 3),
  ('aerosol300', 'Aérosol 300ml', 5500, 0.30, 26.25, 20, true, 4)
on conflict (id) do nothing;
