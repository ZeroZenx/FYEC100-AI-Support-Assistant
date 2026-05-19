import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { getEnterpriseStatus } from "@/lib/enterpriseStatus";

type GoLiveStatus = "blocked" | "needs review" | "ready";

type GoLiveItem = {
  evidence: string;
  href?: string;
  label: string;
  owner: string;
  status: GoLiveStatus;
};

export default async function GoLiveDashboardPage() {
  const status = await getEnterpriseStatus();
  const items = buildGoLiveItems(status);
  const summary = {
    blocked: items.filter((item) => item.status === "blocked").length,
    review: items.filter((item) => item.status === "needs review").length,
    ready: items.filter((item) => item.status === "ready").length
  };
  const overall =
    summary.blocked > 0
      ? "blocked"
      : summary.review > 0
        ? "needs review"
        : "ready";

  return (
    <PageShell
      eyebrow="Pre-Pilot Go-Live"
      title="Controlled pilot readiness"
      description="A single dashboard showing ready, needs review, or blocked for the exact items COSTAATT must confirm before a real FYEC100 Moodle pilot."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div>
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${toneClass(overall)}`}>
              {overall}
            </span>
            <h2 className="mt-3 text-2xl font-bold text-costaatt-navy">
              {overall === "ready"
                ? "Ready for controlled pilot confirmation"
                : "Review required before controlled pilot"}
            </h2>
            <p className="mt-2 leading-7 text-slate-700">
              Use this page as the pre-pilot review screen with the project
              sponsor, technical lead, LMS administrator, developer, and system
              administrator.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Metric label="Ready" value={summary.ready} tone="ready" />
            <Metric label="Review" value={summary.review} tone="needs review" />
            <Metric label="Blocked" value={summary.blocked} tone="blocked" />
          </div>
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
              <span className={`rounded-full px-2 py-1 text-xs font-bold ${toneClass(item.status)}`}>
                {item.status}
              </span>
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

function buildGoLiveItems(status: Awaited<ReturnType<typeof getEnterpriseStatus>>): GoLiveItem[] {
  return [
    {
      evidence:
        status.moodleSecurityHardening.moodleOrigin ??
        "MOODLE_ORIGIN is not configured for hosted Moodle embedding.",
      href: "/api/admin/moodle-security-hardening.html",
      label: "Moodle origin",
      owner: "LMS Administrator / System Administrator",
      status: status.moodleSecurityHardening.moodleOrigin ? "ready" : "needs review"
    },
    {
      evidence: status.adminAuth.configured
        ? "ADMIN_ACCESS_TOKEN is configured for pilot admin routes."
        : "ADMIN_ACCESS_TOKEN is not configured. Local development is allowed, but hosted pilot admin routes need a token.",
      href: "/admin",
      label: "Admin token",
      owner: "Technical Lead / System Administrator",
      status: status.adminAuth.configured ? "ready" : "needs review"
    },
    {
      evidence: status.pilotMode.summary,
      label: "Pilot mode",
      owner: "Project Lead",
      status: status.pilotMode.isPilot ? "ready" : "needs review"
    },
    {
      evidence: status.providerConfigured
        ? `${status.providerLabel} is configured.`
        : `${status.providerLabel} is selected but missing required environment configuration.`,
      href: "/admin",
      label: "AI provider",
      owner: "Technical Lead",
      status: status.providerConfigured ? "ready" : "needs review"
    },
    {
      evidence: status.knowledgeBase.review.statusMessage,
      href: "/knowledge-base-review",
      label: "Knowledge base review",
      owner: "Lecturer / Content Owner",
      status: status.knowledgeBase.review.readyForPilot ? "ready" : "needs review"
    },
    {
      evidence: status.accessibilityUsabilityReview.statusMessage,
      href: "/api/admin/accessibility-usability.md",
      label: "Accessibility and usability",
      owner: "Developer / LMS Administrator",
      status: status.accessibilityUsabilityReview.readyForPilot ? "ready" : "needs review"
    },
    {
      evidence: status.pilotSignoff.statusMessage,
      href: "/api/admin/pilot-signoff.md",
      label: "Project sign-off",
      owner: "Project Sponsor / Project Team",
      status: status.pilotSignoff.approvedForControlledPilot
        ? "ready"
        : "needs review"
    },
    {
      evidence: status.supportTriage.statusMessage,
      href: "/feedback-inbox",
      label: "Support readiness",
      owner: "Pilot Review Team",
      status: status.supportTriage.summary.highPriority > 0 ? "blocked" : "ready"
    },
    {
      evidence:
        status.deploymentReadiness.summary.fail > 0
          ? `${status.deploymentReadiness.summary.fail} deployment readiness check(s) are failing.`
          : `${status.deploymentReadiness.summary.warn} deployment readiness warning(s) remain.`,
      href: "/api/admin/hosted-deployment-pack.html",
      label: "Hosted deployment",
      owner: "System Administrator / Technical Lead",
      status:
        status.deploymentReadiness.summary.fail > 0
          ? "blocked"
          : status.deploymentReadiness.summary.warn > 0
            ? "needs review"
            : "ready"
    },
    {
      evidence: status.moodleLaunchSimulator.statusMessage,
      href: "/moodle-preview",
      label: "Moodle launch rehearsal",
      owner: "LMS Administrator",
      status:
        status.moodleLaunchSimulator.summary.readyScenarios > 0
          ? "ready"
          : "needs review"
    }
  ];
}

function Metric({
  label,
  tone,
  value
}: {
  label: string;
  tone: GoLiveStatus;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-costaatt-navy">{value}</p>
      <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-bold ${toneClass(tone)}`}>
        {tone}
      </span>
    </div>
  );
}

function toneClass(status: GoLiveStatus | string) {
  if (status === "ready") {
    return "bg-emerald-100 text-emerald-800";
  }

  if (status === "blocked") {
    return "bg-red-100 text-red-800";
  }

  return "bg-amber-100 text-amber-800";
}
