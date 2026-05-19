import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import {
  buildEnvironmentItems,
  type HandoffEnvItem
} from "@/lib/hostedPilotHandoff";

export default function DeploymentEnvironmentWizardPage() {
  const items = buildEnvironmentItems();
  const groups = groupByCategory(items);
  const counts = {
    configured: items.filter((item) => item.status === "configured").length,
    local: items.filter((item) => item.status === "local").length,
    missing: items.filter((item) => item.status === "missing").length,
    optional: items.filter((item) => item.status === "optional").length
  };

  return (
    <PageShell
      eyebrow="Hosted Pilot Deployment"
      title="Deployment environment wizard"
      description="A Windows VM oriented guide to the environment variables needed for hosted Moodle iframe pilot use, admin protection, AI providers, and pilot rate limits."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="Configured" value={counts.configured} status="configured" />
          <Metric label="Local" value={counts.local} status="local" />
          <Metric label="Missing" value={counts.missing} status="missing" />
          <Metric label="Optional" value={counts.optional} status="optional" />
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-xl font-bold text-costaatt-navy">
          Windows VM handoff note
        </h2>
        <p className="mt-2 leading-7 text-slate-700">
          On the Windows VM, keep secrets out of GitHub. Store production values
          in Windows environment variables, the selected service wrapper, or the
          approved hosting secret store. Rebuild after changing
          `MOODLE_ORIGIN`.
        </p>
      </section>

      <div className="mt-6 grid gap-5">
        {Object.entries(groups).map(([category, groupItems]) => (
          <section
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft"
            key={category}
          >
            <h2 className="text-xl font-bold text-costaatt-navy">{category}</h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {groupItems.map((item) => (
                <EnvCard item={item} key={item.name} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-costaatt-navy">Next Steps</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <ActionLink href="/hosting-runbook" label="Open Hosting Runbook" />
          <ActionLink href="/moodle-copy-center" label="Open Moodle Copy Center" />
          <ActionLink href="/production-hardening" label="Open Hardening Dashboard" />
        </div>
      </section>
    </PageShell>
  );
}

function groupByCategory(items: HandoffEnvItem[]) {
  return items.reduce<Record<string, HandoffEnvItem[]>>((groups, item) => {
    groups[item.category] = groups[item.category] ?? [];
    groups[item.category].push(item);
    return groups;
  }, {});
}

function EnvCard({ item }: { item: HandoffEnvItem }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-bold text-costaatt-navy">{item.name}</h3>
        <Badge status={item.status} />
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-500">
        Required for: {item.requiredFor}
      </p>
      <p className="mt-2 rounded-md bg-slate-900 p-3 font-mono text-xs text-slate-100">
        {item.name}={item.example}
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-700">{item.notes}</p>
    </article>
  );
}

function Metric({
  label,
  status,
  value
}: {
  label: string;
  status: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-costaatt-navy">{value}</p>
      <Badge status={status} />
    </div>
  );
}

function ActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      className="rounded-md border border-costaatt-blue px-4 py-2 text-sm font-bold text-costaatt-blue hover:bg-blue-50"
      href={href}
    >
      {label}
    </Link>
  );
}

function Badge({ status }: { status: string }) {
  return (
    <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-bold ${toneClass(status)}`}>
      {status}
    </span>
  );
}

function toneClass(status: string) {
  if (status === "configured") {
    return "bg-emerald-100 text-emerald-800";
  }

  if (status === "missing") {
    return "bg-red-100 text-red-800";
  }

  if (status === "local") {
    return "bg-amber-100 text-amber-800";
  }

  return "bg-slate-100 text-slate-700";
}
