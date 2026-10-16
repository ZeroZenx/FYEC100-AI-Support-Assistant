"use client";

import { useEffect, useState } from "react";

type ChatGptAuthStatus = {
  account?: { email?: string; name?: string };
  authenticated: boolean;
  configured: boolean;
  enabled: boolean;
  error?: string;
  localOnly: boolean;
  provider: "chatgpt";
  selectedProvider?: string;
};

type ChatGptAuthPanelProps = {
  embedded?: boolean;
};

export function ChatGptAuthPanel({ embedded = false }: ChatGptAuthPanelProps) {
  const [status, setStatus] = useState<ChatGptAuthStatus | null>(null);
  const [message, setMessage] = useState(() => getAuthMessageFromUrl());
  const [loading, setLoading] = useState(false);

  async function loadStatus() {
    try {
      const response = await fetch("/api/auth/chatgpt/status", {
        cache: "no-store"
      });
      setStatus((await response.json()) as ChatGptAuthStatus);
    } catch {
      setMessage("ChatGPT connection status could not be loaded.");
    }
  }

  useEffect(() => {
    let active = true;
    void fetch("/api/auth/chatgpt/status", { cache: "no-store" })
      .then((response) => response.json() as Promise<ChatGptAuthStatus>)
      .then((nextStatus) => {
        if (active) setStatus(nextStatus);
      })
      .catch(() => {
        if (active) setMessage("ChatGPT connection status could not be loaded.");
      });

    return () => {
      active = false;
    };
  }, []);

  if (embedded) return null;

  async function signOut() {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/chatgpt/logout", { method: "POST" });
      const data = (await response.json()) as { message?: string };
      setMessage(data.message || "ChatGPT signed out.");
      await loadStatus();
    } catch {
      setMessage("ChatGPT sign-out could not be completed.");
    } finally {
      setLoading(false);
    }
  }

  const selectedProvider = status?.selectedProvider || "openai";
  const accountLabel = status?.account?.name || status?.account?.email || "Allowed local account";

  return (
    <section className="mt-3 rounded-md border border-slate-200 bg-white px-3 py-3 text-xs text-slate-700" aria-label="AI provider and ChatGPT connection">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-bold text-costaatt-navy">AI provider</p>
          <p className="mt-1">Selected: <span className="font-semibold">{selectedProvider}</span></p>
        </div>
        {status?.enabled ? (
          <span className={`rounded-full px-2 py-1 font-semibold ${status.authenticated ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
            {status.authenticated ? "ChatGPT connected" : "ChatGPT not connected"}
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-600">ChatGPT disabled</span>
        )}
      </div>
      {status?.authenticated ? (
        <p className="mt-2">Connected account: <span className="font-semibold">{accountLabel}</span></p>
      ) : null}
      {status?.localOnly ? (
        <p className="mt-2 leading-5 text-slate-600">ChatGPT plan usage is restricted to this local development session. It is not available to students or through the Moodle iframe.</p>
      ) : null}
      {status?.error ? <p className="mt-2 text-amber-800">{status.error}</p> : null}
      {message ? <p className="mt-2 text-slate-600">{message}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {status?.enabled && !status.authenticated ? (
          <button className="rounded-md bg-costaatt-navy px-3 py-2 font-semibold text-white hover:bg-costaatt-blue" onClick={() => { window.location.href = "/api/auth/chatgpt/start"; }} type="button">
            Continue with ChatGPT
          </button>
        ) : null}
        {status?.authenticated ? (
          <button className="rounded-md border border-slate-300 px-3 py-2 font-semibold text-costaatt-navy hover:border-costaatt-blue disabled:opacity-50" disabled={loading} onClick={() => void signOut()} type="button">
            {loading ? "Signing out..." : "Sign out"}
          </button>
        ) : null}
      </div>
    </section>
  );
}

function getAuthMessageFromUrl() {
  if (typeof window === "undefined") return "";

  const params = new URLSearchParams(window.location.search);
  const authResult = params.get("chatgpt_auth");
  if (authResult === "success") return "ChatGPT connected for this local session.";
  if (authResult === "error") return params.get("message") || "ChatGPT sign-in was not completed.";
  return "";
}
