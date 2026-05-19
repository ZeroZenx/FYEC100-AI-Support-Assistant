import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { getEnterpriseStatus } from "@/lib/enterpriseStatus";

type HardeningItem = {
  evidence: string;
  href?: string;
  label: string;
  owner: string;
  status: "blocked" | "ready" | "review";
};

export default async function ProductionHardeningPage() {
  const status = await getEnterpriseStatus();
  const items = buildHardeningItems(status);
  const summary = {
    blocked: items.filter((item) => item.status === "blocked").length,
    ready: items.filter((item) => item.status === "ready").length,
    review: items.filter((item) => item.status === "review").length
  };

  return (
    <PageShell
      eyebrow="Production Hardening"
      title="Hardening checklist dashboard"
      description="A focused dashboard for the infrastructure, security, privacy, support, and Moodle controls that must mature before the FYEC100 assistant moves beyond a controlled pilot."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-3 md:grid-cols-3">
          <Metric label="Ready" value={summary.ready} status="ready" />
          <Metric label="Needs Review" value={summary.review} status="review" />
          <Metric label="Blocked" value={summary.blocked} status="blocked" />
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {items.map((item) => (
          <article
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft"
            key={item.label}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="text-lg font-bold text-costaatt-navy">
                {item.label}
              </h2>
              <Badge status={item.status} />
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Owner: {item.owner}
            </p>
            <p className="mt-3 leading-7 text-slate-700">{item.evidence}</p>
            {item.href ? (
              <Link
                className="mt-4 inline-flex rounded-md border border-costaatt-blue px-4 py-2 text-sm font-bold text-costaatt-blue hover:bg-blue-50"
                href={item.href}
              >
                Open Evidence
              </Link>
            ) : null}
          </article>
        ))}
      </section>
    </PageShell>
  );
}

function buildHardeningItems(
  status: Awaited<ReturnType<typeof getEnterpriseStatus>>
): HardeningItem[] {
  return [
    {
      evidence:
        status.deploymentReadiness.appBaseUrl.includes("localhost")
          ? "NEXT_PUBLIC_APP_BASE_URL is still local. Set an approved HTTPS hosted URL before Moodle pilot embedding."
          : `App base URL is ${status.deploymentReadiness.appBaseUrl}.`,
      href: "/api/admin/hosted-deployment-pack.html",
      label: "Hosted HTTPS URL",
      owner: "System Administrator",
      status: status.deploymentReadiness.appBaseUrl.startsWith("https://")
        ? "ready"
        : "review"
    },
    {
      evidence:
        status.moodleSecurityHardening.moodleOrigin ??
        "MOODLE_ORIGIN is not configured. Frame-ancestors allowlisting is not active locally.",
      href: "/api/admin/moodle-security-hardening.html",
      label: "Moodle frame protection",
      owner: "Technical Lead / LMS Administrator",
      status: status.moodleSecurityHardening.moodleOrigin ? "ready" : "review"
    },
    {
      evidence: status.adminAuth.configured
        ? "ADMIN_ACCESS_TOKEN is configured for pilot admin protection."
        : "ADMIN_ACCESS_TOKEN is not set. Configure it before hosted pilot use.",
      href: "/admin",
      label: "Admin route protection",
      owner: "Technical Lead / System Administrator",
      status: status.adminAuth.configured ? "ready" : "review"
    },
    {
      evidence: status.providerConfigured
        ? `${status.providerLabel} is configured for chat responses.`
        : `${status.providerLabel} is selected but missing required environment variables.`,
      href: "/admin",
      label: "AI provider secrets",
      owner: "Technical Lead",
      status: status.providerConfigured ? "ready" : "review"
    },
    {
      evidence: `Rate limits are configured for chat ${status.deploymentReadiness.rateLimits.chatPerMinute}/min, feedback ${status.deploymentReadiness.rateLimits.feedbackPerMinute}/min, launch audit ${status.deploymentReadiness.rateLimits.launchAuditPerMinute}/min, provider test ${status.deploymentReadiness.rateLimits.providerTestPerMinute}/min.`,
      href: "/api/admin/deployment-readiness",
      label: "Pilot API rate limits",
      owner: "Developer / System Administrator",
      status: "ready"
    },
    {
      evidence: status.knowledgeBase.review.statusMessage,
      href: "/knowledge-base-review",
      label: "Knowledge base approval",
      owner: "Lecturer / Content Owner",
      status: status.knowledgeBase.review.readyForPilot ? "ready" : "review"
    },
    {
      evidence: status.accessibilityUsabilityReview.statusMessage,
      href: "/api/admin/accessibility-usability.md",
      label: "Accessibility and usability",
      owner: "Developer / LMS Administrator",
      status: status.accessibilityUsabilityReview.readyForPilot ? "ready" : "review"
    },
    {
      evidence: status.pilotSignoff.statusMessage,
      href: "/api/admin/pilot-signoff.md",
      label: "Governance sign-off",
      owner: "Project Sponsor / Project Team",
      status: status.pilotSignoff.approvedForControlledPilot ? "ready" : "review"
    },
    {
      evidence:
        status.supportTriage.summary.highPriority > 0
          ? `${status.supportTriage.summary.highPriority} high-priority support item(s) need resolution.`
          : "No high-priority support triage items are currently queued.",
      href: "/feedback-inbox",
      label: "Support escalation readiness",
      owner: "Pilot Review Team",
      status: status.supportTriage.summary.highPriority > 0 ? "blocked" : "ready"
    },
    {
      evidence:
        "Phase 2 remains file-based. Production should move pilot records to approved managed storage with retention rules.",
      href: "/api/admin/hosted-deployment-pack.html",
      label: "Persistent storage decision",
      owner: "Technical Lead / System Administrator",
      status: "review"
    }
  ];
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

function Badge({ status }: { status: string }) {
  return (
    <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-bold ${toneClass(status)}`}>
      {status}
    </span>
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
