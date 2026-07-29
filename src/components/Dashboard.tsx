"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useDebouncedWriter } from "@/lib/useDebouncedWriter";
import {
  computeClient,
  fmt,
  mkClient,
  num,
  uid,
} from "@/lib/calc";
import * as db from "@/lib/db";
import type { Client, ClientOilItem, Machine, Oil, Settings } from "@/lib/types";
import { NAVY, NAVY_LIGHT, GOLD_LIGHT } from "@/lib/constants";
import { StatPill } from "@/components/ui";
import ClientsTab from "@/components/ClientsTab";
import CatalogueTab from "@/components/CatalogueTab";
import PipelineTab from "@/components/PipelineTab";
import ProformaModal from "@/components/ProformaModal";
import { logout } from "@/lib/actions/auth";

type Tab = "clients" | "catalogue" | "pipeline";

export default function Dashboard({
  initialSettings,
  initialMachines,
  initialOils,
  initialClients,
}: {
  initialSettings: Settings;
  initialMachines: Machine[];
  initialOils: Oil[];
  initialClients: Client[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const schedule = useDebouncedWriter();

  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [machines, setMachines] = useState<Machine[]>(initialMachines);
  const [oils, setOils] = useState<Oil[]>(initialOils);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialClients[0]?.id ?? null
  );
  const [tab, setTab] = useState<Tab>("clients");
  const [filterVille, setFilterVille] = useState("Toutes");
  const [filterSegment, setFilterSegment] = useState("Tous");
  const [filterStatus, setFilterStatus] = useState("Tous");
  const [search, setSearch] = useState("");
  const [showProforma, setShowProforma] = useState(false);
  const [saving, setSaving] = useState(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const withSaving = useCallback(async (fn: () => Promise<unknown>) => {
    setSaving(true);
    try {
      await fn();
    } finally {
      setSaving(false);
    }
  }, []);

  /* ---------- settings ---------- */
  const patchSettings = useCallback(
    (patch: Partial<Settings>) => {
      setSettings((s) => ({ ...s, ...patch }));
      schedule("settings", () => withSaving(() => db.updateSettings(supabase, patch)));
    },
    [schedule, supabase, withSaving]
  );

  /* ---------- machines / oils (catalogue) ---------- */
  const patchMachine = useCallback(
    (id: string, patch: Partial<Machine>) => {
      setMachines((ms) => ms.map((m) => (m.id === id ? { ...m, ...patch } : m)));
      schedule(`machine:${id}`, () =>
        withSaving(() => db.updateMachine(supabase, id, patch))
      );
    },
    [schedule, supabase, withSaving]
  );

  const patchOil = useCallback(
    (id: string, patch: Partial<Oil>) => {
      setOils((os) => os.map((o) => (o.id === id ? { ...o, ...patch } : o)));
      schedule(`oil:${id}`, () => withSaving(() => db.updateOil(supabase, id, patch)));
    },
    [schedule, supabase, withSaving]
  );

  /* ---------- clients ---------- */
  const updateClient = useCallback(
    (id: string, patch: Partial<Client>) => {
      setClients((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
      schedule(`client:${id}`, () =>
        withSaving(() => db.updateClientRow(supabase, id, patch))
      );
    },
    [schedule, supabase, withSaving]
  );

  const addClient = useCallback(() => {
    const c = mkClient({ name: "Nouveau client" });
    setClients((cs) => [c, ...cs]);
    setSelectedId(c.id);
    setTab("clients");
    withSaving(async () => {
      const realId = await db.insertClient(supabase, c);
      setClients((cs) => cs.map((x) => (x.id === c.id ? { ...x, id: realId } : x)));
      setSelectedId((cur) => (cur === c.id ? realId : cur));
    });
  }, [supabase, withSaving]);

  const deleteClient = useCallback(
    (id: string) => {
      setClients((cs) => cs.filter((c) => c.id !== id));
      setSelectedId((cur) => (cur === id ? null : cur));
      withSaving(() => db.deleteClientRow(supabase, id));
    },
    [supabase, withSaving]
  );

  const addMachineToClient = useCallback(
    (clientId: string, machineId: string) => {
      const tempId = uid();
      setClients((cs) =>
        cs.map((c) =>
          c.id === clientId
            ? { ...c, items: [...c.items, { lineId: tempId, machineId, qty: 1, priceOverride: null }] }
            : c
        )
      );
      withSaving(async () => {
        const realId = await db.insertMachineItem(supabase, clientId, machineId, 1, null);
        setClients((cs) =>
          cs.map((c) =>
            c.id === clientId
              ? { ...c, items: c.items.map((it) => (it.lineId === tempId ? { ...it, lineId: realId } : it)) }
              : c
          )
        );
      });
    },
    [supabase, withSaving]
  );

  const addOilToClient = useCallback(
    (clientId: string, oilId: string, defaultScent: string) => {
      const tempId = uid();
      const newItem: ClientOilItem = { lineId: tempId, oilId, qty: 1, priceOverride: null, label: defaultScent };
      setClients((cs) =>
        cs.map((c) => (c.id === clientId ? { ...c, oilItems: [...c.oilItems, newItem] } : c))
      );
      withSaving(async () => {
        const realId = await db.insertOilItem(supabase, clientId, oilId, 1, null, defaultScent);
        setClients((cs) =>
          cs.map((c) =>
            c.id === clientId
              ? { ...c, oilItems: c.oilItems.map((it) => (it.lineId === tempId ? { ...it, lineId: realId } : it)) }
              : c
          )
        );
      });
    },
    [supabase, withSaving]
  );

  const updateItem = useCallback(
    (clientId: string, lineId: string, patch: Partial<Client["items"][number]>) => {
      setClients((cs) =>
        cs.map((c) =>
          c.id === clientId
            ? { ...c, items: c.items.map((it) => (it.lineId === lineId ? { ...it, ...patch } : it)) }
            : c
        )
      );
      schedule(`item:${lineId}`, () =>
        withSaving(() => db.updateMachineItem(supabase, lineId, patch))
      );
    },
    [schedule, supabase, withSaving]
  );

  const removeItem = useCallback(
    (clientId: string, lineId: string) => {
      setClients((cs) =>
        cs.map((c) =>
          c.id === clientId ? { ...c, items: c.items.filter((it) => it.lineId !== lineId) } : c
        )
      );
      withSaving(() => db.deleteMachineItem(supabase, lineId));
    },
    [supabase, withSaving]
  );

  const updateOilItem = useCallback(
    (clientId: string, lineId: string, patch: Partial<ClientOilItem>) => {
      setClients((cs) =>
        cs.map((c) =>
          c.id === clientId
            ? { ...c, oilItems: c.oilItems.map((it) => (it.lineId === lineId ? { ...it, ...patch } : it)) }
            : c
        )
      );
      schedule(`oilitem:${lineId}`, () =>
        withSaving(() => db.updateOilItem(supabase, lineId, patch))
      );
    },
    [schedule, supabase, withSaving]
  );

  const removeOilItem = useCallback(
    (clientId: string, lineId: string) => {
      setClients((cs) =>
        cs.map((c) =>
          c.id === clientId ? { ...c, oilItems: c.oilItems.filter((it) => it.lineId !== lineId) } : c
        )
      );
      withSaving(() => db.deleteOilItem(supabase, lineId));
    },
    [supabase, withSaving]
  );

  /* ---------- computed ---------- */
  const compute = useCallback(
    (c: Client) => computeClient(c, machines, oils, settings),
    [machines, oils, settings]
  );

  const selected = useMemo(
    () => clients.find((c) => c.id === selectedId) ?? null,
    [clients, selectedId]
  );
  const calc = useMemo(() => (selected ? compute(selected) : null), [selected, compute]);

  const dashboardStats = useMemo(() => {
    let pipelineRevenue = 0,
      marginRetailSignedPaid = 0,
      marginRetailProspects = 0;
    clients.forEach((c) => {
      const r = compute(c);
      pipelineRevenue += r.revenue;
      if (c.status === "signe_paye") marginRetailSignedPaid += r.marginRetail;
      else marginRetailProspects += r.marginRetail;
    });
    return { totalClients: clients.length, pipelineRevenue, marginRetailSignedPaid, marginRetailProspects };
  }, [clients, compute]);

  /* ---------- export / import (safety net JSON backup) ---------- */
  const exportData = useCallback(() => {
    const payload = JSON.stringify(
      { clients, settings, machines, oils, exportedAt: new Date().toISOString() },
      null,
      2
    );
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nia-al-oud-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [clients, settings, machines, oils]);

  const importData = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        (async () => {
          try {
            const parsed = JSON.parse(String(ev.target?.result));
            if (
              Array.isArray(parsed.clients) &&
              parsed.clients.length &&
              !window.confirm(
                `Importer remplacera TOUS les clients actuels (${clients.length}) par les ${parsed.clients.length} clients du fichier. Continuer ?`
              )
            ) {
              e.target.value = "";
              return;
            }
            setSaving(true);

            if (parsed.settings) {
              const s = parsed.settings as Partial<Settings>;
              setSettings((cur) => ({ ...cur, ...s }));
              await db.updateSettings(supabase, s);
            }
            if (Array.isArray(parsed.machines)) {
              for (const m of parsed.machines) {
                if (!m?.id) continue;
                await db.updateMachine(supabase, m.id, m);
              }
              setMachines((defs) =>
                defs.map((d) => {
                  const s = parsed.machines.find((m: { id: string }) => m.id === d.id);
                  return s ? { ...d, ...s } : d;
                })
              );
            }
            if (Array.isArray(parsed.oils)) {
              for (const o of parsed.oils) {
                if (!o?.id) continue;
                await db.updateOil(supabase, o.id, o);
              }
              setOils((defs) =>
                defs.map((d) => {
                  const s = parsed.oils.find((o: { id: string }) => o.id === d.id);
                  return s ? { ...d, ...s } : d;
                })
              );
            }

            if (Array.isArray(parsed.clients) && parsed.clients.length) {
              // Full replace, mirroring the original tool's import behaviour.
              for (const c of clients) {
                await db.deleteClientRow(supabase, c.id);
              }
              const imported: Client[] = [];
              for (const raw of parsed.clients) {
                const base = mkClient(raw);
                const newId = await db.insertClient(supabase, base);
                const items = [];
                for (const it of raw.items ?? []) {
                  const lineId = await db.insertMachineItem(
                    supabase,
                    newId,
                    it.machineId,
                    num(it.qty, 1),
                    it.priceOverride ?? null
                  );
                  items.push({ ...it, lineId });
                }
                const oilItems = [];
                for (const it of raw.oilItems ?? []) {
                  const lineId = await db.insertOilItem(
                    supabase,
                    newId,
                    it.oilId,
                    num(it.qty, 1),
                    it.priceOverride ?? null,
                    it.label ?? ""
                  );
                  oilItems.push({ ...it, lineId });
                }
                imported.push({ ...base, id: newId, items, oilItems });
              }
              setClients(imported);
              setSelectedId(imported[0]?.id ?? null);
            }
            alert("Données importées avec succès.");
          } catch (err) {
            console.error(err);
            alert("Fichier invalide — impossible d'importer.");
          } finally {
            setSaving(false);
          }
        })();
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [clients, supabase]
  );

  const villes = ["Toutes", ...Array.from(new Set(clients.map((c) => c.ville)))];

  return (
    <div style={{ fontFamily: "'Inter','Helvetica Neue',system-ui,sans-serif", background: "#FAF8F4", minHeight: "100vh", color: "#1F2937" }}>
      <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_LIGHT} 100%)`, color: "white", padding: "16px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 2, color: GOLD_LIGHT, fontWeight: 600 }}>NIA AL OUD DISTRIBUTION</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Pilotage Commercial &amp; Simulateur</div>
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
            <StatPill label="Clients suivis" value={dashboardStats.totalClients} />
            <StatPill label="Pipeline (prix catalogue)" value={fmt(dashboardStats.pipelineRevenue)} />
            <StatPill label="Marge nette retail — Signé & payé" value={fmt(dashboardStats.marginRetailSignedPaid)} gold />
            <StatPill label="Marge nette retail — Estimation prospects" value={fmt(dashboardStats.marginRetailProspects)} />
            <TreasuryInput label="💰 Trésorerie nette (sans commande)" value={settings.netTreasury} onChange={(v) => patchSettings({ netTreasury: v })} />
            <TreasuryInput label="💰 Trésorerie nette (après commande)" value={settings.netTreasuryAfterOrder} onChange={(v) => patchSettings({ netTreasuryAfterOrder: v })} />
            <TreasuryInput label="✅ Marge nette réelle (modifiable)" value={settings.margeReelleGlobale} onChange={(v) => patchSettings({ margeReelleGlobale: v })} />
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 14px", minWidth: 200 }}>
              <div style={{ fontSize: 11, color: "#C9D2E3" }}>Écart net (trésorerie après commande − marge réelle)</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: settings.netTreasuryAfterOrder - settings.margeReelleGlobale >= 0 ? "#34D399" : "#F87171" }}>
                {fmt(settings.netTreasuryAfterOrder - settings.margeReelleGlobale)}
              </div>
            </div>
            <button
              onClick={() => logout()}
              style={{ background: "rgba(255,255,255,0.12)", color: "white", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer", alignSelf: "center" }}
            >
              Déconnexion
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 4, marginTop: 14, flexWrap: "wrap" }}>
          {(
            [
              ["clients", "👥 Clients & Simulateur"],
              ["catalogue", "📋 Catalogue & Marges"],
              ["pipeline", "📊 Pipeline & Export"],
            ] as [Tab, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                background: tab === id ? "white" : "rgba(255,255,255,0.1)",
                color: tab === id ? NAVY : "white",
                border: "none",
                borderRadius: "8px 8px 0 0",
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
          <div style={{ marginLeft: "auto", fontSize: 11, color: "#C9D2E3", alignSelf: "center" }}>
            {saving ? "Enregistrement…" : "✓ Enregistré"}
          </div>
        </div>
      </div>

      {tab === "catalogue" && (
        <CatalogueTab settings={settings} patchSettings={patchSettings} machines={machines} patchMachine={patchMachine} oils={oils} patchOil={patchOil} />
      )}

      {tab === "pipeline" && (
        <PipelineTab clients={clients} compute={compute} settings={settings} patchSettings={patchSettings} />
      )}

      {tab === "clients" && (
        <ClientsTab
          clients={clients}
          machines={machines}
          oils={oils}
          settings={settings}
          selected={selected}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          calc={calc}
          filterVille={filterVille}
          setFilterVille={setFilterVille}
          filterSegment={filterSegment}
          setFilterSegment={setFilterSegment}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          search={search}
          setSearch={setSearch}
          villes={villes}
          addClient={addClient}
          deleteClient={deleteClient}
          updateClient={updateClient}
          addMachineToClient={addMachineToClient}
          addOilToClient={addOilToClient}
          updateItem={updateItem}
          removeItem={removeItem}
          updateOilItem={updateOilItem}
          removeOilItem={removeOilItem}
          setShowProforma={setShowProforma}
          exportData={exportData}
          importData={importData}
          importInputRef={importInputRef}
        />
      )}

      {showProforma && selected && calc && (
        <ProformaModal client={selected} calc={calc} machines={machines} oils={oils} onClose={() => setShowProforma(false)} />
      )}
    </div>
  );
}

function TreasuryInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 14px", minWidth: 200 }}>
      <div style={{ fontSize: 11, color: "#C9D2E3" }}>{label}</div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(num(e.target.value, value))}
        style={{
          background: "transparent",
          border: "none",
          borderBottom: "1px dashed rgba(255,255,255,0.4)",
          color: GOLD_LIGHT,
          fontSize: 16,
          fontWeight: 700,
          width: "100%",
          outline: "none",
          padding: "2px 0",
        }}
      />
    </div>
  );
}
