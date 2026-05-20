import { PageShell } from "@/components/PageShell";
import {
  ReadinessLink,
  ReadinessMetric,
  ReadinessRecord
} from "@/components/ReadinessCards";
import { buildPilotOutcomesLayer } from "@/lib/outcomesOperationsLayers";

export default async function ContentGapAnalysisPage() {
  const layer = await buildPilotOutcomesLayer();

  return (
    <PageShell
      eyebrow="Pilot Analytics"
      title="Content gap analysis workspace"
      description="A readable workspace for missing FYEC100 topics, repeated unanswered questions, missing course information feedback, proposed updates, and lecturer review."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-3 md:grid-cols-3">
          <ReadinessMetric
            label="Missing Info Feedback"
            value={layer.contentGaps.feedbackTaggedMissing}
          />
          <ReadinessMetric
            label="Pending Topics"
            value={layer.contentGaps.missingTopics.length}
          />
          <ReadinessMetric
            label="Proposed Updates"
            value={layer.contentGaps.proposedUpdates.length}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <ReadinessLink href="/content-authoring" label="Authoring Workspace" />
          <ReadinessLink href="/api/admin/pilot-outcomes-pack.html" label="Open HTML Pack" />
        </div>
      </section>
      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold text-costaatt-navy">Missing Topics</h2>
          <div className="mt-4 grid gap-3">
            {layer.contentGaps.missingTopics.map((item) => (
              <ReadinessRecord key={item.label} {...item} />
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold text-costaatt-navy">Proposed Updates</h2>
          <div className="mt-4 grid gap-3">
            {layer.contentGaps.proposedUpdates.length > 0 ? (
              layer.contentGaps.proposedUpdates.map((item) => (
                <ReadinessRecord key={item.label} {...item} />
              ))
            ) : (
              <ReadinessRecord
                detail="No approved proposed updates are currently queued."
                label="No approved updates"
                owner="Lecturer / Content Owner"
                status="ready"
              />
            )}
          </div>
        </section>
      </section>
    </PageShell>
  );
}
