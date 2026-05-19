import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { buildPilotExportCenter } from "@/lib/hostedPilotHandoff";

export default async function PilotExportCenterPage() {
  const center = await buildPilotExportCenter();

  return (
    <PageShell
      eyebrow="Pilot Data Export Center"
      title="Pilot artifact exports"
      description="A single place for admins to open pilot evidence, feedback, support, Moodle, deployment, cleanup, and Windows VM handoff artifacts before meetings or controlled pilot cleanup."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="Groups" value={center.groups.length} />
          <Metric
            label="Artifacts"
            value={center.groups.reduce((sum, group) => sum + group.items.length, 0)}
          />
          <Metric
            label="Telemetry Records"
            value={center.cleanup.summary.totalRecords}
          />
          <Metric
            label="Resettable Files"
            value={center.cleanup.summary.resettableFiles}
          />
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-700">
          {center.cleanup.modeWarning}
        </p>
      </section>

      <div className="mt-6 grid gap-5">
        {center.groups.map((group) => (
          <section
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft"
            key={group.title}
          >
            <h2 className="text-xl font-bold text-costaatt-navy">
              {group.title}
            </h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {group.items.map((item) => (
                <article
                  className="flex min-h-full flex-col rounded-lg border border-slate-200 bg-slate-50 p-4"
                  key={`${group.title}-${item.label}`}
                >
                  <h3 className="font-bold text-costaatt-navy">{item.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {item.description}
                  </p>
                  <Link
                    className="mt-auto inline-flex rounded-md bg-costaatt-blue px-4 py-2 text-sm font-bold text-white hover:bg-costaatt-navy"
                    href={item.href}
                  >
                    Open Artifact
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-xl font-bold text-costaatt-navy">
          Cleanup Reminder
        </h2>
        <p className="mt-2 leading-7 text-slate-700">
          Export needed records before using cleanup. The cleanup tool only
          resets local pilot telemetry JSONL files; it does not remove source
          code, governance records, Moodle config, or the knowledge base.
        </p>
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
