"use client";

import { useEffect, useState } from "react";

type Suggestion = {
  affectedArea: string;
  draftWording: string;
  feedbackCount: number;
  id: string;
  reviewerNote?: string;
  sourceQuestions: string[];
  status: string;
  topic: string;
};

export function KbFeedbackUpdates() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  async function load() {
    const response = await fetch("/api/admin/kb-feedback-updates");
    const data = await response.json();
    setSuggestions(data.suggestions || []);
  }

  async function decide(id: string, status: string) {
    await fetch("/api/admin/kb-feedback-updates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status })
    });
    await load();
  }

  useEffect(() => {
    void fetch("/api/admin/kb-feedback-updates")
      .then((response) => response.json())
      .then((data) => setSuggestions(data.suggestions || []));
  }, []);

  return (
    <section className="grid gap-4">
      {suggestions.length ? (
        suggestions.map((item) => (
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft" key={item.id}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-costaatt-navy">{item.topic}</h2>
                <p className="mt-1 text-sm font-semibold text-slate-600">{item.affectedArea} · {item.feedbackCount} signal(s) · {item.status}</p>
              </div>
              <div className="flex gap-2">
                <button className="rounded-md bg-costaatt-navy px-3 py-2 text-xs font-semibold text-white" onClick={() => void decide(item.id, "approved")} type="button">Approve</button>
                <button className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-costaatt-navy" onClick={() => void decide(item.id, "rejected")} type="button">Reject</button>
              </div>
            </div>
            <p className="mt-4 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">{item.draftWording}</p>
            <div className="mt-3 grid gap-2">
              {item.sourceQuestions.map((question) => (
                <p className="rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-600" key={question}>{question}</p>
              ))}
            </div>
          </article>
        ))
      ) : (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-slate-700">No repeated missing-information feedback has been detected yet.</p>
        </section>
      )}
    </section>
  );
}
