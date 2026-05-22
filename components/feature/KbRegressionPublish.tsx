"use client";

import { useEffect, useState } from "react";

type RegressionData = {
  publishStatus?: {
    publishReady: boolean;
    requirements: Array<{ label: string; pass: boolean }>;
  };
  runs?: Array<{ id: string; summary: { failed: number; passed: number; total: number }; timestamp: string }>;
};

export function KbRegressionPublish() {
  const [data, setData] = useState<RegressionData>({});
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch("/api/admin/kb-regression");
    setData(await response.json());
  }

  async function runRegression() {
    await fetch("/api/admin/kb-regression", { method: "POST" });
    await load();
  }

  async function publish() {
    const response = await fetch("/api/admin/kb-publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        approvedBy: "Lecturer / Project Lead",
        releaseNote: "Published approved feedback-driven FYEC100 clarification."
      })
    });
    const result = await response.json();
    setMessage(result.message);
    await load();
  }

  useEffect(() => {
    void fetch("/api/admin/kb-regression")
      .then((response) => response.json())
      .then(setData);
  }, []);

  return (
    <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-costaatt-navy">Publish gate</h2>
        <div className="mt-4 grid gap-2">
          {data.publishStatus?.requirements.map((item) => (
            <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700" key={item.label}>
              <strong>{item.pass ? "Pass" : "Needs review"}:</strong> {item.label}
            </p>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="rounded-md bg-costaatt-navy px-4 py-2 text-sm font-semibold text-white" onClick={() => void runRegression()} type="button">Run regression</button>
          <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-costaatt-navy disabled:opacity-50" disabled={!data.publishStatus?.publishReady} onClick={() => void publish()} type="button">Publish with snapshot</button>
        </div>
        {message ? <p className="mt-3 text-sm font-semibold text-costaatt-navy">{message}</p> : null}
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-costaatt-navy">Regression runs</h2>
        <div className="mt-4 grid gap-3">
          {data.runs?.length ? data.runs.map((run) => (
            <article className="rounded-md bg-slate-50 p-3 text-sm text-slate-700" key={run.id}>
              <strong>{run.id}</strong> · {run.summary.passed}/{run.summary.total} passed · {new Date(run.timestamp).toLocaleString()}
            </article>
          )) : <p className="text-sm text-slate-600">No regression runs yet.</p>}
        </div>
      </section>
    </section>
  );
}
