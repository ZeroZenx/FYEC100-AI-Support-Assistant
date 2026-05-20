import { PageShell } from "@/components/PageShell";
import { ReadinessLink, ReadinessList } from "@/components/ReadinessCards";
import { buildWindowsServicePack } from "@/lib/readinessLayers";

export default async function WindowsServiceConfigPage() {
  const pack = await buildWindowsServicePack();

  return (
    <PageShell
      eyebrow="Windows VM Production"
      title="Windows service configuration"
      description="NSSM, PM2, service account, log path, restart policy, and manual command guidance for running the FYEC100 assistant as a Windows service."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <p className="leading-7 text-slate-700">{pack.serviceAccount}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <ReadinessLink href="/api/admin/windows-service-pack.html" label="Open HTML Export" />
          <ReadinessLink href="/windows-automation" label="Automation Pack" />
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <ReadinessList title="NSSM Option" items={pack.nssm} />
        <ReadinessList title="PM2 Option" items={pack.pm2} />
        <ReadinessList title="Log Paths" items={pack.logPaths} />
        <ReadinessList title="Restart Policy" items={pack.restartPolicy} />
        <ReadinessList title="Manual Commands" items={pack.manualCommands} />
      </section>
    </PageShell>
  );
}
