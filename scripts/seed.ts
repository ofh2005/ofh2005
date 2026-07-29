/**
 * One-off import of a Nia Al Oud backup JSON (clients + settings + catalogue)
 * into Supabase. Run locally — never commit the backup file itself, it
 * contains real client names/phone numbers.
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     npx tsx scripts/seed.ts /path/to/backup.json
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const file = process.argv[2];

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars."
  );
  process.exit(1);
}
if (!file) {
  console.error("Usage: npx tsx scripts/seed.ts /path/to/backup.json");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type BackupMachine = Record<string, unknown> & { id: string };
type BackupOil = Record<string, unknown> & { id: string };
type BackupItem = { machineId: string; qty: number; priceOverride: number | null };
type BackupOilItem = { oilId: string; qty: number; priceOverride: number | null; label: string };
type BackupClient = Record<string, unknown> & {
  name: string;
  items?: BackupItem[];
  oilItems?: BackupOilItem[];
};

async function main() {
  const backup = JSON.parse(readFileSync(file, "utf-8")) as {
    clients: BackupClient[];
    settings?: Record<string, unknown>;
    machines?: BackupMachine[];
    oils?: BackupOil[];
  };

  if (backup.settings) {
    const s = backup.settings;
    const { error } = await supabase
      .from("settings")
      .update({
        exchange_rate: s.exchangeRate,
        packaging_factor: s.packagingFactor,
        net_treasury: s.netTreasury,
        net_treasury_after_order: s.netTreasuryAfterOrder,
        marge_reelle_globale: s.margeReelleGlobale,
        treasury_note: s.treasuryNote ?? "",
      })
      .eq("id", 1);
    if (error) throw error;
    console.log("Settings updated.");
  }

  if (backup.machines?.length) {
    for (const m of backup.machines) {
      const { error } = await supabase
        .from("machines")
        .update({
          name: m.name,
          coverage: m.coverage,
          capacity: m.capacity,
          weight_kg: m.weightKg,
          aed_retail: m.aedRetail,
          aed_franchise: m.aedFranchise,
          b2b: m.b2b,
          b2c: m.b2c,
          location: m.location,
          is_estimate_franchise: m.isEstimateFranchise,
        })
        .eq("id", m.id);
      if (error) console.error(`machine ${m.id}:`, error.message);
    }
    console.log(`${backup.machines.length} machines synced.`);
  }

  if (backup.oils?.length) {
    for (const o of backup.oils) {
      const { error } = await supabase
        .from("oils")
        .update({
          name: o.name,
          catalog_price: o.catalogPrice,
          weight_kg: o.weightKg,
          aed_retail: o.aedRetail,
          aed_franchise: o.aedFranchise,
          is_estimate_franchise: o.isEstimateFranchise,
        })
        .eq("id", o.id);
      if (error) console.error(`oil ${o.id}:`, error.message);
    }
    console.log(`${backup.oils.length} oils synced.`);
  }

  if (backup.clients?.length) {
    // Full replace: wipe existing clients (cascades to their items) then re-import.
    const { error: delErr } = await supabase
      .from("clients")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (delErr) throw delErr;

    for (const c of backup.clients) {
      const { data: clientRow, error: clientErr } = await supabase
        .from("clients")
        .insert({
          name: c.name ?? "",
          ville: c.ville ?? "Douala",
          segment: c.segment ?? "Hôtel",
          phone: c.phone ?? "",
          email: c.email ?? "",
          status: c.status ?? "prospect",
          tariff: c.tariff ?? "B2B",
          transport_rate: c.transportRate ?? 7500,
          domestic_transport_fee: c.domesticTransportFee ?? 10000,
          manual_weight: c.manualWeight === "" ? null : c.manualWeight ?? null,
          marge_reelle: c.margeReelle === "" ? null : c.margeReelle ?? null,
          notes: c.notes ?? "",
        })
        .select()
        .single();
      if (clientErr || !clientRow) {
        console.error(`client "${c.name}":`, clientErr?.message);
        continue;
      }

      for (const it of c.items ?? []) {
        const { error } = await supabase.from("client_machine_items").insert({
          client_id: clientRow.id,
          machine_id: it.machineId,
          qty: it.qty ?? 1,
          price_override: it.priceOverride ?? null,
        });
        if (error) console.error(`  item ${it.machineId}:`, error.message);
      }
      for (const it of c.oilItems ?? []) {
        const { error } = await supabase.from("client_oil_items").insert({
          client_id: clientRow.id,
          oil_id: it.oilId,
          qty: it.qty ?? 1,
          price_override: it.priceOverride ?? null,
          label: it.label ?? "",
        });
        if (error) console.error(`  oil item ${it.oilId}:`, error.message);
      }
    }
    console.log(`${backup.clients.length} clients imported.`);
  }

  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
