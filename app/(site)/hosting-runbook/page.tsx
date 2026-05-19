import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { getDeploymentReadiness } from "@/lib/deploymentReadiness";
import { buildMoodlePilotConfigPack } from "@/lib/moodlePilotConfig";

export default async function HostingRunbookPage() {
  const [readiness, moodleConfig] = await Promise.all([
    getDeploymentReadiness(),
    buildMoodlePilotConfigPack()
  ]);

  return (
    <PageShell
      eyebrow="Windows VM Hosting Runbook"
      title="Windows VM pilot hosting"
      description="A human-readable hosting runbook for moving the FYEC100 assistant from local development to a controlled Windows VM pilot environment."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
          <div>
            <h2 className="text-2xl font-bold text-costaatt-navy">
              Recommended hosted pilot pattern
            </h2>
            <p className="mt-2 leading-7 text-slate-700">
              Run the Next.js app on the Windows VM behind IIS ARR, Nginx for
              Windows, or another approved reverse proxy. Terminate HTTPS at the
              proxy and forward traffic to Node.js on `localhost:4100`.
            </p>
          </div>
          <Link
            className="self-start rounded-md bg-costaatt-blue px-4 py-3 text-center text-sm font-bold text-white hover:bg-costaatt-navy"
            href="/api/admin/windows-hosting-runbook.html"
          >
            Open HTML Runbook
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-3 md:grid-cols-4">
        <Metric label="Pass" value={readiness.summary.pass} />
        <Metric label="Warnings" value={readiness.summary.warn} />
        <Metric label="Failures" value={readiness.summary.fail} />
        <Metric label="Moodle Origin" value={moodleConfig.moodleOrigin ? 1 : 0} />
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <RunbookBlock
          title="Windows VM Install"
          items={[
            "Provision Windows Server with approved patching and backups.",
            "Install Git and Node.js LTS.",
            "Clone the GitHub repository to an approved application folder.",
            "Run npm install and npm run build.",
            "Run the app as a service using NSSM, PM2, or approved process tooling."
          ]}
        />
        <RunbookBlock
          title="HTTPS And Proxy"
          items={[
            "Expose HTTPS only to Moodle and users.",
            "Forward the public HTTPS host to http://127.0.0.1:4100.",
            "Set NEXT_PUBLIC_APP_BASE_URL to the public HTTPS URL.",
            "Set MOODLE_ORIGIN to the approved Moodle origin.",
            "Rebuild after MOODLE_ORIGIN changes."
          ]}
        />
        <RunbookBlock
          title="Secrets And Logs"
          items={[
            "Store API keys outside GitHub.",
            "Use Windows environment variables or service manager config.",
            "Capture stdout/stderr logs from the Node.js service.",
            "Protect admin URLs with ADMIN_ACCESS_TOKEN and network controls."
          ]}
        />
        <RunbookBlock
          title="Rollback"
          items={[
            "Record the last approved Git commit before deployment.",
            "Stop the service before rollback.",
            "Checkout the previous approved commit.",
            "Run npm run build and restart the service.",
            "Run npm run smoke:pilot against the hosted URL."
          ]}
        />
      </section>
    </PageShell>
  );
}

function RunbookBlock({ items, title }: { items: string[]; title: string }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <h2 className="text-xl font-bold text-costaatt-navy">{title}</h2>
      <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 text-center shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-costaatt-navy">{value}</p>
    </div>
  );
}
