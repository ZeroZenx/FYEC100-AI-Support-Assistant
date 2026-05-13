import { PageShell } from "@/components/PageShell";
import { getEnterpriseStatus } from "@/lib/enterpriseStatus";

const statusStyles = {
  complete: "bg-emerald-100 text-emerald-800",
  "in-progress": "bg-amber-100 text-amber-800",
  pending: "bg-slate-100 text-slate-700",
  ok: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  error: "bg-red-100 text-red-800"
};

const moodlePilotChecklist = [
  "Confirm Moodle allows iframe embedding from the assistant domain.",
  "Place the assistant in a controlled FYEC100 pilot course shell.",
  "Confirm the visible student wording and responsible-use notice.",
  "Confirm lecturer and LMS administrator escalation contacts.",
  "Confirm the pilot student group and feedback review schedule.",
  "Confirm the post-pilot decision path: iframe, Moodle block, or LTI."
];

const openAiEnvExample = `AI_PROVIDER=openai
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o-mini`;

const ollamaEnvExample = `AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1`;

const ltiPlaceholderFields = [
  "issuer",
  "client_id",
  "deployment_id",
  "jwks_uri",
  "login_url",
  "redirect_uri",
  "course_id",
  "roles"
];

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
              Provider Setup
            </p>
            <h2 className="mt-2 text-2xl font-bold text-costaatt-navy">
              OpenAI or Ollama configuration
            </h2>
          </div>
          <span
            className={`w-fit rounded-md px-3 py-1 text-xs font-semibold ${
              status.providerStatus.configured
                ? statusStyles.complete
                : statusStyles["in-progress"]
            }`}
          >
            {status.providerStatus.configured ? "Configured" : "Needs env vars"}
          </span>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-600">
              Current provider
            </p>
            <p className="mt-2 text-xl font-bold text-costaatt-navy">
              {status.providerStatus.provider}
            </p>
            <p className="mt-2 text-sm text-slate-700">
              Model: {status.providerStatus.model}
            </p>
            <p className="mt-2 text-sm text-slate-700">
              Test endpoint: `POST /api/admin/provider-test`
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-600">
              Required variables
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {status.providerStatus.requiredVariables.map((variable) => (
                <li key={variable}>{variable}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-600">
              Provider test
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Run the provider test before Moodle pilot sessions to confirm the
              selected model can respond.
            </p>
            <pre className="mt-3 overflow-x-auto rounded-md bg-costaatt-navy p-3 text-xs leading-6 text-white">
              <code>curl -X POST http://localhost:4100/api/admin/provider-test</code>
            </pre>
          </div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <SnippetBlock code={openAiEnvExample} label="OpenAI .env.local" />
          <SnippetBlock code={ollamaEnvExample} label="Ollama .env.local" />
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-costaatt-teal">
              Moodle Launch Context
            </p>
            <h2 className="mt-2 text-2xl font-bold text-costaatt-navy">
              Course and role-aware pilot scaffold
            </h2>
          </div>
          <span className={`w-fit rounded-md px-3 py-1 text-xs font-semibold ${statusStyles["in-progress"]}`}>
            Pilot scaffold
          </span>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-600">
              Accepted embed fields
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {status.launchContext.acceptedFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-600">
              Sample context
            </p>
            <dl className="mt-3 space-y-2 text-sm text-slate-700">
              {Object.entries(status.launchContext.sample).map(([key, value]) => (
                <div key={key}>
                  <dt className="font-semibold text-slate-900">{key}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-600">
              Future LTI 1.3 fields
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {ltiPlaceholderFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-4 grid gap-4">
          <SnippetBlock
            code={status.launchContext.sampleEmbedUrl}
            label="Sample context-aware embed URL"
          />
          <SnippetBlock
            code={status.embedSnippets.iframeWithContext}
            label="Iframe with pilot launch context"
          />
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Query-string context is for controlled pilot testing only. Production
          Moodle integration should use a Moodle block plugin or LTI 1.3 launch
          so course, role, and user context are trusted by Moodle.
        </p>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-costaatt-teal">
              Health Check
            </p>
            <h2 className="mt-2 text-2xl font-bold text-costaatt-navy">
              Deployment readiness signals
            </h2>
          </div>
          <span
            className={`w-fit rounded-md px-3 py-1 text-xs font-semibold ${
              status.health.ok ? statusStyles.ok : statusStyles.error
            }`}
          >
            {status.health.ok ? "Ready with warnings" : "Needs attention"}
          </span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {status.health.checks.map((check) => (
            <div
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              key={check.label}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-costaatt-navy">
                  {check.label}
                </h3>
                <span
                  className={`rounded-md px-2 py-1 text-xs font-semibold ${
                    statusStyles[check.status]
                  }`}
                >
                  {check.status}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {check.message}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-costaatt-teal">
              Moodle Pilot Snippets
            </p>
            <h2 className="mt-2 text-2xl font-bold text-costaatt-navy">
              Copy-ready embed options
            </h2>
          </div>
          <p className="text-sm text-slate-600">
            Use these in a Moodle page, label, or HTML block after iframe
            permissions are confirmed.
          </p>
        </div>
        <div className="mt-6 grid gap-4">
          <SnippetBlock
            code={status.embedSnippets.iframe}
            label="Iframe embed"
          />
          <SnippetBlock
            code={status.embedSnippets.moodleHtmlBlock}
            label="Moodle HTML block"
          />
          <SnippetBlock
            code={status.embedSnippets.link}
            label="Fallback link"
          />
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-costaatt-teal">
              LMS Pilot Checklist
            </p>
            <h2 className="mt-2 text-2xl font-bold text-costaatt-navy">
              Moodle setup tasks
            </h2>
          </div>
          <p className="text-sm text-slate-600">
            Suggested checklist for the LMS administrator and project lead.
          </p>
        </div>
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {moodlePilotChecklist.map((item) => (
            <li
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700"
              key={item}
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-costaatt-teal">
              Pilot Feedback
            </p>
            <h2 className="mt-2 text-2xl font-bold text-costaatt-navy">
              Student response signals
            </h2>
          </div>
          <p className="text-sm text-slate-600">
            Local pilot-only summary from `data/pilot-feedback.jsonl`.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <MetricCard label="Total" value={status.feedback.total} />
          <MetricCard label="Helpful" value={status.feedback.counts.helpful} />
          <MetricCard
            label="Not helpful"
            value={status.feedback.counts["not-helpful"]}
          />
          <MetricCard
            label="Follow-up"
            value={status.feedback.counts["lecturer-follow-up"]}
          />
        </div>
        <div className="mt-6 divide-y divide-slate-200">
          {status.feedback.latest.length > 0 ? (
            status.feedback.latest.map((item) => (
              <article className="py-4" key={`${item.timestamp}-${item.rating}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                    {item.rating}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500">{item.mode}</span>
                </div>
                <p className="mt-2 text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">Question:</span>{" "}
                  {item.studentQuestionExcerpt}
                </p>
                {item.note ? (
                  <p className="mt-1 text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">Note:</span>{" "}
                    {item.note}
                  </p>
                ) : null}
              </article>
            ))
          ) : (
            <p className="py-4 text-sm text-slate-600">
              No pilot feedback has been captured yet.
            </p>
          )}
        </div>
      </section>

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

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-bold text-costaatt-navy">{value}</p>
    </div>
  );
}

function SnippetBlock({ code, label }: { code: string; label: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-costaatt-navy">{label}</p>
      <pre className="mt-3 overflow-x-auto rounded-md bg-costaatt-navy p-4 text-xs leading-6 text-white">
        <code>{code}</code>
      </pre>
    </div>
  );
}
