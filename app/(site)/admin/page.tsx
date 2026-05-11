import { PageShell } from "@/components/PageShell";
import { getEnterpriseStatus } from "@/lib/enterpriseStatus";

const statusStyles = {
  complete: "bg-emerald-100 text-emerald-800",
  "in-progress": "bg-amber-100 text-amber-800",
  pending: "bg-slate-100 text-slate-700"
};

export default async function AdminPage() {
  const status = await getEnterpriseStatus();
  const knowledgeBaseUpdated = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(status.knowledgeBase.lastUpdated));

  return (
    <PageShell
      eyebrow="Phase 2 Admin"
      title="Enterprise readiness dashboard"
      description="A simple project-team view for checking Moodle embed details, AI provider configuration, knowledge base status, and deployment readiness."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-wide text-costaatt-teal">
            Moodle Embed URL
          </p>
          <h2 className="mt-3 text-xl font-bold text-costaatt-navy">
            Course Shell Pilot
          </h2>
          <p className="mt-3 break-words rounded-md bg-slate-50 p-3 text-sm text-slate-700">
            {status.embedUrl}
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Use this URL in a Moodle page, HTML block, modal, drawer, or future
            LTI launch test.
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-wide text-costaatt-teal">
            AI Provider
          </p>
          <h2 className="mt-3 text-xl font-bold text-costaatt-navy">
            {status.providerLabel}
          </h2>
          <span
            className={`mt-4 inline-flex rounded-md px-3 py-1 text-xs font-semibold ${
              status.providerConfigured
                ? statusStyles.complete
                : statusStyles["in-progress"]
            }`}
          >
            {status.providerConfigured ? "Configured" : "Needs configuration"}
          </span>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Switch providers with `AI_PROVIDER=openai` or `AI_PROVIDER=ollama`
            in `.env.local`.
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-wide text-costaatt-teal">
            Knowledge Base
          </p>
          <h2 className="mt-3 text-xl font-bold text-costaatt-navy">
            FYEC100 Markdown Source
          </h2>
          <dl className="mt-4 space-y-3 text-sm text-slate-700">
            <div>
              <dt className="font-semibold text-slate-900">Path</dt>
              <dd>{status.knowledgeBase.path}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Last updated</dt>
              <dd>{knowledgeBaseUpdated}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Size</dt>
              <dd>{status.knowledgeBase.sizeBytes.toLocaleString()} bytes</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-costaatt-teal">
              Deployment Checklist
            </p>
            <h2 className="mt-2 text-2xl font-bold text-costaatt-navy">
              Phase 2 readiness
            </h2>
          </div>
          <p className="text-sm text-slate-600">
            This is a planning view, not a secured production admin console.
          </p>
        </div>
        <div className="mt-6 divide-y divide-slate-200">
          {status.checklist.map((item) => (
            <div
              className="grid gap-3 py-4 sm:grid-cols-[180px_1fr_140px] sm:items-center"
              key={item.label}
            >
              <h3 className="font-semibold text-costaatt-navy">{item.label}</h3>
              <p className="text-sm leading-6 text-slate-700">{item.note}</p>
              <span
                className={`w-fit rounded-md px-3 py-1 text-xs font-semibold ${
                  statusStyles[item.status]
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
