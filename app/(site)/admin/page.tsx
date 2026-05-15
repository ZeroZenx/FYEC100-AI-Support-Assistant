import { PageShell } from "@/components/PageShell";
import { isAdminAccessAllowed } from "@/lib/adminAuth";
import { getEnterpriseStatus } from "@/lib/enterpriseStatus";

const statusStyles: Record<string, string> = {
  approved: "bg-emerald-100 text-emerald-800",
  blocked: "bg-red-100 text-red-800",
  "changes-requested": "bg-red-100 text-red-800",
  complete: "bg-emerald-100 text-emerald-800",
  configured: "bg-emerald-100 text-emerald-800",
  done: "bg-emerald-100 text-emerald-800",
  draft: "bg-slate-100 text-slate-700",
  error: "bg-red-100 text-red-800",
  "export ready": "bg-emerald-100 text-emerald-800",
  fail: "bg-red-100 text-red-800",
  go: "bg-emerald-100 text-emerald-800",
  high: "bg-amber-100 text-amber-800",
  hold: "bg-amber-100 text-amber-800",
  implemented: "bg-emerald-100 text-emerald-800",
  "in-progress": "bg-amber-100 text-amber-800",
  local: "bg-amber-100 text-amber-800",
  "local only": "bg-amber-100 text-amber-800",
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-100 text-blue-800",
  "needs env vars": "bg-amber-100 text-amber-800",
  "needs files": "bg-red-100 text-red-800",
  "needs review": "bg-amber-100 text-amber-800",
  "needs-review": "bg-amber-100 text-amber-800",
  "needs setup": "bg-amber-100 text-amber-800",
  "not-started": "bg-slate-100 text-slate-700",
  ok: "bg-emerald-100 text-emerald-800",
  open: "bg-blue-100 text-blue-800",
  pass: "bg-emerald-100 text-emerald-800",
  pending: "bg-slate-100 text-slate-700",
  "pending-review": "bg-amber-100 text-amber-800",
  planned: "bg-blue-100 text-blue-800",
  ready: "bg-emerald-100 text-emerald-800",
  "ready for LMS review": "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  "review warnings": "bg-amber-100 text-amber-800",
  reviewed: "bg-emerald-100 text-emerald-800",
  released: "bg-emerald-100 text-emerald-800",
  superseded: "bg-slate-100 text-slate-700",
  warn: "bg-amber-100 text-amber-800",
  warning: "bg-amber-100 text-amber-800",
  watch: "bg-amber-100 text-amber-800"
};

const openAiEnvExample = `AI_PROVIDER=openai
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o-mini`;

const ollamaEnvExample = `AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1`;

const adminNav = [
  { href: "#pilot", label: "Pilot Control" },
  { href: "#moodle", label: "Moodle" },
  { href: "#knowledge", label: "Knowledge Base" },
  { href: "#operations", label: "Operations" },
  { href: "#exports", label: "Exports" }
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
  const checklistCounts = countChecklistStatuses(status.checklist);
  const latestRelease = status.knowledgeBase.releases.latestRelease;
  const latestAction = status.adminActions.openActions[0];
  const latestSession = status.pilotSessions.sessions[0];

  return (
    <PageShell
      eyebrow="Phase 2 Admin"
      title="Enterprise readiness dashboard"
      description="A compact project-team console for pilot decisions, Moodle integration, knowledge base governance, and operational readiness."
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

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
        <div className="grid gap-3 md:grid-cols-4">
          <StatusTile
            label="Go/no-go"
            status={status.pilotEvidence.goNoGo.label}
            tone={status.pilotEvidence.goNoGo.status}
            value={status.pilotEvidence.goNoGo.status.toUpperCase()}
          />
          <StatusTile
            label="Provider"
            status={status.providerConfigured ? "configured" : "needs setup"}
            tone={status.providerConfigured ? "complete" : "in-progress"}
            value={status.providerLabel}
          />
          <StatusTile
            label="Moodle preflight"
            status={
              status.moodlePilotConfig.preflight.okForControlledPilot
                ? "ready"
                : "review warnings"
            }
            tone={
              status.moodlePilotConfig.preflight.okForControlledPilot
                ? "ready"
                : "watch"
            }
            value={`${status.moodlePilotConfig.preflight.deploymentWarnings} warnings`}
          />
          <StatusTile
            label="Knowledge base"
            status={
              status.knowledgeBase.review.readyForPilot
                ? "reviewed"
                : "needs review"
            }
            tone={
              status.knowledgeBase.review.readyForPilot
                ? "complete"
                : "in-progress"
            }
            value={`${status.knowledgeBase.wordCount} words`}
          />
        </div>
      </section>

      <section className="sticky top-24 z-20 mt-5 rounded-lg border border-slate-200 bg-white/95 p-3 shadow-soft backdrop-blur">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold text-costaatt-navy">
              Admin cockpit
            </p>
            <p className="text-xs text-slate-600">
              Jump to a work area, then open only the details you need.
            </p>
          </div>
          <nav className="flex flex-wrap gap-2">
            {adminNav.map((item) => (
              <a
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-costaatt-navy hover:border-costaatt-blue hover:bg-white"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section
        className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]"
        id="pilot"
      >
        <AdminGroup
          eyebrow="Pilot Control"
          title="Decision snapshot"
          summary={status.pilotEvidence.goNoGo.message}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard label="Ready" value={status.pilotEvidence.summary.ready} />
            <MetricCard label="Watch" value={status.pilotEvidence.summary.watch} />
            <MetricCard
              label="Blocked"
              value={status.pilotEvidence.summary.blocked}
            />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <CompactRecord
              label="Sign-off"
              status={status.pilotSignoff.record.decisionStatus}
              text={status.pilotSignoff.statusMessage}
            />
            <CompactRecord
              label="Meeting pack"
              status="export ready"
              text={status.pilotMeetingPack.meetingPurpose}
            />
          </div>
          <DetailDrawer title="Evidence signals">
            <div className="grid gap-3">
              {status.pilotEvidence.signals.map((signal) => (
                <CompactRecord
                  key={signal.label}
                  label={signal.label}
                  meta={`Owner: ${signal.owner}`}
                  status={signal.status}
                  text={signal.message}
                />
              ))}
            </div>
          </DetailDrawer>
        </AdminGroup>

        <AdminGroup
          eyebrow="Next Action"
          title={latestAction?.title ?? "No open action"}
          summary={
            latestAction?.notes ??
            "The action register has no open pilot follow-up items."
          }
        >
          {latestAction ? (
            <div className="grid gap-3">
              <InfoRow label="Owner" value={latestAction.owner} />
              <InfoRow label="Priority" value={latestAction.priority} />
              <InfoRow label="Status" value={latestAction.status} />
              <InfoRow label="Source" value={latestAction.source} />
            </div>
          ) : null}
          <DetailDrawer title="Open actions">
            <div className="grid gap-3">
              {status.adminActions.openActions.map((action) => (
                <CompactRecord
                  key={action.id}
                  label={`${action.id}: ${action.title}`}
                  meta={`${action.owner} / ${action.priority}`}
                  status={action.status}
                  text={action.notes}
                />
              ))}
            </div>
          </DetailDrawer>
        </AdminGroup>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2" id="moodle">
        <AdminGroup
          eyebrow="Moodle"
          title="Integration readiness"
          summary={status.integrationDecision.summary}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard
              label="Failures"
              value={status.moodlePilotConfig.preflight.deploymentFailures}
            />
            <MetricCard
              label="Warnings"
              value={status.moodlePilotConfig.preflight.deploymentWarnings}
            />
            <MetricCard
              label="Setup steps"
              value={status.moodlePilotConfig.steps.length}
            />
          </div>
          <CompactRecord
            label="Recommended path"
            status={status.integrationDecision.recommendedOption.label}
            text={status.integrationDecision.recommendedOption.recommendation}
          />
          <DetailDrawer title="Moodle setup steps">
            <div className="grid gap-3">
              {status.moodlePilotConfig.steps.map((step) => (
                <CompactRecord
                  key={step.label}
                  label={step.label}
                  meta={`Owner: ${step.owner}`}
                  status={step.status}
                  text={step.text}
                />
              ))}
            </div>
          </DetailDrawer>
        </AdminGroup>

        <AdminGroup
          eyebrow="Moodle"
          title="Block plugin and LTI"
          summary={status.moodleBlockPlugin.summary}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <CompactRecord
              label="Block plugin"
              status={
                status.moodleBlockPlugin.readyForLmsReview
                  ? "ready for LMS review"
                  : "needs files"
              }
              text={`Install path: ${status.moodleBlockPlugin.installPath}`}
            />
            <CompactRecord
              label="LTI 1.3 readiness"
              status={`${status.ltiReadiness.summary.warnings} warnings`}
              text={status.ltiReadiness.trustBoundary}
            />
          </div>
          <DetailDrawer title="Required plugin files">
            <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
              {status.moodleBlockPlugin.requiredFiles.map((file) => (
                <div
                  className="grid gap-2 p-3 text-sm sm:grid-cols-[90px_1fr]"
                  key={file.path}
                >
                  <StatusBadge tone={file.exists ? "complete" : "error"}>
                    {file.exists ? "present" : "missing"}
                  </StatusBadge>
                  <span className="break-words text-slate-700">{file.path}</span>
                </div>
              ))}
            </div>
          </DetailDrawer>
        </AdminGroup>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2" id="knowledge">
        <AdminGroup
          eyebrow="Knowledge Base"
          title="FYEC100 content governance"
          summary={status.knowledgeBase.review.statusMessage}
        >
          <div className="grid gap-3 sm:grid-cols-4">
            <MetricCard label="Words" value={status.knowledgeBase.wordCount} />
            <MetricCard
              label="Sections"
              value={status.knowledgeBase.headings.length}
            />
            <MetricCard
              label="Pending CRs"
              value={status.knowledgeBase.changeRequests.summary.pending}
            />
            <MetricCard
              label="Releases"
              value={status.knowledgeBase.releases.summary.total}
            />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <CompactRecord
              label="Content source"
              status={status.knowledgeBase.review.record.approvalStatus}
              text={`Updated ${knowledgeBaseUpdated} / ${status.knowledgeBase.path}`}
            />
            <CompactRecord
              label="Latest release"
              status={latestRelease?.releaseStatus ?? "draft"}
              text={
                latestRelease
                  ? `${latestRelease.id}: ${latestRelease.summary}`
                  : "No release snapshots recorded yet."
              }
            />
          </div>
          <DetailDrawer title="Section headings">
            <ol className="grid gap-2 sm:grid-cols-2">
              {status.knowledgeBase.headings.map((heading, index) => (
                <li
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  key={`${heading.title}-${index}`}
                >
                  <span className="font-semibold text-slate-500">
                    H{heading.level}
                  </span>{" "}
                  {heading.title}
                </li>
              ))}
            </ol>
          </DetailDrawer>
        </AdminGroup>

        <AdminGroup
          eyebrow="Knowledge Base"
          title="Change requests"
          summary="Governed update requests keep FYEC100 content changes visible before release."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard
              label="Total"
              value={status.knowledgeBase.changeRequests.summary.total}
            />
            <MetricCard
              label="Approved"
              value={status.knowledgeBase.changeRequests.summary.approved}
            />
            <MetricCard
              label="High priority"
              value={
                status.knowledgeBase.changeRequests.summary.highPriorityPending
              }
            />
          </div>
          <DetailDrawer title="Pending requests">
            <div className="grid gap-3">
              {status.knowledgeBase.changeRequests.pending.map((request) => (
                <CompactRecord
                  key={request.id}
                  label={`${request.id}: ${request.title}`}
                  meta={`${request.owner} / ${request.priority}`}
                  status={request.status}
                  text={request.recommendedChange}
                />
              ))}
            </div>
          </DetailDrawer>
        </AdminGroup>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2" id="operations">
        <AdminGroup
          eyebrow="Operations"
          title="Deployment and health"
          summary="Hosted pilot checks, provider setup, and runtime health in one place."
        >
          <div className="grid gap-3 sm:grid-cols-4">
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
            <MetricCard label="Health" value={status.health.ok ? 1 : 0} />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <CompactRecord
              label="AI provider"
              status={status.providerStatus.configured ? "configured" : "needs env vars"}
              text={`${status.providerStatus.provider} / ${status.providerStatus.model}`}
            />
            <CompactRecord
              label="Admin protection"
              status={status.adminAuth.configured ? "configured" : "local only"}
              text="Use ADMIN_ACCESS_TOKEN before hosted pilot access."
            />
            <CompactRecord
              label="Accessibility review"
              status={status.accessibilityUsabilityReview.record.reviewStatus}
              text={status.accessibilityUsabilityReview.statusMessage}
            />
            <CompactRecord
              label="Moodle usability checks"
              status={
                status.accessibilityUsabilityReview.readyForPilot
                  ? "approved"
                  : "pending-review"
              }
              text={`${status.accessibilityUsabilityReview.summary.watch} watch / ${status.accessibilityUsabilityReview.summary.pending} pending / ${status.accessibilityUsabilityReview.summary.fail} failed`}
            />
          </div>
          <DetailDrawer title="Accessibility and Moodle usability checks">
            <div className="grid gap-3">
              {status.accessibilityUsabilityReview.record.checks.map((check) => (
                <CompactRecord
                  key={check.id}
                  label={`${check.id}: ${check.label}`}
                  meta={`${check.category} / ${check.owner}`}
                  status={check.status}
                  text={check.recommendedAction}
                />
              ))}
            </div>
          </DetailDrawer>
          <DetailDrawer title="Health checks">
            <div className="grid gap-3">
              {status.health.checks.map((check) => (
                <CompactRecord
                  key={check.label}
                  label={check.label}
                  status={check.status}
                  text={check.message}
                />
              ))}
            </div>
          </DetailDrawer>
        </AdminGroup>

        <AdminGroup
          eyebrow="Operations"
          title="Pilot sessions and support"
          summary="Keep the controlled Moodle pilot focused on session goals and clear escalation owners."
        >
          <CompactRecord
            label={latestSession?.title ?? "No session planned"}
            status={latestSession?.status ?? "not-started"}
            text={
              latestSession
                ? `${latestSession.mode} / ${latestSession.audience} / ${latestSession.facilitator}`
                : "Add pilot sessions in data/pilot-sessions.json."
            }
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <MetricCard label="Sessions" value={status.pilotSessions.total} />
            <MetricCard label="Launches" value={status.launchAudit.total} />
            <MetricCard label="Feedback" value={status.feedback.total} />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <CompactRecord
              label="Operations runbook"
              status={status.pilotOperationsRunbook.record.runbookStatus}
              text={status.pilotOperationsRunbook.statusMessage}
            />
            <CompactRecord
              label="Stop-pilot triggers"
              status={
                status.pilotOperationsRunbook.summary.blocked > 0
                  ? "blocked"
                  : "watch"
              }
              text={`${status.pilotOperationsRunbook.record.stopPilotTriggers.length} triggers documented for pause or stop decisions.`}
            />
          </div>
          <DetailDrawer title="Pilot operations procedures">
            <div className="grid gap-3">
              {status.pilotOperationsRunbook.record.procedures.map(
                (procedure) => (
                  <CompactRecord
                    key={procedure.id}
                    label={`${procedure.id}: ${procedure.title}`}
                    meta={`${procedure.phase} / ${procedure.owner}`}
                    status={procedure.status}
                    text={procedure.steps[0] ?? "Review procedure steps."}
                  />
                )
              )}
            </div>
          </DetailDrawer>
          <DetailDrawer title="Support playbook">
            <div className="grid gap-3">
              {status.supportPlaybook.items.map((item) => (
                <CompactRecord
                  key={item.category}
                  label={item.category}
                  meta={`${item.owner} / ${item.priority}`}
                  status={item.priority}
                  text={item.firstResponse}
                />
              ))}
            </div>
          </DetailDrawer>
        </AdminGroup>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]" id="exports">
        <AdminGroup
          eyebrow="Exports"
          title="Copy-ready links and reports"
          summary="Use these endpoints for sponsor briefings, LMS review, and controlled pilot records."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <EndpointPill label="Admin status" path="/api/admin/status" />
            <EndpointPill label="Pilot evidence" path="/api/admin/pilot-evidence.md" />
            <EndpointPill label="Meeting pack" path="/api/admin/pilot-meeting-pack.md" />
            <EndpointPill
              label="Operations runbook"
              path={status.pilotOperationsRunbook.exportPath}
            />
            <EndpointPill label="Sign-off pack" path={status.pilotSignoff.exportPath} />
            <EndpointPill
              label="Accessibility review"
              path={status.accessibilityUsabilityReview.exportPath}
            />
            <EndpointPill label="Pilot report" path="/api/admin/report.md" />
            <EndpointPill
              label="KB releases"
              path={status.knowledgeBase.releases.exportPath}
            />
          </div>
          <DetailDrawer title="Environment examples">
            <div className="grid gap-3 md:grid-cols-2">
              <SnippetBlock code={openAiEnvExample} label="OpenAI .env.local" />
              <SnippetBlock code={ollamaEnvExample} label="Ollama .env.local" />
            </div>
          </DetailDrawer>
        </AdminGroup>

        <AdminGroup
          eyebrow="Readiness"
          title="Phase 2 checklist"
          summary={`${checklistCounts.complete} complete / ${checklistCounts["in-progress"]} in progress / ${checklistCounts.pending} pending`}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard label="Complete" value={checklistCounts.complete} />
            <MetricCard
              label="In progress"
              value={checklistCounts["in-progress"]}
            />
            <MetricCard label="Pending" value={checklistCounts.pending} />
          </div>
          <DetailDrawer title="Full readiness checklist">
            <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
              {status.checklist.map((item) => (
                <div
                  className="grid gap-2 p-3 text-sm sm:grid-cols-[160px_1fr_120px] sm:items-start"
                  key={item.label}
                >
                  <h3 className="font-semibold text-costaatt-navy">
                    {item.label}
                  </h3>
                  <p className="leading-6 text-slate-700">{item.note}</p>
                  <StatusBadge tone={item.status}>{item.status}</StatusBadge>
                </div>
              ))}
            </div>
          </DetailDrawer>
        </AdminGroup>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-lg font-bold text-costaatt-navy">
          Moodle embed URL
        </h2>
        <p className="mt-3 break-words rounded-md bg-slate-50 p-3 text-sm text-slate-700">
          {status.embedUrl}
        </p>
        <DetailDrawer title="Copy Moodle iframe snippet">
          <SnippetBlock code={status.embedSnippets.iframe} label="Iframe embed" />
        </DetailDrawer>
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

function AdminGroup({
  children,
  eyebrow,
  summary,
  title
}: {
  children: React.ReactNode;
  eyebrow: string;
  summary: string;
  title: string;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-wide text-costaatt-teal">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-bold text-costaatt-navy">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-700">{summary}</p>
      <div className="mt-5">{children}</div>
    </article>
  );
}

function CompactRecord({
  label,
  meta,
  status,
  text
}: {
  label: string;
  meta?: string;
  status: string;
  text: string;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-costaatt-navy">{label}</h3>
          {meta ? <p className="mt-1 text-xs text-slate-500">{meta}</p> : null}
        </div>
        <StatusBadge tone={status}>{status}</StatusBadge>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{text}</p>
    </article>
  );
}

function DetailDrawer({
  children,
  title
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <details className="mt-4 rounded-lg border border-slate-200 bg-slate-50">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-bold text-costaatt-navy">
        <span className="inline-flex w-full items-center justify-between gap-3">
          {title}
          <span className="text-xs font-semibold text-costaatt-teal">
            Open details
          </span>
        </span>
      </summary>
      <div className="border-t border-slate-200 p-4">{children}</div>
    </details>
  );
}

function EndpointPill({ label, path }: { label: string; path: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-bold text-costaatt-navy">{label}</p>
      <p className="mt-2 break-words text-xs leading-5 text-slate-700">{path}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2 text-sm">
      <span className="font-semibold text-slate-600">{label}</span>
      <span className="text-right font-bold text-costaatt-navy">{value}</span>
    </div>
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

function StatusBadge({
  children,
  tone
}: {
  children: React.ReactNode;
  tone: string;
}) {
  return (
    <span
      className={`w-fit rounded-md px-2 py-1 text-xs font-semibold ${
        statusStyles[tone] ?? statusStyles.pending
      }`}
    >
      {children}
    </span>
  );
}

function StatusTile({
  label,
  status,
  tone,
  value
}: {
  label: string;
  status: string;
  tone: string;
  value: string;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-600">{label}</p>
        <StatusBadge tone={tone}>{status}</StatusBadge>
      </div>
      <p className="mt-3 break-words text-lg font-bold leading-6 text-costaatt-navy">
        {value}
      </p>
    </article>
  );
}

function countChecklistStatuses(
  checklist: Array<{ status: "complete" | "in-progress" | "pending" }>
) {
  return checklist.reduce(
    (counts, item) => ({
      ...counts,
      [item.status]: counts[item.status] + 1
    }),
    {
      complete: 0,
      "in-progress": 0,
      pending: 0
    }
  );
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
