"use client";

import { useActionState, type CSSProperties } from "react";
import { login } from "@/lib/actions/auth";
import { NAVY, NAVY_LIGHT, GOLD } from "@/lib/constants";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined as
    | { error: string }
    | undefined);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_LIGHT} 100%)`,
        padding: 16,
      }}
    >
      <form
        action={formAction}
        style={{
          background: "white",
          borderRadius: 14,
          padding: 32,
          width: "100%",
          maxWidth: 380,
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: GOLD, fontWeight: 700 }}>
            NIA AL OUD DISTRIBUTION
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: NAVY, marginTop: 4 }}>
            Pilotage Commercial
          </div>
        </div>

        <label style={{ fontSize: 12, color: "#6B7280", display: "block", marginBottom: 4 }}>
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          style={inputStyle}
        />

        <label style={{ fontSize: 12, color: "#6B7280", display: "block", margin: "14px 0 4px" }}>
          Mot de passe
        </label>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          style={inputStyle}
        />

        {state?.error && (
          <div style={{ color: "#DC2626", fontSize: 13, marginTop: 12 }}>{state.error}</div>
        )}

        <button
          type="submit"
          disabled={pending}
          style={{
            width: "100%",
            marginTop: 20,
            background: GOLD,
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "11px 0",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            opacity: pending ? 0.7 : 1,
          }}
        >
          {pending ? "Connexion…" : "Se connecter"}
        </button>
        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 14, textAlign: "center" }}>
          Accès réservé — Nia Al Oud Distribution
        </div>
      </form>
    </div>
  );
}

const inputStyle: CSSProperties = {
  border: "1px solid #DDD",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 14,
  width: "100%",
  boxSizing: "border-box",
};
