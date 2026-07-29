"use client";

import type { Client, ClientCalc, Settings } from "@/lib/types";
import { NAVY, GOLD, GOLD_LIGHT, GREEN, RED, STATUSES } from "@/lib/constants";
import { fmt, num } from "@/lib/calc";
import { Field, SummaryCard, ResultBox, inputStyle, tableStyle, thStyle, tdStyle } from "@/components/ui";

export default function PipelineTab({
  clients,
  compute,
  settings,
  patchSettings,
}: {
  clients: Client[];
  compute: (c: Client) => ClientCalc;
  settings: Settings;
  patchSettings: (patch: Partial<Settings>) => void;
}) {
  const rows = clients.map((c) => ({ c, r: compute(c) }));
  const totalRevenue = rows.reduce((a, x) => a + x.r.revenue, 0);
  const marginRetailSignedPaid = rows.filter((x) => x.c.status === "signe_paye").reduce((a, x) => a + x.r.marginRetail, 0);
  const marginRetailProspects = rows.filter((x) => x.c.status !== "signe_paye").reduce((a, x) => a + x.r.marginRetail, 0);

  const pending = rows.filter((x) => ["loi", "acompte"].includes(x.c.status));
  const pendingWeight = pending.reduce((a, x) => a + x.r.weight, 0);
  const pendingRevenue = pending.reduce((a, x) => a + x.r.revenue, 0);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ background: "white", borderRadius: 12, padding: 18, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: `1px solid ${GOLD_LIGHT}` }}>
        <div style={{ fontWeight: 700, color: NAVY, fontSize: 16, marginBottom: 4 }}>💰 Trésorerie nette — champs 100% modifiables</div>
        <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 12 }}>
          Ces chiffres ne sont jamais recalculés automatiquement par l&apos;outil. Corrige-les toi-même chaque fois qu&apos;une donnée manque ou qu&apos;un calcul te semble faux — c&apos;est ta source de vérité, pas celle de la simulation.
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 14 }}>
          <Field label="Trésorerie nette — SANS commande (XAF)">
            <input
              type="number"
              value={settings.netTreasury}
              onChange={(e) => patchSettings({ netTreasury: num(e.target.value, settings.netTreasury) })}
              style={{ ...inputStyle, width: 180, fontSize: 18, fontWeight: 700, color: GOLD }}
            />
          </Field>
          <Field label="Trésorerie nette — APRÈS commande (XAF)">
            <input
              type="number"
              value={settings.netTreasuryAfterOrder}
              onChange={(e) => patchSettings({ netTreasuryAfterOrder: num(e.target.value, settings.netTreasuryAfterOrder) })}
              style={{ ...inputStyle, width: 180, fontSize: 18, fontWeight: 700, color: GOLD }}
            />
          </Field>
          <Field label="Marge nette réelle — globale (XAF)">
            <input
              type="number"
              value={settings.margeReelleGlobale}
              onChange={(e) => patchSettings({ margeReelleGlobale: num(e.target.value, settings.margeReelleGlobale) })}
              style={{ ...inputStyle, width: 180, fontSize: 18, fontWeight: 700, color: GOLD }}
            />
          </Field>
          <div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 3 }}>Écart net (trésorerie après commande − marge réelle)</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: settings.netTreasuryAfterOrder - settings.margeReelleGlobale >= 0 ? GREEN : RED }}>
              {fmt(settings.netTreasuryAfterOrder - settings.margeReelleGlobale)}
            </div>
          </div>
        </div>
        <Field label="Note / justification">
          <input
            value={settings.treasuryNote}
            onChange={(e) => patchSettings({ treasuryNote: e.target.value })}
            style={inputStyle}
            placeholder="Explique ce que couvrent ces chiffres, ce qui a été déduit, etc."
          />
        </Field>
      </div>

      <div style={{ background: "white", borderRadius: 12, padding: 18, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontWeight: 700, color: NAVY, fontSize: 16, marginBottom: 4 }}>Récapitulatif pipeline — présentable à Afriland</div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 12 }}>
              Utilise le bouton Imprimer de ton navigateur (Ctrl/Cmd+P → Enregistrer en PDF) pour exporter cette vue telle quelle.
            </div>
          </div>
          <button
            onClick={() => window.print()}
            style={{ background: NAVY, color: "white", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            🖨️ Imprimer / Exporter PDF
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 12, marginBottom: 14 }}>
          <SummaryCard label="Clients suivis" value={clients.length} />
          <SummaryCard label="CA pipeline total" value={fmt(totalRevenue)} />
          <SummaryCard label="Marge nette retail — Signé & payé" value={fmt(marginRetailSignedPaid)} gold />
          <SummaryCard label="Marge nette retail — Estimation prospects" value={fmt(marginRetailProspects)} />
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Établissement</th>
                <th style={thStyle}>Ville</th>
                <th style={thStyle}>Segment</th>
                <th style={thStyle}>Statut</th>
                <th style={thStyle}>CA</th>
                <th style={thStyle}>Marge Franchise</th>
                <th style={thStyle}>Poids (kg)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ c, r }) => {
                const st = STATUSES.find((s) => s.id === c.status);
                return (
                  <tr key={c.id}>
                    <td style={tdStyle}>{c.name}</td>
                    <td style={tdStyle}>{c.ville}</td>
                    <td style={tdStyle}>{c.segment}</td>
                    <td style={{ ...tdStyle, color: st?.color, fontWeight: 600 }}>{st?.label}</td>
                    <td style={tdStyle}>{fmt(r.revenue)}</td>
                    <td style={tdStyle}>{fmt(r.marginFranchise)}</td>
                    <td style={tdStyle}>{r.weight.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ background: NAVY, borderRadius: 12, padding: 18, color: "white" }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Poids agrégé — clients en LOI ou Acompte reçu</div>
        <div style={{ fontSize: 11, color: "#C9D2E3", marginBottom: 14 }}>Pour anticiper une commande UAE groupée dès que le crédit est validé.</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 14, marginBottom: 14 }}>
          <ResultBox label="Établissements concernés" value={pending.length} />
          <ResultBox label="Poids total à transporter" value={`${pendingWeight.toFixed(2)} kg`} />
          <ResultBox label="CA cumulé" value={fmt(pendingRevenue)} />
        </div>
        {pending.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ ...tableStyle, color: "white" }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, color: "#C9D2E3" }}>Établissement</th>
                  <th style={{ ...thStyle, color: "#C9D2E3" }}>Statut</th>
                  <th style={{ ...thStyle, color: "#C9D2E3" }}>Poids</th>
                </tr>
              </thead>
              <tbody>
                {pending.map(({ c, r }) => {
                  const st = STATUSES.find((s) => s.id === c.status);
                  return (
                    <tr key={c.id}>
                      <td style={{ ...tdStyle, borderColor: "rgba(255,255,255,0.1)" }}>{c.name}</td>
                      <td style={{ ...tdStyle, borderColor: "rgba(255,255,255,0.1)", color: st?.color }}>{st?.label}</td>
                      <td style={{ ...tdStyle, borderColor: "rgba(255,255,255,0.1)" }}>{r.weight.toFixed(2)} kg</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
