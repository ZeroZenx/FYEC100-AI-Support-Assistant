import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { buildEnterpriseLtiPack } from "@/lib/phaseImplementationPacks";

export default async function EnterpriseLtiPackPage() {
  const pack = await buildEnterpriseLtiPack();

  return (
    <PageShell
      eyebrow="Phase 4"
      title="Enterprise LTI 1.3 implementation pack"
      description="A practical implementation roadmap for moving from iframe and Moodle block pilot context to trusted LTI 1.3 launch validation."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
          <div>
            <h2 className="text-2xl font-bold text-costaatt-navy">
              LTI readiness scaffold
            </h2>
            <p className="mt-2 leading-7 text-slate-700">
              {pack.readiness.trustBoundary}
            </p>
          </div>
          <Link
            className="self-start rounded-md bg-costaatt-blue px-4 py-3 text-center text-sm font-bold text-white hover:bg-costaatt-navy"
            href="/api/admin/enterprise-lti-pack.html"
          >
            Open HTML Pack
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-3 md:grid-cols-2">
        <Metric label="Configured Checks" value={pack.readiness.summary.configured} />
        <Metric label="Warnings" value={pack.readiness.summary.warnings} />
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-costaatt-navy">
          Implementation Stages
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {pack.implementationStages.map((item) => (
            <Record key={item.label} {...item} />
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <ListPanel title="Launch Validation Checklist" items={pack.validationChecklist} />
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold text-costaatt-navy">
            Tool Endpoints
          </h2>
          <div className="mt-4 grid gap-3">
            {Object.entries(pack.readiness.toolEndpoints).map(([key, value]) => (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3" key={key}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {key}
                </p>
                <p className="mt-1 break-words font-mono text-sm text-costaatt-navy">
                  {Array.isArray(value) ? value.join(", ") : value}
                </p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </PageShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 text-center shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-4xl font-bold text-costaatt-navy">{value}</p>
    </div>
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
        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">
          {status}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-500">{owner}</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{detail}</p>
    </article>
  );
}
