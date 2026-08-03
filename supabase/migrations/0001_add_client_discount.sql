-- Adds a per-client commercial discount (percent or fixed amount) applied to
-- product revenue before margin. Run this once in the Supabase SQL editor if
-- your project's `clients` table was created before this migration existed
-- (schema.sql already includes it for fresh installs).

alter table clients
  add column if not exists discount_type text not null default 'percent',
  add column if not exists discount_value numeric not null default 0;
