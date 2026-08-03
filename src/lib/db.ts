import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Client,
  ClientMachineItem,
  ClientOilItem,
  Machine,
  Oil,
  Settings,
  StatusId,
  Tariff,
} from "./types";

/* ---------- row -> app type mappers ---------- */

function rowToSettings(r: Record<string, unknown>): Settings {
  return {
    exchangeRate: Number(r.exchange_rate),
    packagingFactor: Number(r.packaging_factor),
    netTreasury: Number(r.net_treasury),
    netTreasuryAfterOrder: Number(r.net_treasury_after_order),
    margeReelleGlobale: Number(r.marge_reelle_globale),
    treasuryNote: String(r.treasury_note ?? ""),
  };
}

function rowToMachine(r: Record<string, unknown>): Machine {
  return {
    id: String(r.id),
    name: String(r.name),
    coverage: String(r.coverage ?? ""),
    capacity: String(r.capacity ?? ""),
    weightKg: Number(r.weight_kg),
    aedRetail: Number(r.aed_retail),
    aedFranchise: Number(r.aed_franchise),
    b2b: Number(r.b2b),
    b2c: Number(r.b2c),
    location: Number(r.location),
    isEstimateFranchise: Boolean(r.is_estimate_franchise),
    sortOrder: Number(r.sort_order ?? 0),
  };
}

function rowToOil(r: Record<string, unknown>): Oil {
  return {
    id: String(r.id),
    name: String(r.name),
    catalogPrice: Number(r.catalog_price),
    weightKg: Number(r.weight_kg),
    aedRetail: Number(r.aed_retail),
    aedFranchise: Number(r.aed_franchise),
    isEstimateFranchise: Boolean(r.is_estimate_franchise),
    sortOrder: Number(r.sort_order ?? 0),
  };
}

function rowToMachineItem(r: Record<string, unknown>): ClientMachineItem {
  return {
    lineId: String(r.id),
    machineId: String(r.machine_id),
    qty: Number(r.qty),
    priceOverride: r.price_override == null ? null : Number(r.price_override),
  };
}

function rowToOilItem(r: Record<string, unknown>): ClientOilItem {
  return {
    lineId: String(r.id),
    oilId: String(r.oil_id),
    qty: Number(r.qty),
    priceOverride: r.price_override == null ? null : Number(r.price_override),
    label: String(r.label ?? ""),
  };
}

function rowToClient(
  r: Record<string, unknown>,
  items: ClientMachineItem[],
  oilItems: ClientOilItem[]
): Client {
  return {
    id: String(r.id),
    name: String(r.name ?? ""),
    ville: String(r.ville ?? ""),
    segment: String(r.segment ?? ""),
    phone: String(r.phone ?? ""),
    email: String(r.email ?? ""),
    status: String(r.status ?? "prospect") as StatusId,
    tariff: String(r.tariff ?? "B2B") as Tariff,
    transportRate: Number(r.transport_rate ?? 0),
    domesticTransportFee: Number(r.domestic_transport_fee ?? 0),
    manualWeight: r.manual_weight == null ? "" : Number(r.manual_weight),
    margeReelle: r.marge_reelle == null ? "" : Number(r.marge_reelle),
    notes: String(r.notes ?? ""),
    discountType: (r.discount_type === "amount" ? "amount" : "percent") as Client["discountType"],
    discountValue: Number(r.discount_value ?? 0),
    items,
    oilItems,
  };
}

/* ---------- reads ---------- */

export async function fetchAllData(supabase: SupabaseClient) {
  const [settingsRes, machinesRes, oilsRes, clientsRes, itemsRes, oilItemsRes] =
    await Promise.all([
      supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("machines").select("*").order("sort_order"),
      supabase.from("oils").select("*").order("sort_order"),
      supabase.from("clients").select("*").order("created_at", { ascending: false }),
      supabase.from("client_machine_items").select("*"),
      supabase.from("client_oil_items").select("*"),
    ]);

  const settings = settingsRes.data
    ? rowToSettings(settingsRes.data)
    : rowToSettings({});
  const machines = (machinesRes.data ?? []).map(rowToMachine);
  const oils = (oilsRes.data ?? []).map(rowToOil);

  const itemsByClient = new Map<string, ClientMachineItem[]>();
  for (const row of itemsRes.data ?? []) {
    const list = itemsByClient.get(String(row.client_id)) ?? [];
    list.push(rowToMachineItem(row));
    itemsByClient.set(String(row.client_id), list);
  }
  const oilItemsByClient = new Map<string, ClientOilItem[]>();
  for (const row of oilItemsRes.data ?? []) {
    const list = oilItemsByClient.get(String(row.client_id)) ?? [];
    list.push(rowToOilItem(row));
    oilItemsByClient.set(String(row.client_id), list);
  }

  const clients = (clientsRes.data ?? []).map((row) =>
    rowToClient(
      row,
      itemsByClient.get(String(row.id)) ?? [],
      oilItemsByClient.get(String(row.id)) ?? []
    )
  );

  return { settings, machines, oils, clients };
}

/* ---------- writes ---------- */

export async function updateSettings(
  supabase: SupabaseClient,
  patch: Partial<Settings>
) {
  const dbPatch: Record<string, unknown> = {};
  if (patch.exchangeRate !== undefined) dbPatch.exchange_rate = patch.exchangeRate;
  if (patch.packagingFactor !== undefined)
    dbPatch.packaging_factor = patch.packagingFactor;
  if (patch.netTreasury !== undefined) dbPatch.net_treasury = patch.netTreasury;
  if (patch.netTreasuryAfterOrder !== undefined)
    dbPatch.net_treasury_after_order = patch.netTreasuryAfterOrder;
  if (patch.margeReelleGlobale !== undefined)
    dbPatch.marge_reelle_globale = patch.margeReelleGlobale;
  if (patch.treasuryNote !== undefined) dbPatch.treasury_note = patch.treasuryNote;
  dbPatch.updated_at = new Date().toISOString();

  await supabase.from("settings").update(dbPatch).eq("id", 1);
}

export async function updateMachine(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<Machine>
) {
  const dbPatch: Record<string, unknown> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.weightKg !== undefined) dbPatch.weight_kg = patch.weightKg;
  if (patch.aedRetail !== undefined) dbPatch.aed_retail = patch.aedRetail;
  if (patch.aedFranchise !== undefined) dbPatch.aed_franchise = patch.aedFranchise;
  if (patch.b2b !== undefined) dbPatch.b2b = patch.b2b;
  if (patch.b2c !== undefined) dbPatch.b2c = patch.b2c;
  if (patch.location !== undefined) dbPatch.location = patch.location;
  await supabase.from("machines").update(dbPatch).eq("id", id);
}

export async function updateOil(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<Oil>
) {
  const dbPatch: Record<string, unknown> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.weightKg !== undefined) dbPatch.weight_kg = patch.weightKg;
  if (patch.aedRetail !== undefined) dbPatch.aed_retail = patch.aedRetail;
  if (patch.aedFranchise !== undefined) dbPatch.aed_franchise = patch.aedFranchise;
  if (patch.catalogPrice !== undefined) dbPatch.catalog_price = patch.catalogPrice;
  await supabase.from("oils").update(dbPatch).eq("id", id);
}

function clientPatchToDb(patch: Partial<Client>): Record<string, unknown> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.ville !== undefined) dbPatch.ville = patch.ville;
  if (patch.segment !== undefined) dbPatch.segment = patch.segment;
  if (patch.phone !== undefined) dbPatch.phone = patch.phone;
  if (patch.email !== undefined) dbPatch.email = patch.email;
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.tariff !== undefined) dbPatch.tariff = patch.tariff;
  if (patch.transportRate !== undefined) dbPatch.transport_rate = patch.transportRate;
  if (patch.domesticTransportFee !== undefined)
    dbPatch.domestic_transport_fee = patch.domesticTransportFee;
  if (patch.manualWeight !== undefined)
    dbPatch.manual_weight = patch.manualWeight === "" ? null : patch.manualWeight;
  if (patch.margeReelle !== undefined)
    dbPatch.marge_reelle = patch.margeReelle === "" ? null : patch.margeReelle;
  if (patch.notes !== undefined) dbPatch.notes = patch.notes;
  if (patch.discountType !== undefined) dbPatch.discount_type = patch.discountType;
  if (patch.discountValue !== undefined) dbPatch.discount_value = patch.discountValue;
  dbPatch.updated_at = new Date().toISOString();
  return dbPatch;
}

export async function insertClient(supabase: SupabaseClient, client: Client) {
  const { data, error } = await supabase
    .from("clients")
    .insert(clientPatchToDb(client))
    .select()
    .single();
  if (error || !data) throw error ?? new Error("insert client failed");
  return String(data.id);
}

export async function updateClientRow(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<Client>
) {
  await supabase.from("clients").update(clientPatchToDb(patch)).eq("id", id);
}

export async function deleteClientRow(supabase: SupabaseClient, id: string) {
  await supabase.from("clients").delete().eq("id", id);
}

export async function insertMachineItem(
  supabase: SupabaseClient,
  clientId: string,
  machineId: string,
  qty: number,
  priceOverride: number | null
) {
  const { data, error } = await supabase
    .from("client_machine_items")
    .insert({ client_id: clientId, machine_id: machineId, qty, price_override: priceOverride })
    .select()
    .single();
  if (error || !data) throw error ?? new Error("insert item failed");
  return String(data.id);
}

export async function updateMachineItem(
  supabase: SupabaseClient,
  lineId: string,
  patch: Partial<ClientMachineItem>
) {
  const dbPatch: Record<string, unknown> = {};
  if (patch.qty !== undefined) dbPatch.qty = patch.qty;
  if (patch.priceOverride !== undefined) dbPatch.price_override = patch.priceOverride;
  await supabase.from("client_machine_items").update(dbPatch).eq("id", lineId);
}

export async function deleteMachineItem(supabase: SupabaseClient, lineId: string) {
  await supabase.from("client_machine_items").delete().eq("id", lineId);
}

export async function insertOilItem(
  supabase: SupabaseClient,
  clientId: string,
  oilId: string,
  qty: number,
  priceOverride: number | null,
  label: string
) {
  const { data, error } = await supabase
    .from("client_oil_items")
    .insert({ client_id: clientId, oil_id: oilId, qty, price_override: priceOverride, label })
    .select()
    .single();
  if (error || !data) throw error ?? new Error("insert oil item failed");
  return String(data.id);
}

export async function updateOilItem(
  supabase: SupabaseClient,
  lineId: string,
  patch: Partial<ClientOilItem>
) {
  const dbPatch: Record<string, unknown> = {};
  if (patch.qty !== undefined) dbPatch.qty = patch.qty;
  if (patch.priceOverride !== undefined) dbPatch.price_override = patch.priceOverride;
  if (patch.label !== undefined) dbPatch.label = patch.label;
  await supabase.from("client_oil_items").update(dbPatch).eq("id", lineId);
}

export async function deleteOilItem(supabase: SupabaseClient, lineId: string) {
  await supabase.from("client_oil_items").delete().eq("id", lineId);
}
