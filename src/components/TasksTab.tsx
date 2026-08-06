"use client";

import { useMemo, useState } from "react";
import type { Client, Task, TaskCategory, TaskStatus } from "@/lib/types";
import { NAVY, GOLD, RED, TASK_STATUSES, TASK_CATEGORIES, DOSSIER_SUGGESTIONS } from "@/lib/constants";
import { Field, inputStyle, selStyle, rmBtnStyle } from "@/components/ui";

export default function TasksTab({
  tasks,
  clients,
  addTask,
  updateTask,
  deleteTask,
}: {
  tasks: Task[];
  clients: Client[];
  addTask: (patch: Partial<Task>) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
}) {
  const [filterCategory, setFilterCategory] = useState<"Toutes" | TaskCategory>("Toutes");

  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<TaskCategory>("pipeline");
  const [newDossier, setNewDossier] = useState("");
  const [newClientId, setNewClientId] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const filtered = useMemo(
    () => (filterCategory === "Toutes" ? tasks : tasks.filter((t) => t.category === filterCategory)),
    [tasks, filterCategory]
  );

  const byStatus = (status: TaskStatus) =>
    filtered
      .filter((t) => t.status === status)
      .sort((a, b) => {
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return b.createdAt.localeCompare(a.createdAt);
      });

  const submit = () => {
    if (!newTitle.trim()) return;
    addTask({
      title: newTitle.trim(),
      category: newCategory,
      dossier: newCategory === "administratif" ? newDossier.trim() : "",
      clientId: newCategory === "pipeline" && newClientId ? newClientId : null,
      dueDate: newDueDate || null,
      notes: newNotes.trim(),
    });
    setNewTitle("");
    setNewDossier("");
    setNewClientId("");
    setNewDueDate("");
    setNewNotes("");
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div style={{ padding: 24 }}>
      {/* QUICK ADD */}
      <div style={{ background: "white", borderRadius: 12, padding: 18, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div style={{ fontWeight: 700, color: NAVY, fontSize: 16, marginBottom: 12 }}>+ Nouvelle action</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <Field label="Action / dossier" style={{ flex: 2, minWidth: 220 }}>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Ex: Appeler M. Ziyad pour la proforma d'hier"
              style={inputStyle}
            />
          </Field>
          <Field label="Catégorie">
            <div style={{ display: "flex", border: "1px solid #DDD", borderRadius: 6, overflow: "hidden" }}>
              {TASK_CATEGORIES.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setNewCategory(c.id)}
                  style={{
                    padding: "5px 12px",
                    cursor: "pointer",
                    background: newCategory === c.id ? NAVY : "white",
                    color: newCategory === c.id ? "white" : "#374151",
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.label}
                </div>
              ))}
            </div>
          </Field>
          {newCategory === "administratif" ? (
            <Field label="Dossier" style={{ minWidth: 150 }}>
              <input
                value={newDossier}
                onChange={(e) => setNewDossier(e.target.value)}
                placeholder="RCCM, Banque…"
                list="dossier-suggestions"
                style={inputStyle}
              />
              <datalist id="dossier-suggestions">
                {DOSSIER_SUGGESTIONS.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </Field>
          ) : (
            <Field label="Client lié (optionnel)" style={{ minWidth: 180 }}>
              <select value={newClientId} onChange={(e) => setNewClientId(e.target.value)} style={selStyle}>
                <option value="">—</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || "(sans nom)"}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field label="Échéance (optionnel)">
            <input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} style={inputStyle} />
          </Field>
          <button
            onClick={submit}
            style={{ background: GOLD, color: "white", border: "none", borderRadius: 8, padding: "9px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer", height: 34 }}
          >
            + Ajouter
          </button>
        </div>
        <input
          value={newNotes}
          onChange={(e) => setNewNotes(e.target.value)}
          placeholder="Notes complémentaires (optionnel)…"
          style={{ ...inputStyle, width: "100%", marginTop: 10 }}
        />
      </div>

      {/* FILTER */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#6B7280" }}>Filtrer :</span>
        {(["Toutes", ...TASK_CATEGORIES.map((c) => c.id)] as const).map((c) => (
          <button
            key={c}
            onClick={() => setFilterCategory(c)}
            style={{
              background: filterCategory === c ? NAVY : "white",
              color: filterCategory === c ? "white" : "#374151",
              border: "1px solid #DDD",
              borderRadius: 20,
              padding: "4px 14px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {c === "Toutes" ? "Toutes" : TASK_CATEGORIES.find((x) => x.id === c)?.label}
          </button>
        ))}
      </div>

      {/* BOARD */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        {TASK_STATUSES.map((col) => {
          const colTasks = byStatus(col.id);
          return (
            <div key={col.id} style={{ background: "#F1EFE9", borderRadius: 12, padding: 12, minHeight: 200 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "0 4px" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: col.color === "#9CA3AF" ? "#6B7280" : col.color }}>{col.label}</span>
                <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600 }}>{colTasks.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {colTasks.map((t) => {
                  const client = t.clientId ? clients.find((c) => c.id === t.clientId) : null;
                  const cat = TASK_CATEGORIES.find((c) => c.id === t.category);
                  const overdue = t.dueDate && t.dueDate < today && t.status !== "fait";
                  return (
                    <div key={t.id} style={{ background: "white", borderRadius: 8, padding: 10, boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: NAVY,
                            textDecoration: t.status === "fait" ? "line-through" : "none",
                            opacity: t.status === "fait" ? 0.6 : 1,
                          }}
                        >
                          {t.title}
                        </span>
                        <button onClick={() => deleteTask(t.id)} style={{ ...rmBtnStyle, flexShrink: 0 }}>
                          ✕
                        </button>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: cat?.color, border: `1px solid ${cat?.color}`, borderRadius: 10, padding: "1px 8px" }}>
                          {cat?.label}
                        </span>
                        {t.category === "administratif" && t.dossier && (
                          <span style={{ fontSize: 10, color: "#6B7280", background: "#F5F5F5", borderRadius: 10, padding: "1px 8px" }}>{t.dossier}</span>
                        )}
                        {client && (
                          <span style={{ fontSize: 10, color: "#6B7280", background: "#F5F5F5", borderRadius: 10, padding: "1px 8px" }}>{client.name}</span>
                        )}
                        {t.dueDate && (
                          <span style={{ fontSize: 10, fontWeight: 600, color: overdue ? RED : "#6B7280" }}>
                            {overdue ? "⚠ " : ""}
                            {new Date(t.dueDate + "T00:00:00").toLocaleDateString("fr-FR")}
                          </span>
                        )}
                      </div>
                      {t.notes && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 6 }}>{t.notes}</div>}
                      <select
                        value={t.status}
                        onChange={(e) => updateTask(t.id, { status: e.target.value as TaskStatus })}
                        style={{ ...inputStyle, marginTop: 8, fontSize: 11, padding: "3px 6px" }}
                      >
                        {TASK_STATUSES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
                {colTasks.length === 0 && <div style={{ fontSize: 12, color: "#B0B0B0", textAlign: "center", padding: "12px 0" }}>Rien ici.</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
