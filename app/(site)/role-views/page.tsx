import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { getEnterpriseStatus } from "@/lib/enterpriseStatus";

type RoleKey = "developer" | "lms" | "project-lead" | "sponsor" | "system-admin";

const roleLabels: Record<RoleKey, string> = {
  developer: "Developer",
  lms: "LMS Administrator",
  "project-lead": "Project Lead",
  sponsor: "Project Sponsor",
  "system-admin": "System Administrator"
};

export default async function RoleViewsPage({
  searchParams
}: {
  searchParams?: Promise<{ role?: string | string[] }>;
}) {
  const status = await getEnterpriseStatus();
  const params = (await searchParams) ?? {};
  const role = normalizeRole(readParam(params.role));
  const view = buildRoleView(role, status);

  return (
    <PageShell
      eyebrow="Role-Based Admin Views"
      title={`${roleLabels[role]} view`}
      description="Focused pilot dashboards for each COSTAATT project role, so staff can see their decisions, risks, and next actions without scrolling through the full admin cockpit."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(roleLabels) as RoleKey[]).map((key) => (
            <Link
              className={`rounded-md px-4 py-2 text-sm font-bold ${
                key === role
                  ? "bg-costaatt-blue text-white"
                  : "border border-slate-200 bg-slate-50 text-costaatt-navy hover:border-costaatt-blue"
              }`}
              href={`/role-views?role=${key}`}
              key={key}
            >
              {roleLabels[key]}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-3 md:grid-cols-4">
          {view.metrics.map((metric) => (
            <Metric key={metric.label} {...metric} />
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <Panel title="Focus Areas">
          {view.focus.map((item) => (
            <Record key={item.label} {...item} />
          ))}
        </Panel>
        <Panel title="Role Actions">
          {view.actions.length > 0 ? (
            view.actions.map((item) => <Record key={item.label} {...item} />)
          ) : (
            <p className="text-sm leading-6 text-slate-700">
              No open actions are currently assigned to this role.
            </p>
          )}
        </Panel>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-costaatt-navy">Helpful Links</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {view.links.map((link) => (
            <Link
              className="rounded-md border border-costaatt-blue px-4 py-2 text-sm font-bold text-costaatt-blue hover:bg-blue-50"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

function buildRoleView(
  role: RoleKey,
  status: Awaited<ReturnType<typeof getEnterpriseStatus>>
) {
  const actionMatches = roleActionTerms[role];
  const actions = status.adminActions.openActions
    .filter((action) =>
      actionMatches.some((term) =>
        `${action.owner} ${action.source} ${action.title}`.toLowerCase().includes(term)
      )
    )
    .map((action) => ({
      label: `${action.id}: ${action.title}`,
      meta: `${action.owner} / ${action.dueDate || "No due date"}`,
      status: action.status,
      text: action.notes
    }));

  const common = {
    actions,
    metrics: [
      {
        label: "Go / No-Go",
        status: status.pilotEvidence.goNoGo.status,
        value: status.pilotEvidence.goNoGo.status.toUpperCase()
      },
      {
        label: "Open Actions",
        status: status.adminActions.summary.blocked > 0 ? "blocked" : "watch",
        value: status.adminActions.openActions.length
      }
    ]
  };

  if (role === "sponsor") {
    return {
      ...common,
      focus: [
        {
          label: "Pilot decision",
          meta: "Sponsor review",
          status: status.pilotEvidence.goNoGo.status,
          text: status.pilotEvidence.goNoGo.message
        },
        {
          label: "Sign-off",
          meta: "Project team approval",
          status: status.pilotSignoff.record.decisionStatus,
          text: status.pilotSignoff.statusMessage
        },
        {
          label: "Top risk",
          meta: "Action register",
          status: status.adminActions.summary.highPriorityOpen > 0 ? "high" : "ready",
          text:
            status.adminActions.highPriorityOpen[0]?.title ??
            "No high-priority open action is recorded."
        }
      ],
      links: [
        { href: "/go-live", label: "Go-Live Dashboard" },
        { href: "/api/admin/pilot-decision-packet.html", label: "Decision Packet" },
        { href: "/api/admin/pilot-evidence.html", label: "Pilot Evidence" }
      ],
      metrics: [
        ...common.metrics,
        {
          label: "Support Queue",
          status: status.supportTriage.summary.highPriority > 0 ? "blocked" : "ready",
          value: status.supportTriage.summary.activeQueue
        },
        {
          label: "Sign-Off",
          status: status.pilotSignoff.approvedForControlledPilot ? "ready" : "watch",
          value: status.pilotSignoff.record.decisionStatus
        }
      ]
    };
  }

  if (role === "project-lead") {
    return {
      ...common,
      focus: [
        {
          label: "Action register",
          meta: "Open owner follow-up",
          status: status.adminActions.summary.blocked > 0 ? "blocked" : "watch",
          text: `${status.adminActions.openActions.length} open action(s), ${status.adminActions.summary.highPriorityOpen} high-priority.`
        },
        {
          label: "Pilot sessions",
          meta: status.pilotSessions.path,
          status: status.pilotSessions.nextSession?.status ?? "ready",
          text: status.pilotSessions.nextSession
            ? `${status.pilotSessions.nextSession.title} is next.`
            : "All pilot sessions are marked complete."
        },
        {
          label: "Support triage",
          meta: "Pilot review team",
          status: status.supportTriage.status,
          text: status.supportTriage.statusMessage
        }
      ],
      links: [
        { href: "/pilot-sessions", label: "Session Console" },
        { href: "/feedback-inbox", label: "Feedback Inbox" },
        { href: "/admin", label: "Admin Cockpit" }
      ],
      metrics: [
        ...common.metrics,
        { label: "Sessions", status: "planned", value: status.pilotSessions.total },
        {
          label: "Feedback",
          status: status.feedback.total > 0 ? "ready" : "watch",
          value: status.feedback.total
        }
      ]
    };
  }

  if (role === "lms") {
    return {
      ...common,
      focus: [
        {
          label: "Moodle origin",
          meta: "Iframe security",
          status: status.moodleSecurityHardening.moodleOrigin ? "ready" : "watch",
          text:
            status.moodleSecurityHardening.moodleOrigin ??
            "MOODLE_ORIGIN is not configured locally."
        },
        {
          label: "Launch rehearsal",
          meta: "Preview studio",
          status: status.moodleLaunchSimulator.summary.watchChecks > 0 ? "watch" : "ready",
          text: status.moodleLaunchSimulator.statusMessage
        },
        {
          label: "Launch audit",
          meta: "Moodle telemetry",
          status: status.launchAudit.total > 0 ? "ready" : "watch",
          text: `${status.launchAudit.total} launch audit record(s) captured.`
        }
      ],
      links: [
        { href: "/moodle-preview", label: "Preview Studio" },
        { href: "/api/admin/moodle-security-hardening.html", label: "Security Report" },
        { href: "/api/admin/moodle-launch-simulator.md", label: "Simulator Export" }
      ],
      metrics: [
        ...common.metrics,
        {
          label: "Launches",
          status: status.launchAudit.total > 0 ? "ready" : "watch",
          value: status.launchAudit.total
        },
        {
          label: "Simulator Checks",
          status: status.moodleLaunchSimulator.summary.watchChecks > 0 ? "watch" : "ready",
          value: status.moodleLaunchSimulator.summary.watchChecks
        }
      ]
    };
  }

  if (role === "developer") {
    return {
      ...common,
      focus: [
        {
          label: "AI provider",
          meta: status.providerStatus.provider,
          status: status.providerConfigured ? "ready" : "watch",
          text: status.providerLabel
        },
        {
          label: "Knowledge base workflow",
          meta: "Content governance",
          status: status.knowledgeBase.changeRequests.summary.pending > 0 ? "watch" : "ready",
          text: `${status.knowledgeBase.changeRequests.summary.pending} change request(s) pending review.`
        },
        {
          label: "Smoke readiness",
          meta: "Local validation",
          status: status.deploymentReadiness.summary.fail > 0 ? "blocked" : "ready",
          text: `${status.deploymentReadiness.summary.fail} failed check(s), ${status.deploymentReadiness.summary.warn} warning(s).`
        }
      ],
      links: [
        { href: "/knowledge-base-review", label: "KB Workspace" },
        { href: "/production-hardening", label: "Hardening Dashboard" },
        { href: "/api/admin/status", label: "Admin Status JSON" }
      ],
      metrics: [
        ...common.metrics,
        {
          label: "Provider",
          status: status.providerConfigured ? "ready" : "watch",
          value: status.providerStatus.provider
        },
        {
          label: "KB Requests",
          status: status.knowledgeBase.changeRequests.summary.pending > 0 ? "watch" : "ready",
          value: status.knowledgeBase.changeRequests.summary.pending
        }
      ]
    };
  }

  return {
    ...common,
    focus: [
      {
        label: "Hosted deployment",
        meta: "IT readiness",
        status: status.hostedDeploymentPack.summary.readinessFailures > 0 ? "blocked" : "watch",
        text: status.hostedDeploymentPack.statusMessage
      },
      {
        label: "Admin protection",
        meta: "ADMIN_ACCESS_TOKEN",
        status: status.adminAuth.configured ? "ready" : "watch",
        text: status.adminAuth.configured
          ? "Admin token gate is configured."
          : "Admin token is not configured locally."
      },
      {
        label: "Rate limits",
        meta: "Pilot API controls",
        status: "ready",
        text: `Chat ${status.deploymentReadiness.rateLimits.chatPerMinute}/min, feedback ${status.deploymentReadiness.rateLimits.feedbackPerMinute}/min.`
      }
    ],
    links: [
      { href: "/production-hardening", label: "Hardening Dashboard" },
      { href: "/api/admin/hosted-deployment-pack.html", label: "Hosted Deployment Report" },
      { href: "/api/admin/deployment-readiness", label: "Readiness JSON" }
    ],
    metrics: [
      ...common.metrics,
      {
        label: "Readiness Fails",
        status: status.deploymentReadiness.summary.fail > 0 ? "blocked" : "ready",
        value: status.deploymentReadiness.summary.fail
      },
      {
        label: "Admin Token",
        status: status.adminAuth.configured ? "ready" : "watch",
        value: status.adminAuth.configured ? "set" : "local"
      }
    ]
  };
}

const roleActionTerms: Record<RoleKey, string[]> = {
  developer: ["developer", "technical", "knowledge base"],
  lms: ["lms", "moodle"],
  "project-lead": ["project lead", "pilot review", "facilitator"],
  sponsor: ["sponsor", "governance"],
  "system-admin": ["system administrator", "hosting", "admin token", "deployment"]
};

function Metric({
  label,
  status,
  value
}: {
  label: string;
  status: string;
  value: number | string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-costaatt-navy">{value}</p>
      <Badge status={status} />
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
        <Badge status={status} />
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-500">{meta}</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{text}</p>
    </article>
  );
}

function Badge({ status }: { status: string }) {
  return (
    <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-bold ${toneClass(status)}`}>
      {status}
    </span>
  );
}

function normalizeRole(value: string): RoleKey {
  const roles = Object.keys(roleLabels) as RoleKey[];

  return roles.includes(value as RoleKey) ? (value as RoleKey) : "sponsor";
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function toneClass(status: string) {
  if (/(go|ready|complete|approved|pass|set)/i.test(status)) {
    return "bg-emerald-100 text-emerald-800";
  }

  if (/(blocked|fail|high|hold)/i.test(status)) {
    return "bg-red-100 text-red-800";
  }

  return "bg-amber-100 text-amber-800";
}
