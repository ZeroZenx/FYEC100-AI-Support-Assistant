import { PageShell } from "@/components/PageShell";
import {
  ReadinessLink,
  ReadinessMetric,
  ReadinessRecord
} from "@/components/ReadinessCards";
import { buildWindowsVmReadiness } from "@/lib/readinessLayers";

export default async function WindowsVmReadinessPage() {
  const readiness = await buildWindowsVmReadiness();

  return (
    <PageShell
      eyebrow="Windows VM Production"
      title="Windows VM readiness API"
      description="A concrete readiness view for COSTAATT IT showing the expected path, port, scripts, commands, deployment warnings, and Windows-specific next actions."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-3 md:grid-cols-4">
          <ReadinessMetric label="Expected Port" value={readiness.expectedPort} />
          <ReadinessMetric label="Scripts" value={readiness.requiredWindowsScripts.length} />
          <ReadinessMetric label="Warnings" value={readiness.currentDeploymentWarnings.length} />
          <ReadinessMetric label="Readiness Fails" value={readiness.readiness.summary.fail} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <ReadinessLink href="/api/admin/windows-vm-readiness" label="Open JSON API" />
          <ReadinessLink href="/windows-automation" label="Automation Pack" />
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold text-costaatt-navy">Windows Scripts</h2>
          <div className="mt-4 grid gap-3">
            {readiness.requiredWindowsScripts.map((script) => (
              <ReadinessRecord
                detail={`${script.sizeBytes} byte(s)`}
                key={script.path}
                label={script.path}
                owner="System Administrator"
                status={script.exists ? "ready" : "blocked"}
              />
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold text-costaatt-navy">Next Actions</h2>
          <div className="mt-4 grid gap-3">
            {readiness.nextActions.map((action) => (
              <ReadinessRecord
                detail={action}
                key={action}
                label="Windows deployment action"
                owner="IT / Technical Lead"
                status="review"
              />
            ))}
          </div>
        </section>
      </section>
    </PageShell>
  );
}
