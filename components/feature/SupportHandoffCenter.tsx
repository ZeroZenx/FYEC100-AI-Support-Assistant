"use client";

import { useEffect, useState } from "react";

type SupportSummary = {
  realCases?: {
    byCategory: Record<string, number>;
    byOwner: Record<string, number>;
    cases: Array<{
      category: string;
      courseCode: string;
      id: string;
      owner: string;
      priority: string;
      safeSummary: string;
      status: string;
    }>;
    summary: { highPriorityOpen: number; open: number; total: number };
  };
};

export function SupportHandoffCenter() {
  const [data, setData] = useState<SupportSummary | null>(null);

  useEffect(() => {
    void fetch("/api/admin/service-desk/cases")
      .then((response) => response.json())
      .then(setData);
  }, []);

  const real = data?.realCases;

  return (
    <section className="grid gap-5">
      <div className="grid gap-3 md:grid-cols-3">
        <Metric label="Total Cases" value={real?.summary.total ?? 0} />
        <Metric label="Open Cases" value={real?.summary.open ?? 0} />
        <Metric label="High Priority" value={real?.summary.highPriorityOpen ?? 0} />
      </div>
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-costaatt-navy">Recent support handoffs</h2>
        <div className="mt-4 grid gap-3">
          {real?.cases.length ? (
            real.cases.map((item) => (
              <article className="rounded-lg border border-slate-200 bg-slate-50 p-4" key={item.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-bold text-costaatt-navy">{item.id}</h3>
                  <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-slate-600">{item.priority}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">{item.safeSummary}</p>
                <p className="mt-2 text-xs font-semibold text-slate-600">{item.courseCode} · {item.category} · {item.owner} · {item.status}</p>
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-600">No support cases have been created yet.</p>
          )}
        </div>
      </section>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 text-center shadow-soft">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-costaatt-navy">{value}</p>
    </div>
  );
}
