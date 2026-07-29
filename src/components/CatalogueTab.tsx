"use client";

import type { Machine, Oil, Settings } from "@/lib/types";
import { NAVY, SCENTS_OIL, SCENTS_AEROSOL, GOLD } from "@/lib/constants";
import { machineCost, oilCost, fmt, num } from "@/lib/calc";
import { Field, SectionLabel, MarginCell, inputStyle, miniInput, tableStyle, thStyle, tdStyle, scentTag, scentTagGold } from "@/components/ui";

export default function CatalogueTab({
  settings,
  patchSettings,
  machines,
  patchMachine,
  oils,
  patchOil,
}: {
  settings: Settings;
  patchSettings: (patch: Partial<Settings>) => void;
  machines: Machine[];
  patchMachine: (id: string, patch: Partial<Machine>) => void;
  oils: Oil[];
  patchOil: (id: string, patch: Partial<Oil>) => void;
}) {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ background: "white", borderRadius: 12, padding: 18, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div style={{ fontWeight: 700, color: NAVY, fontSize: 16, marginBottom: 12 }}>Réglages globaux</div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <Field label="Taux de change (1 AED = ? XAF)">
            <input
              type="number"
              step="0.1"
              value={settings.exchangeRate}
              onChange={(e) => patchSettings({ exchangeRate: num(e.target.value, settings.exchangeRate) })}
              style={{ ...inputStyle, width: 120 }}
            />
          </Field>
          <Field label="Facteur d'emballage (poids réel / poids catalogue)">
            <input
              type="number"
              step="0.01"
              value={settings.packagingFactor}
              onChange={(e) => patchSettings({ packagingFactor: num(e.target.value, settings.packagingFactor) })}
              style={{ ...inputStyle, width: 120 }}
            />
          </Field>
        </div>
      </div>

      {/* MACHINES */}
      <div style={{ background: "white", borderRadius: 12, padding: 18, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflowX: "auto" }}>
        <div style={{ fontWeight: 700, color: NAVY, fontSize: 16, marginBottom: 12 }}>Machines — Catalogue &amp; Marges (modifiable)</div>
        <table style={{ ...tableStyle, minWidth: 1100 }}>
          <thead>
            <tr>
              <th style={thStyle}>Machine</th>
              <th style={thStyle}>Poids (kg)</th>
              <th style={thStyle}>AED Retail (TVA incl.)</th>
              <th style={thStyle}>AED Franchise (HT)</th>
              <th style={thStyle}>Vente B2B</th>
              <th style={thStyle}>Vente B2C</th>
              <th style={thStyle}>Coût Retail</th>
              <th style={thStyle}>Coût Franchise</th>
              <th style={thStyle}>Marge B2B Retail</th>
              <th style={thStyle}>Marge B2B Franchise</th>
              <th style={thStyle}>Marge B2C Retail</th>
              <th style={thStyle}>Marge B2C Franchise</th>
            </tr>
          </thead>
          <tbody>
            {machines.map((m) => {
              const costs = machineCost(m, settings.exchangeRate);
              const mB2BRetail = m.b2b > 0 ? ((m.b2b - costs.retail) / m.b2b) * 100 : 0;
              const mB2BFranchise = m.b2b > 0 ? ((m.b2b - costs.franchise) / m.b2b) * 100 : 0;
              const mB2CRetail = m.b2c > 0 ? ((m.b2c - costs.retail) / m.b2c) * 100 : 0;
              const mB2CFranchise = m.b2c > 0 ? ((m.b2c - costs.franchise) / m.b2c) * 100 : 0;
              return (
                <tr key={m.id}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>
                    {m.name}
                    {m.isEstimateFranchise && (
                      <span style={{ color: GOLD, fontSize: 10, marginLeft: 4 }} title="Coût franchise estimé, à corriger">
                        ⚠
                      </span>
                    )}
                    <div style={{ fontSize: 10, color: "#9CA3AF" }}>{m.coverage}</div>
                  </td>
                  <td style={tdStyle}>
                    <input type="number" step="0.01" value={m.weightKg} onChange={(e) => patchMachine(m.id, { weightKg: num(e.target.value) })} style={miniInput} />
                  </td>
                  <td style={tdStyle}>
                    <input type="number" value={m.aedRetail} onChange={(e) => patchMachine(m.id, { aedRetail: num(e.target.value) })} style={miniInput} />
                  </td>
                  <td style={tdStyle}>
                    <input type="number" value={m.aedFranchise} onChange={(e) => patchMachine(m.id, { aedFranchise: num(e.target.value) })} style={miniInput} />
                  </td>
                  <td style={tdStyle}>
                    <input type="number" value={m.b2b} onChange={(e) => patchMachine(m.id, { b2b: num(e.target.value) })} style={miniInput} />
                  </td>
                  <td style={tdStyle}>
                    <input type="number" value={m.b2c} onChange={(e) => patchMachine(m.id, { b2c: num(e.target.value) })} style={miniInput} />
                  </td>
                  <td style={tdStyle}>{fmt(costs.retail)}</td>
                  <td style={tdStyle}>{fmt(costs.franchise)}</td>
                  <MarginCell v={mB2BRetail} />
                  <MarginCell v={mB2BFranchise} />
                  <MarginCell v={mB2CRetail} />
                  <MarginCell v={mB2CFranchise} />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* OILS */}
      <div style={{ background: "white", borderRadius: 12, padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflowX: "auto" }}>
        <div style={{ fontWeight: 700, color: NAVY, fontSize: 16, marginBottom: 12 }}>Huiles &amp; Consommables — Catalogue &amp; Marges</div>
        <table style={{ ...tableStyle, minWidth: 900 }}>
          <thead>
            <tr>
              <th style={thStyle}>Format</th>
              <th style={thStyle}>Poids (kg)</th>
              <th style={thStyle}>AED Retail</th>
              <th style={thStyle}>AED Franchise</th>
              <th style={thStyle}>Prix catalogue (vente)</th>
              <th style={thStyle}>Coût Retail</th>
              <th style={thStyle}>Coût Franchise</th>
              <th style={thStyle}>Marge Retail</th>
              <th style={thStyle}>Marge Franchise</th>
            </tr>
          </thead>
          <tbody>
            {oils.map((o) => {
              const costs = oilCost(o, settings.exchangeRate);
              const mRetail = o.catalogPrice > 0 ? ((o.catalogPrice - costs.retail) / o.catalogPrice) * 100 : 0;
              const mFranchise = o.catalogPrice > 0 ? ((o.catalogPrice - costs.franchise) / o.catalogPrice) * 100 : 0;
              return (
                <tr key={o.id}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>
                    {o.name}
                    {o.isEstimateFranchise && (
                      <span style={{ color: GOLD, fontSize: 10, marginLeft: 4 }} title="Coût estimé, à corriger">
                        ⚠
                      </span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <input type="number" step="0.01" value={o.weightKg} onChange={(e) => patchOil(o.id, { weightKg: num(e.target.value) })} style={miniInput} />
                  </td>
                  <td style={tdStyle}>
                    <input type="number" value={o.aedRetail} onChange={(e) => patchOil(o.id, { aedRetail: num(e.target.value) })} style={miniInput} />
                  </td>
                  <td style={tdStyle}>
                    <input type="number" value={o.aedFranchise} onChange={(e) => patchOil(o.id, { aedFranchise: num(e.target.value) })} style={miniInput} />
                  </td>
                  <td style={tdStyle}>
                    <input type="number" value={o.catalogPrice} onChange={(e) => patchOil(o.id, { catalogPrice: num(e.target.value) })} style={miniInput} />
                  </td>
                  <td style={tdStyle}>{fmt(costs.retail)}</td>
                  <td style={tdStyle}>{fmt(costs.franchise)}</td>
                  <MarginCell v={mRetail} />
                  <MarginCell v={mFranchise} />
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 8 }}>
          ⚠ = coût encore estimé, à corriger dès que tu as la vraie donnée fournisseur. Le coût franchise huile varie aussi selon la senteur choisie (fourchette basse retenue par prudence).
        </div>
      </div>

      {/* SENTEURS */}
      <div style={{ background: "white", borderRadius: 12, padding: 18, marginTop: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div style={{ fontWeight: 700, color: NAVY, fontSize: 16, marginBottom: 4 }}>Senteurs disponibles</div>
        <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 14 }}>Prix unique toutes senteurs — même tarif quelle que soit la senteur choisie dans une même gamme.</div>

        <SectionLabel>Huiles aromatiques — 46 senteurs (170/500/1000ml)</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
          {SCENTS_OIL.map((s) => (
            <span key={s} style={scentTag}>
              {s}
            </span>
          ))}
        </div>

        <SectionLabel>Aérosols — 20 senteurs (300ml, compatible LCD Volitalia)</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {SCENTS_AEROSOL.map((s) => (
            <span key={s} style={scentTagGold}>
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
