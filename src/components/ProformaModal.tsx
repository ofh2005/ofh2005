"use client";

import type { CSSProperties } from "react";
import type { Client, ClientCalc, Machine, Oil } from "@/lib/types";
import { NAVY } from "@/lib/constants";
import { fmt } from "@/lib/calc";

const proTh: CSSProperties = { textAlign: "left", padding: "6px 8px", fontSize: 10, textTransform: "uppercase" };
const proTd: CSSProperties = { padding: "6px 8px", borderBottom: "1px solid #EEE" };

export default function ProformaModal({
  client,
  calc,
  machines,
  oils,
  onClose,
}: {
  client: Client;
  calc: ClientCalc;
  machines: Machine[];
  oils: Oil[];
  onClose: () => void;
}) {
  const today = new Date().toLocaleDateString("fr-FR");
  const ref = `NAO-PROF-${client.name.replace(/[^A-Za-z0-9]/g, "").slice(0, 8).toUpperCase()}-${new Date().getFullYear()}`;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        overflowY: "auto",
        padding: "30px 16px",
      }}
    >
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #nao-proforma-print, #nao-proforma-print * { visibility: visible; }
          #nao-proforma-print { position: absolute; left: 0; top: 0; width: 100%; }
          #nao-proforma-noprint { display: none !important; }
        }
      `}</style>
      <div style={{ background: "white", borderRadius: 10, width: "100%", maxWidth: 780, padding: 0, overflow: "hidden" }}>
        <div id="nao-proforma-noprint" style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: 10, background: "#F5F5F5" }}>
          <button onClick={() => window.print()} style={{ background: NAVY, color: "white", border: "none", borderRadius: 6, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            🖨️ Imprimer / Exporter PDF
          </button>
          <button onClick={onClose} style={{ background: "white", border: "1px solid #DDD", borderRadius: 6, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}>
            Fermer
          </button>
        </div>

        <div id="nao-proforma-print" style={{ padding: 36, fontFamily: "'Inter','Helvetica Neue',system-ui,sans-serif" }}>
          <div style={{ textAlign: "center", marginBottom: 6 }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: NAVY, letterSpacing: 1 }}>NIA AL OUD DISTRIBUTION</div>
            <div style={{ fontSize: 11, color: "#B8892B", fontStyle: "italic" }}>Where Luxury Meets Fragrance · Distributeur Dr. Scent — Yaoundé · Douala · Garoua</div>
          </div>
          <div style={{ textAlign: "center", margin: "18px 0 4px" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: NAVY }}>PROFORMA</div>
            <div style={{ fontSize: 12, color: "#666" }}>
              Réf. {ref} · {today}
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, margin: "20px 0" }}>
            <div style={{ flex: 1, background: "#F5F5F5", borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: NAVY }}>DESTINATAIRE</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>{client.name}</div>
              <div style={{ fontSize: 12, color: "#666" }}>{client.ville}</div>
              {client.phone && <div style={{ fontSize: 12, color: "#666" }}>{client.phone}</div>}
            </div>
            <div style={{ flex: 1, background: "#F5F5F5", borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: NAVY }}>ÉMETTEUR</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Nia Al Oud Distribution</div>
              <div style={{ fontSize: 12, color: "#666" }}>Hassan Oumarou Fadil</div>
              <div style={{ fontSize: 12, color: "#666" }}>+237 692 939 272</div>
            </div>
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, textTransform: "uppercase", margin: "16px 0 6px" }}>
            Diffuseurs — Machines ({client.tariff})
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: NAVY, color: "white" }}>
                <th style={proTh}>Désignation</th>
                <th style={proTh}>Qté</th>
                <th style={{ ...proTh, textAlign: "right" }}>P.U. XAF</th>
                <th style={{ ...proTh, textAlign: "right" }}>Total XAF</th>
              </tr>
            </thead>
            <tbody>
              {client.items.map((it) => {
                const m = machines.find((x) => x.id === it.machineId);
                if (!m) return null;
                const catalogUnit = client.tariff === "B2C" ? m.b2c : m.b2b;
                const unit = it.priceOverride != null ? it.priceOverride : catalogUnit;
                return (
                  <tr key={it.lineId}>
                    <td style={proTd}>
                      {m.name} <span style={{ color: "#999" }}>({m.coverage})</span>
                    </td>
                    <td style={proTd}>{it.qty}</td>
                    <td style={{ ...proTd, textAlign: "right" }}>{fmt(unit)}</td>
                    <td style={{ ...proTd, textAlign: "right" }}>{fmt(unit * it.qty)}</td>
                  </tr>
                );
              })}
              {client.items.length === 0 && (
                <tr>
                  <td style={proTd} colSpan={4}>
                    Aucune machine dans cette commande.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, textTransform: "uppercase", margin: "16px 0 6px" }}>
            Consommables — Huiles &amp; Aérosols
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: NAVY, color: "white" }}>
                <th style={proTh}>Désignation</th>
                <th style={proTh}>Format</th>
                <th style={proTh}>Qté</th>
                <th style={{ ...proTh, textAlign: "right" }}>P.U. XAF</th>
                <th style={{ ...proTh, textAlign: "right" }}>Total XAF</th>
              </tr>
            </thead>
            <tbody>
              {client.oilItems.map((it) => {
                const o = oils.find((x) => x.id === it.oilId);
                if (!o) return null;
                const unit = it.priceOverride != null ? it.priceOverride : o.catalogPrice;
                return (
                  <tr key={it.lineId}>
                    <td style={proTd}>{it.label || o.name}</td>
                    <td style={proTd}>{o.name}</td>
                    <td style={proTd}>{it.qty}</td>
                    <td style={{ ...proTd, textAlign: "right" }}>{fmt(unit)}</td>
                    <td style={{ ...proTd, textAlign: "right" }}>{fmt(unit * it.qty)}</td>
                  </tr>
                );
              })}
              {client.oilItems.length === 0 && (
                <tr>
                  <td style={proTd} colSpan={5}>
                    Aucun consommable dans cette commande.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: 18 }}>
            <tbody>
              <tr>
                <td style={{ padding: "6px 8px" }}>Sous-total produits{calc.discountAmount > 0 ? " (brut)" : ""}</td>
                <td style={{ padding: "6px 8px", textAlign: "right" }}>{fmt(calc.grossRevenue)}</td>
              </tr>
              {calc.discountAmount > 0 && (
                <tr>
                  <td style={{ padding: "6px 8px" }}>
                    Remise commerciale{client.discountType === "percent" ? ` (${client.discountValue}%)` : ""}
                  </td>
                  <td style={{ padding: "6px 8px", textAlign: "right" }}>− {fmt(calc.discountAmount)}</td>
                </tr>
              )}
              <tr style={{ background: NAVY, color: "white" }}>
                <td style={{ padding: "10px 8px", fontWeight: 800 }}>TOTAL GÉNÉRAL (coût &amp; fret inclus)</td>
                <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 800, fontSize: 16 }}>{fmt(calc.revenue + calc.transport)}</td>
              </tr>
            </tbody>
          </table>
          <div style={{ fontSize: 11, color: "#999", marginTop: 6 }}>
            Le transport international et le fret intérieur sont inclus dans le total ci-dessus.
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, textTransform: "uppercase", margin: "22px 0 6px" }}>Conditions commerciales</div>
          <ul style={{ fontSize: 11, color: "#444", paddingLeft: 18, margin: 0 }}>
            <li>Prix EX Works Dubaï, EAU — transport et livraison inclus dans le total ci-dessus.</li>
            <li>Paiement intégral (100%) exigé avant expédition — Orange Money / virement.</li>
            <li>Garantie fabricant 1 an — installation &amp; maintenance incluses.</li>
            <li>Proforma valable 30 jours à compter de la date d&apos;émission.</li>
          </ul>

          <div style={{ marginTop: 28, fontSize: 12 }}>
            <div>Hassan Oumarou Fadil</div>
            <div style={{ color: "#999" }}>Nia Al Oud Distribution · +237 692 939 272</div>
          </div>
        </div>
      </div>
    </div>
  );
}
