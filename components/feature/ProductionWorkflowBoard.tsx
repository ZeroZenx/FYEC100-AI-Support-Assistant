"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ProductionWorkflow, ProductionWorkflowItem } from "@/lib/productionWorkflow";

const decisions: ProductionWorkflowItem["decision"][] = [
  "draft",
  "ready",
  "in-progress",
  "approved",
  "deferred",
  "blocked",
  "rejected"
];

export function ProductionWorkflowBoard({
  workflowId
}: {
  workflowId: string;
}) {
  const [workflow, setWorkflow] = useState<ProductionWorkflow | null>(null);

  async function load() {
    const response = await fetch(`/api/admin/production-workflows/${workflowId}`);
    setWorkflow(await response.json());
  }

  async function updateItem(itemId: string, decision: ProductionWorkflowItem["decision"]) {
    const response = await fetch(`/api/admin/production-workflows/${workflowId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, itemId })
    });
    setWorkflow(await response.json());
  }

  useEffect(() => {
    void fetch(`/api/admin/production-workflows/${workflowId}`)
      .then((response) => response.json())
      .then(setWorkflow);
  }, [workflowId]);

  if (!workflow) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <p className="text-slate-700">Loading workflow...</p>
      </section>
    );
  }

  return (
    <section className="grid gap-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase text-costaatt-teal">
              {workflow.phase}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-costaatt-navy">
              {workflow.title}
            </h2>
            <p className="mt-3 leading-7 text-slate-700">
              {workflow.description}
            </p>
            <p className="mt-3 text-sm font-semibold text-slate-600">
              Next action: {workflow.nextAction}
            </p>
          </div>
          <Link
            className="rounded-md bg-costaatt-navy px-4 py-3 text-center text-sm font-bold text-white hover:bg-costaatt-blue"
            href={`/api/admin/production-workflow-pack.html?workflow=${workflow.id}`}
          >
            Open HTML Pack
          </Link>
        </div>
      </section>

      <div className="grid gap-4">
        {workflow.items.map((item) => (
          <article
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft"
            key={item.id}
          >
            <div className="grid gap-4 lg:grid-cols-[1fr_220px] lg:items-start">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                    {item.id}
                  </span>
                  <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800">
                    {item.priority}
                  </span>
                  <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-800">
                    {item.category}
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-bold text-costaatt-navy">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  <strong>Owner:</strong> {item.owner}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  <strong>Risk:</strong> {item.risk}
                </p>
                <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                  {item.acceptanceCriteria.map((criteria) => (
                    <li className="rounded-md bg-slate-50 px-3 py-2" key={criteria}>
                      {criteria}
                    </li>
                  ))}
                </ul>
              </div>
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                Decision
                <select
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                  onChange={(event) =>
                    void updateItem(
                      item.id,
                      event.target.value as ProductionWorkflowItem["decision"]
                    )
                  }
                  value={item.decision}
                >
                  {decisions.map((decision) => (
                    <option key={decision} value={decision}>
                      {decision}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
