"use client";

import { useEffect, useState } from "react";

type Item = {
  evidenceLink: string;
  id: string;
  label: string;
  note: string;
  owner: string;
  status: string;
  updatedAt: string;
};

export function LaunchChecklistClient() {
  const [items, setItems] = useState<Item[]>([]);
  const [decision, setDecision] = useState("");
  const [timeline, setTimeline] = useState<string[]>([]);

  async function load() {
    const response = await fetch("/api/admin/launch-checklist");
    const data = await response.json();
    setItems(data.items);
    setDecision(data.decision);
    setTimeline(data.timeline);
  }

  async function update(input: Record<string, string>) {
    const response = await fetch("/api/admin/launch-checklist", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    const data = await response.json();
    setItems(data.items);
    setDecision(data.decision);
    setTimeline(data.timeline);
  }

  useEffect(() => {
    void fetch("/api/admin/launch-checklist")
      .then((response) => response.json())
      .then((data) => {
        setItems(data.items);
        setDecision(data.decision);
        setTimeline(data.timeline);
      });
  }, []);

  return (
    <section className="grid gap-4">
      {items.map((item) => (
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft" key={item.id}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="font-bold text-costaatt-navy">{item.label}</h3>
              <p className="text-sm text-slate-600">{item.owner} · {item.updatedAt || "Not updated"}</p>
            </div>
            <select className="rounded-md border border-slate-300 px-3 py-2 text-sm" onChange={(event) => void update({ id: item.id, owner: item.owner, status: event.target.value })} value={item.status}>
              <option value="not-started">Not started</option>
              <option value="in-progress">In progress</option>
              <option value="passed">Passed</option>
              <option value="blocked">Blocked</option>
              <option value="skipped">Skipped</option>
            </select>
          </div>
        </article>
      ))}
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <h3 className="font-bold text-costaatt-navy">Launch decision</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {["proceed", "pause", "rollback", "monitor", "abort"].map((next) => (
            <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-costaatt-navy" key={next} onClick={() => void update({ decision: next })} type="button">
              {next}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-600">Current decision: {decision}</p>
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <h3 className="font-bold text-costaatt-navy">Launch timeline</h3>
        <div className="mt-3 grid gap-2 text-sm text-slate-700">
          {timeline.length ? timeline.map((event) => <p key={event}>{event}</p>) : <p>No launch actions recorded yet.</p>}
        </div>
      </section>
    </section>
  );
}
