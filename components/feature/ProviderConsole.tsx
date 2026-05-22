"use client";

import { useEffect, useState } from "react";

export function ProviderConsole() {
  const [status, setStatus] = useState<Record<string, unknown> | null>(null);
  const [test, setTest] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const response = await fetch("/api/admin/provider-status");
    setStatus(await response.json());
  }

  async function runTest() {
    setLoading(true);
    const response = await fetch("/api/admin/provider-status", { method: "POST" });
    setTest(await response.json());
    setLoading(false);
  }

  useEffect(() => {
    void fetch("/api/admin/provider-status")
      .then((response) => response.json())
      .then((data) => setStatus(data));
  }, []);

  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-costaatt-navy">Provider status</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {["provider", "model", "hosting", "configured", "recommendation"].map((key) => (
            <div className="rounded-md bg-slate-50 p-3" key={key}>
              <dt className="text-xs font-bold uppercase text-slate-500">{key}</dt>
              <dd className="mt-1 font-semibold text-costaatt-navy">{String(status?.[key] ?? "Loading")}</dd>
            </div>
          ))}
        </dl>
        <button className="mt-4 rounded-md bg-costaatt-navy px-4 py-2 text-sm font-semibold text-white" disabled={loading} onClick={() => void runTest()} type="button">
          {loading ? "Testing..." : "Test selected provider"}
        </button>
        {test ? (
          <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <p><strong>OK:</strong> {String(test.ok)}</p>
            <p><strong>Latency:</strong> {String(test.durationMs)} ms</p>
            <p><strong>Response:</strong> {String(test.responseExcerpt || test.error || "")}</p>
          </div>
        ) : null}
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-costaatt-navy">Switch instructions</h2>
        <pre className="mt-4 overflow-auto rounded-md bg-slate-950 p-4 text-xs text-white">{`# OpenAI
AI_PROVIDER=openai
OPENAI_MODEL=gpt-4o-mini
OPENAI_API_KEY=<set secret>

# DeepSeek
AI_PROVIDER=deepseek
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_API_KEY=<set secret>

# Ollama local
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1`}</pre>
      </div>
    </section>
  );
}
