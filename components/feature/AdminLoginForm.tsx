"use client";

import { useState } from "react";

const roleTargets: Record<string, string> = {
  developer: "/developer-command-center",
  governance: "/governance-command-center",
  "it-system-admin": "/it-command-center",
  lecturer: "/lecturer-command-center",
  "lms-admin": "/lms-admin-command-center",
  "project-lead": "/project-lead-command-center",
  sponsor: "/sponsor-command-center"
};

export function AdminLoginForm() {
  const [token, setToken] = useState("");
  const [role, setRole] = useState("project-lead");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": token
      },
      body: JSON.stringify({ role })
    });
    if (!response.ok) {
      setError("Admin token was not accepted.");
      setLoading(false);
      return;
    }
    window.location.href = roleTargets[role] || "/admin-home";
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Admin token
          <input className="rounded-md border border-slate-300 px-3 py-2" onChange={(event) => setToken(event.target.value)} type="password" value={token} />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Pilot role
          <select className="rounded-md border border-slate-300 px-3 py-2" onChange={(event) => setRole(event.target.value)} value={role}>
            <option value="project-lead">Project Lead</option>
            <option value="sponsor">Sponsor</option>
            <option value="lecturer">Lecturer</option>
            <option value="lms-admin">LMS Administrator</option>
            <option value="it-system-admin">IT/System Administrator</option>
            <option value="governance">Governance</option>
            <option value="developer">Developer</option>
          </select>
        </label>
        {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
        <button className="rounded-md bg-costaatt-navy px-4 py-3 text-sm font-semibold text-white disabled:bg-slate-300" disabled={loading || !token.trim()} onClick={() => void login()} type="button">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </section>
  );
}
