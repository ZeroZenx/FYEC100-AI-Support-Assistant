import { PageShell } from "@/components/PageShell";
import { isAdminAccessAllowed } from "@/lib/adminAuth";
import { getEnterpriseStatus } from "@/lib/enterpriseStatus";

const statusStyles = {
  approved: "bg-emerald-100 text-emerald-800",
  complete: "bg-emerald-100 text-emerald-800",
  fail: "bg-red-100 text-red-800",
  "in-progress": "bg-amber-100 text-amber-800",
  "not-started": "bg-slate-100 text-slate-700",
  pass: "bg-emerald-100 text-emerald-800",
  pending: "bg-slate-100 text-slate-700",
  planned: "bg-blue-100 text-blue-800",
  ready: "bg-emerald-100 text-emerald-800",
  ok: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  warn: "bg-amber-100 text-amber-800",
  watch: "bg-amber-100 text-amber-800",
  go: "bg-emerald-100 text-emerald-800",
  hold: "bg-amber-100 text-amber-800",
  blocked: "bg-red-100 text-red-800",
  "changes-requested": "bg-red-100 text-red-800",
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

const reviewProcedure = [
  "Review feedback after each controlled pilot session.",
  "Route lecturer follow-up to the FYEC100 lecturer or project lead.",
  "Route Moodle access or navigation issues to the LMS administrator.",
  "Route provider or uptime issues to the technical lead and system administrator.",
  "Convert repeated missing-answer reports into knowledge base update requests."
];

export default async function AdminPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const adminToken = readParam(params.adminToken);

  if (!isAdminAccessAllowed(adminToken)) {
    return <AdminAccessRequired />;
  }

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
      {!status.adminAuth.configured ? (
        <section className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-bold text-costaatt-navy">
            Pilot admin token not configured
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Local development access is currently allowed because
            `ADMIN_ACCESS_TOKEN` is not set. Configure it before hosted pilot
            use so `/admin` and `/api/admin/*` require a token.
          </p>
        </section>
      ) : null}

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
              Knowledge Base Management
            </p>
            <h2 className="mt-2 text-2xl font-bold text-costaatt-navy">
              FYEC100 content governance
            </h2>
          </div>
          <span
            className={`w-fit rounded-md px-3 py-1 text-xs font-semibold ${
              status.knowledgeBase.review.readyForPilot
                ? statusStyles.complete
                : statusStyles["in-progress"]
            }`}
          >
            {status.knowledgeBase.review.readyForPilot
              ? "Reviewed"
              : "Needs review"}
          </span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <MetricCard label="Words" value={status.knowledgeBase.wordCount} />
          <MetricCard label="Sections" value={status.knowledgeBase.headings.length} />
          <MetricCard label="Lines" value={status.knowledgeBase.lineCount} />
          <MetricCard
            label="Characters"
            value={status.knowledgeBase.characterCount}
          />
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-bold text-costaatt-navy">Content source</h3>
            <dl className="mt-3 space-y-3 text-sm text-slate-700">
              <div>
                <dt className="font-semibold text-slate-900">Path</dt>
                <dd>{status.knowledgeBase.path}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Review status</dt>
                <dd>{status.knowledgeBase.review.statusMessage}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Admin API</dt>
                <dd>/api/admin/knowledge-base</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-bold text-costaatt-navy">Section headings</h3>
            <ol className="mt-3 space-y-2 text-sm text-slate-700">
              {status.knowledgeBase.headings.map((heading, index) => (
                <li
                  className="rounded-md border border-slate-200 bg-white px-3 py-2"
                  key={`${heading.title}-${index}`}
                >
                  <span className="text-xs font-semibold text-slate-500">
                    H{heading.level}
                  </span>{" "}
                  {heading.title}
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="font-bold text-costaatt-navy">Preview excerpt</h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {status.knowledgeBase.preview}
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-costaatt-teal">
              Pilot Sign-off
            </p>
            <h2 className="mt-2 text-2xl font-bold text-costaatt-navy">
              Project-team approval pack
            </h2>
          </div>
          <span
            className={`w-fit rounded-md px-3 py-1 text-xs font-semibold ${
              status.pilotSignoff.approvedForControlledPilot
                ? statusStyles.complete
                : statusStyles["in-progress"]
            }`}
          >
            {status.pilotSignoff.record.decisionStatus}
          </span>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-700">
          {status.pilotSignoff.statusMessage}
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <MetricCard
            label="Approved"
            value={status.pilotSignoff.counts.approved}
          />
          <MetricCard
            label="Pending"
            value={status.pilotSignoff.counts.pending}
          />
          <MetricCard
            label="Changes"
            value={status.pilotSignoff.counts.changesRequested}
          />
          <MetricCard
            label="Owners"
            value={status.pilotSignoff.record.approvals.length}
          />
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-bold text-costaatt-navy">
              Approval owners
            </h3>
            <div className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
              {status.pilotSignoff.record.approvals.map((approval) => (
                <article className="p-4" key={approval.name}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-costaatt-navy">
                        {approval.name}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {approval.responsibility}
                      </p>
                    </div>
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-semibold ${
                        statusStyles[approval.status]
                      }`}
                    >
                      {approval.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {approval.role}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    {approval.notes}
                  </p>
                </article>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-lg border border-costaatt-gold/50 bg-yellow-50 p-4">
              <h3 className="font-bold text-costaatt-navy">Decision notes</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                {status.pilotSignoff.record.decisionNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
            <SnippetBlock
              code="/api/admin/pilot-signoff"
              label="Pilot sign-off JSON"
            />
            <SnippetBlock
              code={status.pilotSignoff.exportPath}
              label="Pilot sign-off Markdown"
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-costaatt-teal">
              Pilot Evidence
            </p>
            <h2 className="mt-2 text-2xl font-bold text-costaatt-navy">
              Sponsor go/no-go snapshot
            </h2>
          </div>
          <span
            className={`w-fit rounded-md px-3 py-1 text-xs font-semibold ${
              statusStyles[status.pilotEvidence.goNoGo.status]
            }`}
          >
            {status.pilotEvidence.goNoGo.label}
          </span>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-700">
          {status.pilotEvidence.goNoGo.message}
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <MetricCard label="Ready" value={status.pilotEvidence.summary.ready} />
          <MetricCard label="Watch" value={status.pilotEvidence.summary.watch} />
          <MetricCard
            label="Blocked"
            value={status.pilotEvidence.summary.blocked}
          />
          <MetricCard
            label="Helpful rate"
            value={status.pilotEvidence.metrics.helpfulRate}
            suffix="%"
          />
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-bold text-costaatt-navy">Evidence signals</h3>
            <div className="mt-4 grid gap-3">
              {status.pilotEvidence.signals.map((signal) => (
                <article
                  className="rounded-md border border-slate-200 bg-white p-3"
                  key={signal.label}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-semibold text-costaatt-navy">
                      {signal.label}
                    </h4>
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-semibold ${
                        statusStyles[signal.status]
                      }`}
                    >
                      {signal.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {signal.message}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Owner: {signal.owner}
                  </p>
                </article>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-lg border border-costaatt-gold/50 bg-yellow-50 p-4">
              <h3 className="font-bold text-costaatt-navy">
                Recommended actions
              </h3>
              <div className="mt-3 space-y-3">
                {status.pilotEvidence.recommendedActions.map((action) => (
                  <div
                    className="rounded-md border border-costaatt-gold/40 bg-white p-3"
                    key={`${action.owner}-${action.text}`}
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {action.owner}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">
                      {action.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <SnippetBlock
              code="/api/admin/pilot-evidence"
              label="Pilot evidence JSON"
            />
            <SnippetBlock
              code="/api/admin/pilot-evidence.md"
              label="Pilot evidence Markdown"
            />
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          {status.pilotEvidence.privacyNotice}
        </p>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-costaatt-teal">
              Knowledge Base Review
            </p>
            <h2 className="mt-2 text-2xl font-bold text-costaatt-navy">
              Lecturer/content-owner approval workflow
            </h2>
          </div>
          <span
            className={`w-fit rounded-md px-3 py-1 text-xs font-semibold ${
              status.knowledgeBase.review.readyForPilot
                ? statusStyles.complete
                : statusStyles["in-progress"]
            }`}
          >
            {status.knowledgeBase.review.record.approvalStatus}
          </span>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-700">
          {status.knowledgeBase.review.statusMessage}
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <ReviewStateCard
            label="Reviewer"
            ok={status.knowledgeBase.review.hasReviewer}
          />
          <ReviewStateCard
            label="Review date"
            ok={status.knowledgeBase.review.hasReviewDate}
          />
          <ReviewStateCard
            label="Approval"
            ok={status.knowledgeBase.review.approved}
          />
          <ReviewStateCard
            label="Pilot ready"
            ok={status.knowledgeBase.review.readyForPilot}
          />
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-bold text-costaatt-navy">Review record</h3>
            <dl className="mt-3 space-y-3 text-sm text-slate-700">
              <div>
                <dt className="font-semibold text-slate-900">Version</dt>
                <dd>{status.knowledgeBase.review.record.versionLabel}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Revision</dt>
                <dd>{status.knowledgeBase.review.record.revision}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Content owner</dt>
                <dd>{status.knowledgeBase.review.record.contentOwner}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Reviewer</dt>
                <dd>
                  {status.knowledgeBase.review.record.reviewerName ||
                    "Not recorded"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Last reviewed</dt>
                <dd>
                  {status.knowledgeBase.review.record.lastReviewedAt ||
                    "Not recorded"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Review file</dt>
                <dd>{status.knowledgeBase.review.reviewFile.path}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-bold text-costaatt-navy">Reviewer notes</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {status.knowledgeBase.review.record.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <SnippetBlock
            code="/api/admin/knowledge-base/review"
            label="Review JSON endpoint"
          />
          <SnippetBlock
            code={status.knowledgeBase.review.exportPath}
            label="Review Markdown export"
          />
        </div>
      </section>

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
              Integration Decision
            </p>
            <h2 className="mt-2 text-2xl font-bold text-costaatt-navy">
              Moodle path recommendation
            </h2>
          </div>
          <span className={`w-fit rounded-md px-3 py-1 text-xs font-semibold ${statusStyles["in-progress"]}`}>
            Decision scaffold
          </span>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-700">
          {status.integrationDecision.summary}
        </p>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {status.integrationDecision.options.map((option) => (
            <article
              className={`rounded-lg border p-4 ${
                option.id === status.integrationDecision.recommendedOption.id
                  ? "border-costaatt-gold/70 bg-yellow-50"
                  : "border-slate-200 bg-slate-50"
              }`}
              key={option.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-costaatt-navy">
                    {option.label}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {option.phaseFit} · {option.effort} effort
                  </p>
                </div>
                <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-costaatt-navy">
                  {option.score}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {option.description}
              </p>
              <p className="mt-3 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Best for:</span>{" "}
                {option.bestFor}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {option.recommendation}
              </p>
              <div className="mt-4 grid gap-3">
                <OptionList items={option.strengths} title="Strengths" />
                <OptionList items={option.considerations} title="Considerations" />
              </div>
            </article>
          ))}
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-bold text-costaatt-navy">Decision criteria</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {status.integrationDecision.decisionCriteria.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-bold text-costaatt-navy">Next actions</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {status.integrationDecision.nextActions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <SnippetBlock
          code="/api/admin/integration-decision"
          label="Integration decision endpoint"
        />
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-costaatt-teal">
              Moodle Block Plugin
            </p>
            <h2 className="mt-2 text-2xl font-bold text-costaatt-navy">
              Course-shell plugin scaffold
            </h2>
          </div>
          <span
            className={`w-fit rounded-md px-3 py-1 text-xs font-semibold ${
              status.moodleBlockPlugin.readyForLmsReview
                ? statusStyles.complete
                : statusStyles["in-progress"]
            }`}
          >
            {status.moodleBlockPlugin.readyForLmsReview
              ? "Ready for LMS review"
              : "Needs files"}
          </span>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-700">
          {status.moodleBlockPlugin.summary}
        </p>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-600">Component</p>
            <p className="mt-2 text-xl font-bold text-costaatt-navy">
              {status.moodleBlockPlugin.component}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-600">Moodle path</p>
            <p className="mt-2 text-xl font-bold text-costaatt-navy">
              {status.moodleBlockPlugin.installPath}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-600">Admin API</p>
            <p className="mt-2 break-words text-sm font-bold text-costaatt-navy">
              /api/admin/moodle-block
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-bold text-costaatt-navy">Required plugin files</h3>
            <div className="mt-3 divide-y divide-slate-200 rounded-md border border-slate-200 bg-white">
              {status.moodleBlockPlugin.requiredFiles.map((file) => (
                <div
                  className="grid gap-2 p-3 text-sm text-slate-700 sm:grid-cols-[90px_1fr]"
                  key={file.path}
                >
                  <span
                    className={`w-fit rounded-md px-2 py-1 text-xs font-semibold ${
                      file.exists ? statusStyles.complete : statusStyles.error
                    }`}
                  >
                    {file.exists ? "present" : "missing"}
                  </span>
                  <span>{file.path}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-costaatt-gold/50 bg-yellow-50 p-4">
            <h3 className="font-bold text-costaatt-navy">Trust boundary</h3>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {status.moodleBlockPlugin.trustBoundary}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Copy the local plugin folder into Moodle as{" "}
              <span className="font-semibold">
                {status.moodleBlockPlugin.installPath}
              </span>{" "}
              only after LMS administrator review in a test Moodle environment.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-costaatt-teal">
              LTI 1.3 Readiness
            </p>
            <h2 className="mt-2 text-2xl font-bold text-costaatt-navy">
              Enterprise launch validation scaffold
            </h2>
          </div>
          <span className={`w-fit rounded-md px-3 py-1 text-xs font-semibold ${statusStyles["in-progress"]}`}>
            Validation not implemented
          </span>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-700">
          {status.ltiReadiness.trustBoundary}
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <MetricCard
            label="Configured"
            value={status.ltiReadiness.summary.configured}
          />
          <MetricCard
            label="Warnings"
            value={status.ltiReadiness.summary.warnings}
          />
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-600">Admin API</p>
            <p className="mt-2 break-words text-sm font-bold text-costaatt-navy">
              /api/admin/lti-readiness
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-bold text-costaatt-navy">Tool endpoints</h3>
            <dl className="mt-3 space-y-3 text-sm text-slate-700">
              {Object.entries(status.ltiReadiness.toolEndpoints).map(
                ([key, value]) => (
                  <div key={key}>
                    <dt className="font-semibold text-slate-900">{key}</dt>
                    <dd className="break-words">
                      {Array.isArray(value) ? value.join(", ") : value}
                    </dd>
                  </div>
                )
              )}
            </dl>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-bold text-costaatt-navy">
              Moodle platform values
            </h3>
            <dl className="mt-3 space-y-3 text-sm text-slate-700">
              {Object.entries(status.ltiReadiness.platform).map(([key, value]) => (
                <div key={key}>
                  <dt className="font-semibold text-slate-900">{key}</dt>
                  <dd className="break-words">
                    {value || "Not configured"}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-bold text-costaatt-navy">Readiness checks</h3>
            <div className="mt-3 divide-y divide-slate-200 rounded-md border border-slate-200 bg-white">
              {status.ltiReadiness.checks.map((check) => (
                <div
                  className="grid gap-2 p-3 text-sm text-slate-700 sm:grid-cols-[100px_1fr]"
                  key={check.label}
                >
                  <span
                    className={`w-fit rounded-md px-2 py-1 text-xs font-semibold ${
                      check.status === "pass"
                        ? statusStyles.pass
                        : statusStyles.warn
                    }`}
                  >
                    {check.status}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {check.label}
                    </p>
                    <p className="mt-1 leading-6">{check.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-costaatt-gold/50 bg-yellow-50 p-4">
            <h3 className="font-bold text-costaatt-navy">Implementation path</h3>
            <ol className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {status.ltiReadiness.workflow.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-costaatt-teal">
              Moodle Launch Audit
            </p>
            <h2 className="mt-2 text-2xl font-bold text-costaatt-navy">
              Embedded usage diagnostics
            </h2>
          </div>
          <p className="text-sm text-slate-600">
            Privacy-light pilot telemetry from `/embed` launches.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <MetricCard label="Launches" value={status.launchAudit.total} />
          <MetricCard
            label="Roles"
            value={Object.keys(status.launchAudit.countsByRole).length}
          />
          <MetricCard
            label="Sources"
            value={Object.keys(status.launchAudit.countsBySource).length}
          />
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-bold text-costaatt-navy">Audit source</h3>
            <dl className="mt-3 space-y-3 text-sm text-slate-700">
              <div>
                <dt className="font-semibold text-slate-900">Storage</dt>
                <dd>{status.launchAudit.path}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Admin API</dt>
                <dd>/api/admin/launch-audit</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Notice</dt>
                <dd>{status.launchAudit.privacyNotice}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-bold text-costaatt-navy">Latest launches</h3>
            <div className="mt-3 divide-y divide-slate-200 rounded-md border border-slate-200 bg-white">
              {status.launchAudit.latest.length > 0 ? (
                status.launchAudit.latest.map((item) => (
                  <div
                    className="grid gap-2 p-3 text-sm text-slate-700 sm:grid-cols-[170px_1fr]"
                    key={`${item.timestamp}-${item.context.launchSource}-${item.context.role}`}
                  >
                    <p className="text-xs text-slate-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                    <p>
                      {item.context.courseShortName} · {item.context.role} ·{" "}
                      {item.context.launchSource}
                    </p>
                  </div>
                ))
              ) : (
                <p className="p-3 text-sm text-slate-600">
                  No embedded launches have been recorded yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-costaatt-teal">
              Pilot Sessions
            </p>
            <h2 className="mt-2 text-2xl font-bold text-costaatt-navy">
              Controlled Moodle pilot planner
            </h2>
          </div>
          <p className="text-sm text-slate-600">
            Editable source: `data/pilot-sessions.json`
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <MetricCard label="Sessions" value={status.pilotSessions.total} />
          <MetricCard
            label="Planned"
            value={status.pilotSessions.statusCounts.planned}
          />
          <MetricCard
            label="Not started"
            value={status.pilotSessions.statusCounts["not-started"]}
          />
          <MetricCard
            label="Complete"
            value={status.pilotSessions.statusCounts.complete}
          />
        </div>
        <div className="mt-6 grid gap-4">
          {status.pilotSessions.sessions.map((session) => (
            <article
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              key={session.id}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-costaatt-navy">
                    {session.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {session.mode} · {session.audience} · {session.facilitator}
                  </p>
                </div>
                <span
                  className={`w-fit rounded-md px-3 py-1 text-xs font-semibold ${
                    statusStyles[session.status]
                  }`}
                >
                  {session.status}
                </span>
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <ChecklistColumn title="Pre-checks" items={session.preChecks} />
                <ChecklistColumn
                  title="Success criteria"
                  items={session.successCriteria}
                />
                <ChecklistColumn title="Post-checks" items={session.postChecks} />
              </div>
            </article>
          ))}
        </div>
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
              Support Playbook
            </p>
            <h2 className="mt-2 text-2xl font-bold text-costaatt-navy">
              Escalation owners and first response guidance
            </h2>
          </div>
          <p className="text-sm text-slate-600">
            Admin API: `/api/admin/support-playbook`
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {status.supportPlaybook.items.map((item) => (
            <article
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              key={item.category}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold text-costaatt-navy">{item.category}</h3>
                <span
                  className={`rounded-md px-2 py-1 text-xs font-semibold ${
                    item.priority === "high"
                      ? statusStyles.warn
                      : statusStyles.pending
                  }`}
                >
                  {item.priority}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Owner:</span>{" "}
                {item.owner}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {item.firstResponse}
              </p>
              <p className="mt-2 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Target:</span>{" "}
                {item.resolutionTarget}
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                {item.examples.map((example) => (
                  <li key={example}>{example}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-costaatt-teal">
              Deployment Readiness
            </p>
            <h2 className="mt-2 text-2xl font-bold text-costaatt-navy">
              Hosted pilot checks
            </h2>
          </div>
          <span
            className={`w-fit rounded-md px-3 py-1 text-xs font-semibold ${
              status.deploymentReadiness.okForControlledPilot
                ? statusStyles.pass
                : statusStyles.fail
            }`}
          >
            {status.deploymentReadiness.okForControlledPilot
              ? "No blocking failures"
              : "Blocking failures"}
          </span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <MetricCard
            label="Pass"
            value={status.deploymentReadiness.summary.pass}
          />
          <MetricCard
            label="Warnings"
            value={status.deploymentReadiness.summary.warn}
          />
          <MetricCard
            label="Failures"
            value={status.deploymentReadiness.summary.fail}
          />
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-600">Endpoint</p>
            <p className="mt-2 break-words text-sm font-semibold text-costaatt-navy">
              /api/admin/deployment-readiness
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {status.deploymentReadiness.checks.map((check) => (
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
              Pilot Review Workflow
            </p>
            <h2 className="mt-2 text-2xl font-bold text-costaatt-navy">
              Feedback triage and escalation
            </h2>
          </div>
          <p className="text-sm text-slate-600">
            Pilot-only review view from `data/pilot-feedback.jsonl`.
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
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-bold text-costaatt-navy">
              Escalation categories
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {Object.entries(status.feedback.escalationCounts).map(
                ([category, value]) => (
                  <div
                    className="rounded-md border border-slate-200 bg-white p-3"
                    key={category}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {category}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-costaatt-navy">
                      {value}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
          <div className="rounded-lg border border-costaatt-gold/50 bg-yellow-50 p-4">
            <h3 className="font-bold text-costaatt-navy">Review procedure</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {reviewProcedure.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="font-bold text-costaatt-navy">Review queue</h3>
          <p className="mt-1 text-sm text-slate-600">
            Items below are automatically categorized for pilot review. This is
            not a production ticketing system.
          </p>
          <div className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200">
            {status.feedback.reviewQueue.length > 0 ? (
              status.feedback.reviewQueue.map((item) => (
                <FeedbackReviewItem
                  item={item}
                  key={`${item.timestamp}-${item.rating}-${item.studentQuestionExcerpt}`}
                />
              ))
            ) : (
              <p className="p-4 text-sm text-slate-600">
                No feedback currently requires escalation review.
              </p>
            )}
          </div>
        </div>
        <div className="mt-6">
          <h3 className="font-bold text-costaatt-navy">Latest feedback</h3>
          <div className="mt-4 divide-y divide-slate-200">
            {status.feedback.latest.length > 0 ? (
              status.feedback.latest.map((item) => (
                <FeedbackReviewItem
                  compact
                  item={item}
                  key={`${item.timestamp}-${item.rating}`}
                />
              ))
            ) : (
              <p className="py-4 text-sm text-slate-600">
                No pilot feedback has been captured yet.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-costaatt-teal">
              Pilot Report
            </p>
            <h2 className="mt-2 text-2xl font-bold text-costaatt-navy">
              Stakeholder summary export
            </h2>
          </div>
          <p className="text-sm text-slate-600">
            JSON and Markdown summaries for project-team review meetings.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <MetricCard
            label="Helpful rate"
            value={status.pilotReport.overview.helpfulRate}
            suffix="%"
          />
          <MetricCard
            label="Escalations"
            value={status.pilotReport.overview.totalEscalations}
          />
          <MetricCard
            label="Report items"
            value={status.pilotReport.topReviewItems.length}
          />
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-bold text-costaatt-navy">Export endpoints</h3>
            <div className="mt-4 grid gap-3">
              <SnippetBlock code="/api/admin/report" label="JSON report" />
              <SnippetBlock code="/api/admin/report.md" label="Markdown report" />
            </div>
          </div>
          <div className="rounded-lg border border-costaatt-gold/50 bg-yellow-50 p-4">
            <h3 className="font-bold text-costaatt-navy">Suggested actions</h3>
            <div className="mt-3 space-y-3">
              {status.pilotReport.suggestedActions.map((action) => (
                <div
                  className="rounded-md border border-costaatt-gold/40 bg-white p-3"
                  key={`${action.owner}-${action.text}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-costaatt-blue/10 px-2 py-1 text-xs font-semibold text-costaatt-navy">
                      {action.priority}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {action.owner}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {action.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="font-bold text-costaatt-navy">Top report items</h3>
          <div className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200">
            {status.pilotReport.topReviewItems.length > 0 ? (
              status.pilotReport.topReviewItems.map((item) => (
                <FeedbackReviewItem
                  item={item}
                  key={`${item.timestamp}-${item.rating}-${item.escalationCategory}`}
                />
              ))
            ) : (
              <p className="p-4 text-sm text-slate-600">
                No report items yet. Run a controlled pilot session and collect
                feedback first.
              </p>
            )}
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          {status.pilotReport.privacyNotice}
        </p>
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

function AdminAccessRequired() {
  return (
    <PageShell
      eyebrow="Phase 2 Admin"
      title="Admin access required"
      description="This pilot admin page requires the configured admin token."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-xl font-bold text-costaatt-navy">
          Enter through the protected pilot admin URL
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          Add the configured token as `?adminToken=...` for Phase 2 pilot
          testing, or use platform-level access controls for hosted
          environments.
        </p>
        <p className="mt-4 rounded-md bg-yellow-50 p-4 text-sm leading-6 text-slate-700">
          This is a lightweight pilot safeguard, not a replacement for
          production authentication, SSO, Moodle role validation, or LTI launch
          security.
        </p>
      </section>
    </PageShell>
  );
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function FeedbackReviewItem({
  compact = false,
  item
}: {
  compact?: boolean;
  item: {
    assistantResponseExcerpt: string;
    escalationCategory?: string;
    escalationOwner?: string;
    escalationReason?: string;
    mode: string;
    note?: string;
    rating: string;
    studentQuestionExcerpt: string;
    timestamp: string;
  };
}) {
  return (
    <article className={compact ? "py-4" : "bg-white p-4"}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
          {item.rating}
        </span>
        <span className="rounded-md bg-costaatt-blue/10 px-2 py-1 text-xs font-semibold text-costaatt-navy">
          {item.escalationCategory ?? "none"}
        </span>
        <span className="text-xs text-slate-500">
          {new Date(item.timestamp).toLocaleString()}
        </span>
        <span className="text-xs text-slate-500">{item.mode}</span>
      </div>
      <p className="mt-2 text-sm text-slate-700">
        <span className="font-semibold text-slate-900">Owner:</span>{" "}
        {item.escalationOwner ?? "Pilot review team"}
      </p>
      {item.escalationReason ? (
        <p className="mt-1 text-sm text-slate-700">
          <span className="font-semibold text-slate-900">Reason:</span>{" "}
          {item.escalationReason}
        </p>
      ) : null}
      <p className="mt-2 text-sm text-slate-700">
        <span className="font-semibold text-slate-900">Question:</span>{" "}
        {item.studentQuestionExcerpt}
      </p>
      {!compact ? (
        <p className="mt-1 text-sm text-slate-700">
          <span className="font-semibold text-slate-900">Assistant:</span>{" "}
          {item.assistantResponseExcerpt}
        </p>
      ) : null}
      {item.note ? (
        <p className="mt-1 text-sm text-slate-700">
          <span className="font-semibold text-slate-900">Note:</span>{" "}
          {item.note}
        </p>
      ) : null}
    </article>
  );
}

function MetricCard({
  label,
  suffix = "",
  value
}: {
  label: string;
  suffix?: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-bold text-costaatt-navy">
        {value}
        {suffix}
      </p>
    </div>
  );
}

function ReviewStateCard({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p
        className={`mt-2 text-lg font-bold ${
          ok ? "text-emerald-700" : "text-amber-700"
        }`}
      >
        {ok ? "Complete" : "Needed"}
      </p>
    </div>
  );
}

function ChecklistColumn({ items, title }: { items: string[]; title: string }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-costaatt-navy">{title}</h4>
      <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function OptionList({ items, title }: { items: string[]; title: string }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {title}
      </h4>
      <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
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
