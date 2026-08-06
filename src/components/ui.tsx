"use client";

import type { CSSProperties, ReactNode } from "react";
import { NAVY, RED, GREEN, GOLD, GOLD_LIGHT } from "@/lib/constants";
import { pct, fmt } from "@/lib/calc";

export const inputStyle: CSSProperties = {
  border: "1px solid #DDD",
  borderRadius: 6,
  padding: "5px 8px",
  fontSize: 13,
  width: "100%",
  boxSizing: "border-box",
};
export const miniInput: CSSProperties = {
  border: "1px solid #DDD",
  borderRadius: 6,
  padding: "4px 6px",
  fontSize: 12,
  width: 70,
  boxSizing: "border-box",
};
export const selStyle: CSSProperties = { ...inputStyle, flex: 1 };
export const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 13,
};
export const thStyle: CSSProperties = {
  textAlign: "left",
  color: "#9CA3AF",
  fontWeight: 600,
  fontSize: 11,
  textTransform: "uppercase",
  padding: "4px 8px",
  borderBottom: "1px solid #EEE",
};
export const tdStyle: CSSProperties = {
  padding: "6px 8px",
  borderBottom: "1px solid #F5F5F5",
};
export const rmBtnStyle: CSSProperties = {
  background: "none",
  border: "none",
  color: RED,
  cursor: "pointer",
  fontSize: 13,
};
export const addBtnStyle: CSSProperties = {
  background: "#F3EFE4",
  border: `1px dashed ${GOLD}`,
  color: GOLD,
  borderRadius: 6,
  padding: "6px 12px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};
export const dropdownStyle: CSSProperties = {
  position: "absolute",
  top: "110%",
  left: 0,
  background: "white",
  border: "1px solid #DDD",
  borderRadius: 8,
  boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
  zIndex: 10,
  width: 260,
  maxHeight: 260,
  overflowY: "auto",
};
export const dropdownItemStyle: CSSProperties = {
  padding: "8px 12px",
  display: "flex",
  justifyContent: "space-between",
  cursor: "pointer",
  fontSize: 13,
  borderBottom: "1px solid #F5F5F5",
};
export const scentTag: CSSProperties = {
  background: "#F3EFE4",
  color: NAVY,
  borderRadius: 20,
  padding: "4px 12px",
  fontSize: 12,
  fontWeight: 500,
};
export const scentTagGold: CSSProperties = {
  background: "#FBF3E6",
  color: GOLD,
  border: `1px solid ${GOLD_LIGHT}`,
  borderRadius: 20,
  padding: "4px 12px",
  fontSize: 12,
  fontWeight: 500,
};

export function StatPill({
  label,
  value,
  gold,
}: {
  label: string;
  value: ReactNode;
  gold?: boolean;
}) {
  return (
    <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 14px", minWidth: 140 }}>
      <div style={{ fontSize: 11, color: "#C9D2E3" }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: gold ? GOLD_LIGHT : "white" }}>{value}</div>
    </div>
  );
}

export function GoalProgressBar({
  label,
  current,
  goal,
}: {
  label: string;
  current: number;
  goal: number;
}) {
  const pctValue = goal > 0 ? (current / goal) * 100 : 0;
  const barPct = Math.min(Math.max(pctValue, 0), 100);
  return (
    <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 16px", marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#FFF3DC" }}>🎯 {label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: GOLD_LIGHT }}>
          {fmt(current)} / {fmt(goal)} ({pctValue.toFixed(1)}%)
        </span>
      </div>
      <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 20, height: 10, overflow: "hidden" }}>
        <div
          style={{
            width: `${barPct}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
            borderRadius: 20,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

export function SummaryCard({
  label,
  value,
  gold,
}: {
  label: string;
  value: ReactNode;
  gold?: boolean;
}) {
  return (
    <div style={{ background: gold ? "#FBF3E6" : "#F5F5F5", borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 11, color: "#6B7280" }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: gold ? GOLD : NAVY }}>{value}</div>
    </div>
  );
}

export function Field({
  label,
  children,
  style,
}: {
  label: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div style={style}>
      <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 3 }}>{label}</div>
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
      {children}
    </div>
  );
}

export function ResultBox({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "#C9D2E3" }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

export function MarginCell({ v }: { v: number }) {
  const color = v < 15 ? RED : v < 40 ? GOLD : GREEN;
  return <td style={{ ...tdStyle, color, fontWeight: 700 }}>{pct(v)}</td>;
}

export function ToggleGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ color: "#6B7280" }}>{label}</span>
      <div style={{ display: "flex", border: "1px solid #DDD", borderRadius: 6, overflow: "hidden" }}>
        {options.map((o) => (
          <div
            key={o}
            onClick={() => onChange(o)}
            style={{
              padding: "4px 10px",
              cursor: "pointer",
              background: value === o ? NAVY : "white",
              color: value === o ? "white" : "#374151",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {o}
          </div>
        ))}
      </div>
    </div>
  );
}
