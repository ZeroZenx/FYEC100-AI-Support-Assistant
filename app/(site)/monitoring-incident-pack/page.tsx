import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { buildMonitoringIncidentPack } from "@/lib/phaseImplementationPacks";

export default async function MonitoringIncidentPackPage() {
  const pack = await buildMonitoringIncidentPack();

  return (
    <PageShell
      eyebrow="Phase 3"
      title="Pilot monitoring and incident response"
      description="Monitoring signals, incident levels, stop-pilot triggers, and response workflow for controlled FYEC100 Moodle pilot operations."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="Launch Records" value={pack.launchAudit.total} />
          <Metric label="Support Queue" value={pack.supportTriage.summary.activeQueue} />
          <Metric label="High Priority" value={pack.supportTriage.summary.highPriority} />
          <Metric label="Runbook Ready" value={pack.runbook.readyForPilot ? 1 : 0} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <LinkButton href="/api/admin/monitoring-incident-pack.html" label="Open HTML Pack" />
          <LinkButton href="/feedback-inbox" label="Feedback Inbox" />
          <LinkButton href="/api/admin/pilot-operations-runbook.md" label="Operations Runbook" />
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel title="Monitoring Signals">
          {pack.monitoringChecks.map((item) => (
            <Record key={item.label} {...item} />
          ))}
        </Panel>
        <Panel title="Incident Levels">
          {pack.incidentLevels.map((item) => (
            <Record key={item.label} {...item} />
          ))}
        </Panel>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <ListPanel title="Response Workflow" items={pack.responseWorkflow} />
        <ListPanel title="Stop-Pilot Triggers" items={pack.runbook.record.stopPilotTriggers} />
      </section>
    </PageShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-costaatt-navy">{value}</p>
    </div>
  );
}

function Panel({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <h2 className="mb-4 text-xl font-bold text-costaatt-navy">{title}</h2>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function ListPanel({ items, title }: { items: string[]; title: string }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <h2 className="text-xl font-bold text-costaatt-navy">{title}</h2>
      <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
        {items.map((item) => (
          <li className="rounded-md border border-slate-200 bg-slate-50 p-3" key={item}>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Record({
  detail,
  label,
  owner,
  status
}: {
  detail: string;
  label: string;
  owner: string;
  status: string;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-bold text-costaatt-navy">{label}</h3>
        <span className={`rounded-full px-2 py-1 text-xs font-bold ${toneClass(status)}`}>
          {status}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-500">{owner}</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{detail}</p>
    </article>
  );
}

function LinkButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      className="rounded-md border border-costaatt-blue px-4 py-2 text-sm font-bold text-costaatt-blue hover:bg-blue-50"
      href={href}
    >
      {label}
    </Link>
  );
}

function toneClass(status: string) {
  if (status === "ready") {
    return "bg-emerald-100 text-emerald-800";
  }

  if (status === "blocked") {
    return "bg-red-100 text-red-800";
  }

  return "bg-amber-100 text-amber-800";
}
