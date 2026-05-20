import { PageShell } from "@/components/PageShell";
import {
  ReadinessLink,
  ReadinessList,
  ReadinessMetric
} from "@/components/ReadinessCards";
import { buildIisReverseProxyPack } from "@/lib/readinessLayers";

export default async function IisReverseProxyPage() {
  const pack = await buildIisReverseProxyPack();

  return (
    <PageShell
      eyebrow="Windows VM Production"
      title="IIS reverse proxy pack"
      description="IIS ARR / URL Rewrite assumptions, HTTPS termination, required headers, Moodle iframe checks, and rollback behavior for the Windows VM pilot."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-3 md:grid-cols-3">
          <ReadinessMetric label="Proxy Target" value={pack.proxyTarget} />
          <ReadinessMetric label="Warnings" value={pack.readiness.summary.warn} />
          <ReadinessMetric label="Failures" value={pack.readiness.summary.fail} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <ReadinessLink href="/api/admin/iis-reverse-proxy-pack.html" label="Open HTML Export" />
          <ReadinessLink href="/hosting-runbook" label="Hosting Runbook" />
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <ReadinessList title="Assumptions" items={pack.assumptions} />
        <ReadinessList title="Required Headers" items={pack.headers} />
        <ReadinessList title="Moodle Iframe Checks" items={pack.moodleChecks} />
        <ReadinessList title="Rollback Behavior" items={pack.rollback} />
      </section>
    </PageShell>
  );
}
