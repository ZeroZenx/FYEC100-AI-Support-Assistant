import { PageShell } from "@/components/PageShell";
import { ReadinessLink, ReadinessList } from "@/components/ReadinessCards";
import { buildPilotOutcomesLayer } from "@/lib/outcomesOperationsLayers";

export default async function PilotCloseoutPage() {
  const layer = await buildPilotOutcomesLayer();

  return (
    <PageShell
      eyebrow="Pilot Analytics"
      title="Pilot closeout report"
      description="A closeout view for what was tested, what worked, what needs improvement, risks found, and the decision recommendation."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-costaatt-navy">Decision Recommendation</h2>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          {layer.closeout.decisionRecommendation}
        </p>
        <p className="mt-2 text-sm font-semibold text-slate-600">
          {layer.closeout.nextPhaseRecommendation}
        </p>
        <div className="mt-4">
          <ReadinessLink href="/api/admin/pilot-outcomes-pack.html" label="Open Outcomes HTML Pack" />
        </div>
      </section>
      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <ReadinessList title="What Was Tested" items={layer.closeout.tested} />
        <ReadinessList title="What Worked" items={layer.closeout.worked} />
        <ReadinessList title="Needs Improvement" items={layer.closeout.needsImprovement} />
        <ReadinessList title="Risks Found" items={layer.closeout.risksFound} />
      </section>
    </PageShell>
  );
}
