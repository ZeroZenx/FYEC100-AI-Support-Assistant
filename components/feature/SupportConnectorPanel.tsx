"use client";

import { useEffect, useState } from "react";

export function SupportConnectorPanel() {
  const [status, setStatus] = useState<Record<string, unknown> | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  async function load() {
    const response = await fetch("/api/admin/support-connector");
    setStatus(await response.json());
  }

  async function test() {
    const response = await fetch("/api/admin/support-connector", { method: "POST" });
    setResult(await response.json());
    await load();
  }

  useEffect(() => {
    void fetch("/api/admin/support-connector")
      .then((response) => response.json())
      .then(setStatus);
  }, []);

  return (
    <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-costaatt-navy">Connector status</h2>
        <div className="mt-4 grid gap-3">
          {["connector", "configured", "targetConfigured", "targetLabel"].map((key) => (
            <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700" key={key}>
              <strong>{key}:</strong> {String(status?.[key] ?? "Loading")}
            </p>
          ))}
        </div>
        <button className="mt-4 rounded-md bg-costaatt-navy px-4 py-2 text-sm font-semibold text-white" onClick={() => void test()} type="button">Run connector test</button>
      </section>
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-xl font-bold text-costaatt-navy">Safe payload boundary</h2>
        <p className="mt-3 text-sm leading-6 text-slate-700">{String(status?.dataBoundary || "")}</p>
        {result ? <pre className="mt-4 overflow-auto rounded-md bg-white p-3 text-xs text-slate-700">{JSON.stringify(result, null, 2)}</pre> : null}
      </section>
    </section>
  );
}
