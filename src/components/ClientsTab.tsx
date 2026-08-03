"use client";

import { useState, type RefObject } from "react";
import type { Client, ClientCalc, ClientOilItem, Machine, Oil, Settings, StatusId } from "@/lib/types";
import { STATUSES, VILLES, SEGMENTS, scentsForOil, GOLD, NAVY, RED, GOLD_LIGHT } from "@/lib/constants";
import {
  Field,
  SectionLabel,
  ResultBox,
  ToggleGroup,
  inputStyle,
  miniInput,
  selStyle,
  tableStyle,
  thStyle,
  tdStyle,
  rmBtnStyle,
  addBtnStyle,
  dropdownStyle,
  dropdownItemStyle,
} from "@/components/ui";
import { fmt, pct, num as numFn } from "@/lib/calc";

export default function ClientsTab(props: {
  clients: Client[];
  machines: Machine[];
  oils: Oil[];
  settings: Settings;
  selected: Client | null;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  calc: ClientCalc | null;
  filterVille: string;
  setFilterVille: (v: string) => void;
  filterSegment: string;
  setFilterSegment: (v: string) => void;
  filterStatus: string;
  setFilterStatus: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
  villes: string[];
  addClient: () => void;
  deleteClient: (id: string) => void;
  updateClient: (id: string, patch: Partial<Client>) => void;
  addMachineToClient: (clientId: string, machineId: string) => void;
  addOilToClient: (clientId: string, oilId: string, defaultScent: string) => void;
  updateItem: (clientId: string, lineId: string, patch: Partial<Client["items"][number]>) => void;
  removeItem: (clientId: string, lineId: string) => void;
  updateOilItem: (clientId: string, lineId: string, patch: Partial<ClientOilItem>) => void;
  removeOilItem: (clientId: string, lineId: string) => void;
  setShowProforma: (v: boolean) => void;
  exportData: () => void;
  importData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  importInputRef: RefObject<HTMLInputElement | null>;
}) {
  const {
    clients,
    machines,
    oils,
    settings,
    selected,
    selectedId,
    setSelectedId,
    calc,
    filterVille,
    setFilterVille,
    filterSegment,
    setFilterSegment,
    filterStatus,
    setFilterStatus,
    search,
    setSearch,
    villes,
    addClient,
    deleteClient,
    updateClient,
    addMachineToClient,
    addOilToClient,
    updateItem,
    removeItem,
    updateOilItem,
    removeOilItem,
    setShowProforma,
    exportData,
    importData,
    importInputRef,
  } = props;

  const [showAddMachine, setShowAddMachine] = useState(false);
  const [showAddOil, setShowAddOil] = useState(false);

  const filteredClients = clients
    .filter((c) => {
      if (filterVille !== "Toutes" && c.ville !== filterVille) return false;
      if (filterSegment !== "Tous" && c.segment !== filterSegment) return false;
      if (filterStatus !== "Tous" && c.status !== filterStatus) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    // Prospects sink to the bottom — everything further along the pipeline stays on top.
    .sort((a, b) => (a.status === "prospect" ? 1 : 0) - (b.status === "prospect" ? 1 : 0));

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 140px)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", minHeight: "calc(100vh - 140px)" }}>
        {/* SIDEBAR */}
        <div style={{ width: 320, maxWidth: "100%", borderRight: "1px solid #E5E0D5", background: "white", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: 14, borderBottom: "1px solid #EEE" }}>
            <button onClick={addClient} style={{ width: "100%", background: GOLD, color: "white", border: "none", borderRadius: 8, padding: "9px 0", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              + Ajouter un client
            </button>
            <input placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, width: "100%", marginTop: 10, boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <select value={filterVille} onChange={(e) => setFilterVille(e.target.value)} style={selStyle}>
                {villes.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
              <select value={filterSegment} onChange={(e) => setFilterSegment(e.target.value)} style={selStyle}>
                <option>Tous</option>
                {SEGMENTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ ...selStyle, width: "100%", marginTop: 6 }}>
              <option>Tous</option>
              {STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ overflowY: "auto", flex: 1, maxHeight: 480 }}>
            {filteredClients.map((c) => {
              const st = STATUSES.find((s) => s.id === c.status);
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  style={{
                    padding: "10px 14px",
                    borderBottom: "1px solid #F1EFE9",
                    cursor: "pointer",
                    background: c.id === selectedId ? "#FBF3E6" : "white",
                    borderLeft: c.id === selectedId ? `3px solid ${GOLD}` : "3px solid transparent",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{c.name || "(sans nom)"}</div>
                  <div style={{ fontSize: 11, color: "#6B7280", display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                    <span>
                      {c.ville} · {c.segment}
                    </span>
                    <span style={{ color: st?.color, fontWeight: 600 }}>{st?.label}</span>
                  </div>
                </div>
              );
            })}
            {filteredClients.length === 0 && <div style={{ padding: 20, fontSize: 13, color: "#9CA3AF" }}>Aucun résultat.</div>}
          </div>
          <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 4, alignItems: "center", borderTop: "1px solid #EEE" }}>
            <div style={{ display: "flex", gap: 6, width: "100%", marginTop: 4 }}>
              <button onClick={exportData} style={{ flex: 1, background: "#F3EFE4", border: `1px solid ${GOLD_LIGHT}`, color: GOLD, borderRadius: 6, padding: "6px 8px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                ⬇️ Exporter
              </button>
              <button onClick={() => importInputRef.current?.click()} style={{ flex: 1, background: "white", border: "1px solid #DDD", color: "#374151", borderRadius: 6, padding: "6px 8px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                ⬆️ Importer
              </button>
              <input ref={importInputRef} type="file" accept="application/json" onChange={importData} style={{ display: "none" }} />
            </div>
            <div style={{ fontSize: 10, color: "#B0B0B0", textAlign: "center", lineHeight: 1.4 }}>
              Tes données sont sauvegardées en base à chaque modification. Exporte quand même régulièrement pour garder une sauvegarde de secours.
            </div>
          </div>
        </div>

        {/* MAIN PANEL */}
        <div style={{ flex: 1, minWidth: 320, padding: 24, overflowY: "auto" }}>
          {!selected ? (
            <div style={{ color: "#9CA3AF" }}>Sélectionne un établissement à gauche, ou ajoute-en un nouveau.</div>
          ) : (
            <>
              <div style={{ background: "white", borderRadius: 12, padding: 18, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <input
                    value={selected.name}
                    onChange={(e) => updateClient(selected.id, { name: e.target.value })}
                    style={{ fontSize: 20, fontWeight: 700, color: NAVY, border: "none", borderBottom: "1px dashed #DDD", flex: 1, outline: "none", background: "transparent" }}
                  />
                  <button
                    onClick={() => {
                      if (window.confirm(`Supprimer définitivement "${selected.name}" ?`)) deleteClient(selected.id);
                    }}
                    style={{ background: "none", border: "1px solid #FCA5A5", color: RED, borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", height: 30 }}
                  >
                    Supprimer
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginTop: 14 }}>
                  <Field label="Ville">
                    <select value={selected.ville} onChange={(e) => updateClient(selected.id, { ville: e.target.value })} style={inputStyle}>
                      {VILLES.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Segment">
                    <select value={selected.segment} onChange={(e) => updateClient(selected.id, { segment: e.target.value })} style={inputStyle}>
                      {SEGMENTS.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Téléphone">
                    <input value={selected.phone} onChange={(e) => updateClient(selected.id, { phone: e.target.value })} style={inputStyle} />
                  </Field>
                  <Field label="Email">
                    <input value={selected.email} onChange={(e) => updateClient(selected.id, { email: e.target.value })} style={inputStyle} />
                  </Field>
                  <Field label="Statut">
                    <select value={selected.status} onChange={(e) => updateClient(selected.id, { status: e.target.value as StatusId })} style={inputStyle}>
                      {STATUSES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="Notes" style={{ marginTop: 10 }}>
                  <input
                    value={selected.notes}
                    onChange={(e) => updateClient(selected.id, { notes: e.target.value })}
                    style={{ ...inputStyle, width: "100%" }}
                    placeholder="Contact, avancement, remarques…"
                  />
                </Field>
              </div>

              {/* SIMULATEUR */}
              <div style={{ background: "white", borderRadius: 12, padding: 18, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ fontWeight: 700, color: NAVY, fontSize: 16 }}>Simulateur de commande</div>
                  <div style={{ display: "flex", gap: 14, fontSize: 13, alignItems: "center", flexWrap: "wrap" }}>
                    <ToggleGroup label="Tarif" value={selected.tariff} options={["B2B", "B2C"]} onChange={(v) => updateClient(selected.id, { tariff: v as "B2B" | "B2C" })} />
                    <div>
                      <span style={{ color: "#6B7280", marginRight: 6 }}>Transport (XAF/kg)</span>
                      <input
                        type="number"
                        value={selected.transportRate}
                        onChange={(e) => updateClient(selected.id, { transportRate: numFn(e.target.value) })}
                        style={{ ...inputStyle, width: 80 }}
                      />
                    </div>
                    <div>
                      <span style={{ color: "#6B7280", marginRight: 6 }}>Transport intérieur (XAF forfait)</span>
                      <input
                        type="number"
                        value={selected.domesticTransportFee}
                        onChange={(e) => updateClient(selected.id, { domesticTransportFee: numFn(e.target.value) })}
                        style={{ ...inputStyle, width: 90 }}
                      />
                    </div>
                  </div>
                </div>

                {/* REMISE */}
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #F1EFE9", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Remise commerciale
                  </span>
                  <div style={{ display: "flex", border: "1px solid #DDD", borderRadius: 6, overflow: "hidden" }}>
                    {(["percent", "amount"] as const).map((t) => (
                      <div
                        key={t}
                        onClick={() => updateClient(selected.id, { discountType: t })}
                        style={{
                          padding: "4px 10px",
                          cursor: "pointer",
                          background: selected.discountType === t ? NAVY : "white",
                          color: selected.discountType === t ? "white" : "#374151",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {t === "percent" ? "%" : "XAF"}
                      </div>
                    ))}
                  </div>
                  <div>
                    <span style={{ color: "#6B7280", marginRight: 6 }}>
                      {selected.discountType === "percent" ? "Remise (%)" : "Remise (XAF)"}
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={selected.discountValue}
                      onChange={(e) => updateClient(selected.id, { discountValue: numFn(e.target.value) })}
                      style={{ ...inputStyle, width: 90 }}
                    />
                  </div>
                  {calc && calc.discountAmount > 0 && (
                    <div style={{ fontSize: 12, color: GOLD, fontWeight: 600 }}>
                      − {fmt(calc.discountAmount)} sur {fmt(calc.grossRevenue)} de produits
                    </div>
                  )}
                </div>

                {/* MACHINES */}
                <div style={{ marginTop: 14 }}>
                  <SectionLabel>Machines</SectionLabel>
                  <div style={{ overflowX: "auto" }}>
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Machine</th>
                          <th style={thStyle}>Qté</th>
                          <th style={thStyle}>P.U. ({selected.tariff})</th>
                          <th style={thStyle}>Total</th>
                          <th style={thStyle}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.items.map((it) => {
                          const m = machines.find((x) => x.id === it.machineId);
                          if (!m) return null;
                          const catalogUnit = selected.tariff === "B2C" ? m.b2c : m.b2b;
                          const unit = it.priceOverride != null ? numFn(it.priceOverride) : catalogUnit;
                          return (
                            <tr key={it.lineId}>
                              <td style={tdStyle}>{m.name}</td>
                              <td style={tdStyle}>
                                <input
                                  type="number"
                                  min={0}
                                  value={it.qty}
                                  onChange={(e) => updateItem(selected.id, it.lineId, { qty: numFn(e.target.value) })}
                                  style={miniInput}
                                />
                              </td>
                              <td style={tdStyle}>
                                <input
                                  type="number"
                                  value={it.priceOverride != null ? it.priceOverride : ""}
                                  placeholder={String(catalogUnit)}
                                  onChange={(e) => updateItem(selected.id, it.lineId, { priceOverride: e.target.value === "" ? null : numFn(e.target.value) })}
                                  style={{ ...miniInput, width: 90 }}
                                  title="Laisser vide = prix catalogue du tarif sélectionné"
                                />
                              </td>
                              <td style={tdStyle}>{fmt(unit * it.qty)}</td>
                              <td style={tdStyle}>
                                <button onClick={() => removeItem(selected.id, it.lineId)} style={rmBtnStyle}>
                                  ✕
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ position: "relative", marginTop: 8 }}>
                    <button onClick={() => setShowAddMachine((v) => !v)} style={addBtnStyle}>
                      + Ajouter une machine
                    </button>
                    {showAddMachine && (
                      <div style={dropdownStyle}>
                        {machines.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => {
                              addMachineToClient(selected.id, m.id);
                              setShowAddMachine(false);
                            }}
                            style={dropdownItemStyle}
                          >
                            <span>{m.name}</span>
                            <span style={{ color: "#9CA3AF", fontSize: 11 }}>{m.coverage}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* OILS */}
                <div style={{ marginTop: 20 }}>
                  <SectionLabel>Huiles / Consommables</SectionLabel>
                  <div style={{ overflowX: "auto" }}>
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Format</th>
                          <th style={thStyle}>Senteur</th>
                          <th style={thStyle}>Qté</th>
                          <th style={thStyle}>P.U.</th>
                          <th style={thStyle}>Total</th>
                          <th style={thStyle}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.oilItems.map((it) => {
                          const o = oils.find((x) => x.id === it.oilId);
                          if (!o) return null;
                          const unit = it.priceOverride != null ? numFn(it.priceOverride) : o.catalogPrice;
                          const scents = scentsForOil(it.oilId);
                          return (
                            <tr key={it.lineId}>
                              <td style={tdStyle}>{o.name}</td>
                              <td style={tdStyle}>
                                <select
                                  value={it.label || scents[0]}
                                  onChange={(e) => updateOilItem(selected.id, it.lineId, { label: e.target.value })}
                                  style={{ ...miniInput, width: 140 }}
                                >
                                  {scents.map((s) => (
                                    <option key={s} value={s}>
                                      {s}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td style={tdStyle}>
                                <input
                                  type="number"
                                  min={0}
                                  value={it.qty}
                                  onChange={(e) => updateOilItem(selected.id, it.lineId, { qty: numFn(e.target.value) })}
                                  style={miniInput}
                                />
                              </td>
                              <td style={tdStyle}>
                                <input
                                  type="number"
                                  value={it.priceOverride != null ? it.priceOverride : ""}
                                  placeholder={String(o.catalogPrice)}
                                  onChange={(e) => updateOilItem(selected.id, it.lineId, { priceOverride: e.target.value === "" ? null : numFn(e.target.value) })}
                                  style={{ ...miniInput, width: 80 }}
                                  title="Laisser vide = prix catalogue"
                                />
                              </td>
                              <td style={tdStyle}>{fmt(unit * it.qty)}</td>
                              <td style={tdStyle}>
                                <button onClick={() => removeOilItem(selected.id, it.lineId)} style={rmBtnStyle}>
                                  ✕
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ position: "relative", marginTop: 8 }}>
                    <button onClick={() => setShowAddOil((v) => !v)} style={addBtnStyle}>
                      + Ajouter une huile
                    </button>
                    {showAddOil && (
                      <div style={dropdownStyle}>
                        {oils.map((o) => (
                          <div
                            key={o.id}
                            onClick={() => {
                              addOilToClient(selected.id, o.id, scentsForOil(o.id)[0]);
                              setShowAddOil(false);
                            }}
                            style={dropdownItemStyle}
                          >
                            <span>{o.name}</span>
                            <span style={{ color: "#9CA3AF", fontSize: 11 }}>{fmt(o.catalogPrice)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* POIDS */}
                {calc && (
                  <div style={{ marginTop: 20, display: "flex", gap: 20, alignItems: "flex-end", flexWrap: "wrap" }}>
                    <Field label={`Poids catalogue calculé (×${settings.packagingFactor} emballage)`}>
                      <div style={{ ...inputStyle, background: "#F5F5F5", width: 140 }}>{calc.weightAuto.toFixed(2)} kg</div>
                    </Field>
                    <Field label="Poids manuel (litige — écrase le calcul)">
                      <input
                        type="number"
                        step="0.01"
                        value={selected.manualWeight}
                        onChange={(e) => updateClient(selected.id, { manualWeight: e.target.value === "" ? "" : numFn(e.target.value) })}
                        placeholder="vide = auto"
                        style={{ ...inputStyle, width: 140 }}
                      />
                    </Field>
                    <div style={{ fontSize: 12, color: selected.manualWeight !== "" ? GOLD : "#9CA3AF", fontWeight: 600 }}>
                      Poids retenu pour le transport : {calc.weight.toFixed(2)} kg {selected.manualWeight !== "" && "(manuel)"}
                    </div>
                  </div>
                )}
              </div>

              {/* RESULTATS */}
              {calc && (
                <div style={{ background: NAVY, borderRadius: 12, padding: 20, color: "white" }}>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Résultat de la simulation</div>

                  <div style={{ background: `linear-gradient(135deg, ${GOLD} 0%, #8F6A1F 100%)`, borderRadius: 10, padding: 16, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#FFF3DC" }}>TOTAL FACTURÉ AU CLIENT (produits + transport intl. + transport intérieur)</div>
                      <div style={{ fontSize: 28, fontWeight: 800 }}>{fmt(calc.revenue + calc.transport)}</div>
                    </div>
                    <button onClick={() => setShowProforma(true)} style={{ background: "white", color: NAVY, border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                      📄 Générer la proforma
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 16 }}>
                    {calc.discountAmount > 0 && (
                      <>
                        <ResultBox label="Sous-total produits (brut)" value={fmt(calc.grossRevenue)} />
                        <ResultBox
                          label={`Remise (${selected.discountType === "percent" ? selected.discountValue + "%" : "forfait"})`}
                          value={`− ${fmt(calc.discountAmount)}`}
                        />
                      </>
                    )}
                    <ResultBox label="Prix total facturé (hors transport)" value={fmt(calc.revenue)} />
                    <ResultBox label="Poids retenu" value={`${calc.weight.toFixed(2)} kg`} />
                    <ResultBox label="Transport intl. à facturer (pass-through)" value={fmt(calc.transportIntl)} />
                    <ResultBox label="Transport intérieur à facturer (pass-through)" value={fmt(calc.transportDomestic)} />
                    <ResultBox label="Transport total à facturer en plus" value={fmt(calc.transport)} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: 14 }}>
                      <div style={{ fontSize: 12, color: "#C9D2E3", marginBottom: 6 }}>SANS FRANCHISE (prix retail)</div>
                      <div style={{ fontSize: 13, color: "#C9D2E3" }}>Coût produits : {fmt(calc.costRetail)}</div>
                      <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>{fmt(calc.marginRetail)}</div>
                      <div style={{ fontSize: 13, color: GOLD_LIGHT }}>Marge nette : {pct(calc.marginRetailPct)}</div>
                    </div>
                    <div style={{ background: `linear-gradient(135deg, ${GOLD} 0%, #8F6A1F 100%)`, borderRadius: 10, padding: 14 }}>
                      <div style={{ fontSize: 12, color: "#FFF3DC", marginBottom: 6 }}>AVEC FRANCHISE (prix export)</div>
                      <div style={{ fontSize: 13, color: "#FFF3DC" }}>Coût produits : {fmt(calc.costFranchise)}</div>
                      <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>{fmt(calc.marginFranchise)}</div>
                      <div style={{ fontSize: 13, color: "#FFF3DC" }}>Marge nette : {pct(calc.marginFranchisePct)}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: 16, background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: 12, color: "#C9D2E3", marginBottom: 8 }}>MARGE NETTE RÉELLE DÉFINITIVE (saisie manuelle a posteriori)</div>
                    <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                      <input
                        type="number"
                        value={selected.margeReelle}
                        onChange={(e) => updateClient(selected.id, { margeReelle: e.target.value === "" ? "" : numFn(e.target.value) })}
                        placeholder="Marge réelle en XAF"
                        style={{ ...inputStyle, width: 180, background: "white" }}
                      />
                      {selected.margeReelle !== "" && (
                        <>
                          <div style={{ fontSize: 13 }}>
                            Écart vs simulation retail :{" "}
                            <strong style={{ color: numFn(selected.margeReelle) >= calc.marginRetail ? "#34D399" : "#F87171" }}>
                              {fmt(numFn(selected.margeReelle) - calc.marginRetail)}
                            </strong>
                          </div>
                          <div style={{ fontSize: 13 }}>
                            Écart vs simulation franchise :{" "}
                            <strong style={{ color: numFn(selected.margeReelle) >= calc.marginFranchise ? "#34D399" : "#F87171" }}>
                              {fmt(numFn(selected.margeReelle) - calc.marginFranchise)}
                            </strong>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{ fontSize: 11, color: "#9AA6C0", marginTop: 4 }}>
                    Le transport est facturé au client en plus du prix produit (pass-through) — il n&apos;est jamais déduit de ta marge, conformément au CGV.
                  </div>

                  <div style={{ fontSize: 11, color: "#9AA6C0", marginTop: 12 }}>
                    Gain franchise sur cette commande : <strong style={{ color: GOLD_LIGHT }}>{fmt(calc.marginFranchise - calc.marginRetail)}</strong> de marge supplémentaire.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
