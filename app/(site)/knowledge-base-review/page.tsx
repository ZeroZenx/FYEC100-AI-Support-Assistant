import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { getKnowledgeBaseMetadata } from "@/lib/knowledgeBase";
import { getKnowledgeBaseApplyChecklist } from "@/lib/knowledgeBaseApplyChecklist";
import { getKnowledgeBaseChangeRequests } from "@/lib/knowledgeBaseChangeRequests";
import { getKnowledgeBaseDraftUpdates } from "@/lib/knowledgeBaseDraftUpdates";
import { getKnowledgeBaseReleases } from "@/lib/knowledgeBaseReleases";
import { getKnowledgeBaseReviewStatus } from "@/lib/knowledgeBaseReview";

export default async function KnowledgeBaseReviewPage() {
  const [metadata, review, changes, drafts, checklist, releases] =
    await Promise.all([
      getKnowledgeBaseMetadata(),
      getKnowledgeBaseReviewStatus(),
      getKnowledgeBaseChangeRequests(),
      getKnowledgeBaseDraftUpdates(),
      getKnowledgeBaseApplyChecklist(),
      getKnowledgeBaseReleases()
    ]);
  const latestRelease = releases.latestRelease;

  return (
    <PageShell
      eyebrow="Knowledge Base Workspace"
      title="FYEC100 content review"
      description="A staff-friendly workspace for reviewing FYEC100 content sections, proposed updates, approvals, and release notes without opening the raw JSON and Markdown files."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-3 md:grid-cols-5">
          <Metric label="Review" value={review.record.approvalStatus} tone={review.readyForPilot ? "ready" : "watch"} />
          <Metric label="Sections" value={metadata.headings.length} tone="ready" />
          <Metric label="Words" value={metadata.wordCount} tone="ready" />
          <Metric label="Pending Requests" value={changes.summary.pending} tone={changes.summary.pending > 0 ? "watch" : "ready"} />
          <Metric label="Open Drafts" value={drafts.openDrafts.length} tone={drafts.openDrafts.length > 0 ? "watch" : "ready"} />
        </div>
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold text-costaatt-navy">
            Review Status
          </h2>
          <p className="mt-2 leading-7 text-slate-700">{review.statusMessage}</p>
          <div className="mt-4 grid gap-3">
            <Detail label="Content owner" value={review.record.contentOwner} />
            <Detail label="Reviewer" value={review.record.reviewerName || "Not recorded"} />
            <Detail label="Reviewer role" value={review.record.reviewerRole} />
            <Detail label="Last reviewed" value={review.record.lastReviewedAt || "Not recorded"} />
            <Detail label="Version" value={`${review.record.versionLabel} / ${review.record.revision}`} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <ActionLink href="/api/admin/knowledge-base/review.md" label="Open Review Export" />
            <ActionLink href="/api/admin/knowledge-base/change-requests.md" label="Open Change Requests" />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold text-costaatt-navy">
            Live Knowledge Base Sections
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Source: {metadata.path}. Last updated{" "}
            {new Date(metadata.lastUpdated).toLocaleString()}.
          </p>
          <div className="mt-4 grid gap-2">
            {metadata.headings.map((heading) => (
              <div
                className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
                key={`${heading.level}-${heading.title}`}
              >
                <span className="mt-0.5 rounded bg-costaatt-blue px-2 py-1 text-xs font-bold text-white">
                  H{heading.level}
                </span>
                <p className="text-sm font-semibold text-costaatt-navy">
                  {heading.title}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-costaatt-navy">
          Proposed Updates
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {changes.record.requests.map((request) => (
            <Record
              key={request.id}
              label={`${request.id}: ${request.title}`}
              status={request.status}
              meta={`${request.priority} priority / ${request.owner}`}
              text={`${request.knowledgeBaseSection}: ${request.recommendedChange}`}
            />
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel title="Draft Updates">
          {drafts.record.drafts.map((draft) => (
            <Record
              key={draft.id}
              label={`${draft.id}: ${draft.title}`}
              status={draft.status}
              meta={`${draft.priority} priority / ${draft.knowledgeBaseSection}`}
              text={draft.rationale}
            />
          ))}
        </Panel>
        <Panel title="Apply Checklist">
          <p className="mb-4 text-sm leading-6 text-slate-600">
            {checklist.statusMessage}
          </p>
          {checklist.record.steps.map((step) => (
            <Record
              key={step.id}
              label={`${step.id}: ${step.label}`}
              status={step.status}
              meta={step.owner}
              text={step.evidence}
            />
          ))}
        </Panel>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-costaatt-navy">Release Notes</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Latest release: {latestRelease?.versionLabel ?? "No release recorded"}.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {releases.record.releases.map((release) => (
            <Record
              key={release.id}
              label={`${release.id}: ${release.versionLabel}`}
              status={release.releaseStatus}
              meta={`${release.pilotStage} / ${release.reviewer || "Reviewer not recorded"}`}
              text={release.summary}
            />
          ))}
        </div>
      </section>
    </PageShell>
  );
}

function Metric({
  label,
  tone,
  value
}: {
  label: string;
  tone: string;
  value: number | string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-costaatt-navy">{value}</p>
      <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-bold ${toneClass(tone)}`}>
        {tone}
      </span>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-costaatt-navy">{value}</p>
    </div>
  );
}

function Panel({
  children,
  title
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <h2 className="mb-4 text-xl font-bold text-costaatt-navy">{title}</h2>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function Record({
  label,
  meta,
  status,
  text
}: {
  label: string;
  meta: string;
  status: string;
  text: string;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-bold text-costaatt-navy">{label}</h3>
        <span className={`rounded-full px-2 py-1 text-xs font-bold ${toneClass(status)}`}>
          {status}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-500">{meta}</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{text}</p>
    </article>
  );
}

function ActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      className="rounded-md bg-costaatt-blue px-4 py-2 text-sm font-bold text-white hover:bg-costaatt-navy"
      href={href}
    >
      {label}
    </Link>
  );
}

function toneClass(status: string) {
  if (/(approved|applied|complete|implemented|ready|released)/i.test(status)) {
    return "bg-emerald-100 text-emerald-800";
  }

  if (/(blocked|fail|rejected|high)/i.test(status)) {
    return "bg-red-100 text-red-800";
  }

  if (/(pending|review|draft|watch|medium)/i.test(status)) {
    return "bg-amber-100 text-amber-800";
  }

  return "bg-slate-100 text-slate-700";
}
