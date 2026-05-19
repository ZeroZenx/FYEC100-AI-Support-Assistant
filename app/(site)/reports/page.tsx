import Link from "next/link";
import { PageShell } from "@/components/PageShell";

type ReportItem = {
  category: string;
  description: string;
  htmlPath?: string;
  markdownPath: string;
  owner: string;
  title: string;
};

const featuredReport = {
  description:
    "The best starting point for human review. It combines executive status, pilot mode, Moodle security, support triage, cleanup guidance, and a technical system flow diagram in one readable HTML packet.",
  htmlPath: "/api/admin/pilot-export-bundle.html",
  markdownPath: "/api/admin/pilot-export-bundle.md",
  title: "FYEC100 Pilot Export Bundle"
};

const reportGroups: Array<{ description: string; reports: ReportItem[]; title: string }> = [
  {
    title: "Staff Workspaces",
    description:
      "Interactive pages for people running the pilot, reviewing content, and rehearsing Moodle launch behavior.",
    reports: [
      {
        category: "Staff Workspaces",
        description:
          "Review FYEC100 sections, change requests, draft updates, apply checklist, and release notes in one readable workspace.",
        htmlPath: "/knowledge-base-review",
        markdownPath: "/api/admin/knowledge-base/review.md",
        owner: "Lecturer / Developer",
        title: "Knowledge Base Review Workspace"
      },
      {
        category: "Staff Workspaces",
        description:
          "Filter pilot feedback by category, owner, priority, mode, and escalation type for support follow-up.",
        htmlPath: "/feedback-inbox",
        markdownPath: "/api/admin/support-triage.md",
        owner: "Pilot Review Team",
        title: "Pilot Feedback Inbox"
      },
      {
        category: "Staff Workspaces",
        description:
          "Preview the assistant as different Moodle roles and launch modes before touching the Moodle course shell.",
        htmlPath: "/moodle-preview",
        markdownPath: "/api/admin/moodle-launch-simulator.md",
        owner: "LMS Administrator / Developer",
        title: "Moodle Embed Preview Studio"
      },
      {
        category: "Staff Workspaces",
        description:
          "One-page ready, needs-review, and blocked dashboard for the exact items COSTAATT must confirm before pilot go-live.",
        htmlPath: "/go-live",
        markdownPath: "/api/admin/pilot-evidence.md",
        owner: "Project Sponsor / Project Lead",
        title: "Pre-Pilot Go-Live Dashboard"
      }
    ]
  },
  {
    title: "Executive Review",
    description: "Sponsor and project-team material for go/no-go discussions.",
    reports: [
      {
        category: "Executive Review",
        description:
          "Evidence signals, readiness summary, feedback totals, and recommended actions for the controlled pilot decision.",
        htmlPath: "/api/admin/pilot-evidence.html",
        markdownPath: "/api/admin/pilot-evidence.md",
        owner: "Project Sponsor / Project Lead",
        title: "Pilot Evidence Dashboard"
      },
      {
        category: "Executive Review",
        description:
          "Meeting-ready briefing notes covering blockers, decisions, sign-off, integration recommendation, and privacy notice.",
        markdownPath: "/api/admin/pilot-meeting-pack.md",
        owner: "Project Lead",
        title: "Pilot Meeting Pack"
      },
      {
        category: "Executive Review",
        description:
          "Approval owner status and controlled-pilot sign-off summary before expanding access.",
        markdownPath: "/api/admin/pilot-signoff.md",
        owner: "Project Sponsor / Project Team",
        title: "Pilot Sign-off Pack"
      }
    ]
  },
  {
    title: "Moodle Readiness",
    description: "Reports for LMS setup, iframe security, launch testing, and integration planning.",
    reports: [
      {
        category: "Moodle Readiness",
        description:
          "Moodle origin, frame-ancestors expectations, rebuild requirements, and iframe trust-boundary checks.",
        htmlPath: "/api/admin/moodle-security-hardening.html",
        markdownPath: "/api/admin/moodle-security-hardening.md",
        owner: "Technical Lead / LMS Administrator",
        title: "Moodle Security Hardening"
      },
      {
        category: "Moodle Readiness",
        description:
          "LMS-ready embed snippets, pilot setup steps, and Moodle course-shell configuration guidance.",
        markdownPath: "/api/admin/moodle-pilot-config.md",
        owner: "LMS Administrator",
        title: "Moodle Pilot Configuration"
      },
      {
        category: "Moodle Readiness",
        description:
          "Scenario preview URLs for student, lecturer, LMS administrator, iframe, block, and future LTI testing.",
        markdownPath: "/api/admin/moodle-launch-simulator.md",
        owner: "LMS Administrator / Developer",
        title: "Moodle Launch Simulator"
      }
    ]
  },
  {
    title: "Support Operations",
    description: "Operational reports for support routing, sessions, analytics, and cleanup.",
    reports: [
      {
        category: "Support Operations",
        description:
          "Privacy-light queue that routes feedback to lecturer, LMS, IT, knowledge base, or academic integrity owners.",
        htmlPath: "/api/admin/support-triage.html",
        markdownPath: "/api/admin/support-triage.md",
        owner: "Pilot Review Team",
        title: "Student Support Triage"
      },
      {
        category: "Support Operations",
        description:
          "Aggregate launch, role/source, feedback, and escalation signals for controlled pilot review.",
        markdownPath: "/api/admin/pilot-analytics.md",
        owner: "Project Lead / LMS Administrator",
        title: "Pilot Analytics Summary"
      },
      {
        category: "Support Operations",
        description:
          "Preview and guarded reset guidance for local demo feedback and Moodle launch telemetry.",
        markdownPath: "/api/admin/pilot-data-cleanup.md",
        owner: "Technical Lead / Project Lead",
        title: "Pilot Data Cleanup"
      },
      {
        category: "Support Operations",
        description:
          "Before, during, after, escalation, incident response, and stop-pilot operating procedures.",
        markdownPath: "/api/admin/pilot-operations-runbook.md",
        owner: "Project Lead / LMS Administrator",
        title: "Pilot Operations Runbook"
      }
    ]
  },
  {
    title: "Technical Deployment",
    description: "Reports for hosting, environment variables, protection, and deployment review.",
    reports: [
      {
        category: "Technical Deployment",
        description:
          "Hosted URL, HTTPS, provider, admin protection, rate limit, storage, and production caveat checks.",
        htmlPath: "/api/admin/hosted-deployment-pack.html",
        markdownPath: "/api/admin/hosted-deployment-pack.md",
        owner: "Technical Lead / System Administrator",
        title: "Hosted Deployment Readiness"
      },
      {
        category: "Technical Deployment",
        description:
          "Required Moodle LTI values, placeholder launch endpoints, and remaining LTI trust-boundary work.",
        markdownPath: "/api/admin/lti-readiness.md",
        owner: "Technical Lead",
        title: "LTI Readiness Scaffold"
      },
      {
        category: "Technical Deployment",
        description:
          "Open follow-up items by owner, priority, source, due date, and project-team action status.",
        markdownPath: "/api/admin/actions.md",
        owner: "Project Lead",
        title: "Admin Action Register"
      }
    ]
  },
  {
    title: "Knowledge Base Governance",
    description: "Reports for controlled FYEC100 content review and approved updates.",
    reports: [
      {
        category: "Knowledge Base Governance",
        description:
          "Lecturer/content-owner review status, current knowledge base metadata, and pilot readiness.",
        markdownPath: "/api/admin/knowledge-base/review.md",
        owner: "Lecturer / Content Owner",
        title: "Knowledge Base Review"
      },
      {
        category: "Knowledge Base Governance",
        description:
          "Proposed FYEC100 content changes awaiting review before the live Markdown file is edited.",
        markdownPath: "/api/admin/knowledge-base/change-requests.md",
        owner: "Developer / Lecturer Reviewer",
        title: "Knowledge Base Change Requests"
      },
      {
        category: "Knowledge Base Governance",
        description:
          "Manual review, edit, guardrail, smoke-test, and release-note steps for applying approved changes.",
        markdownPath: "/api/admin/knowledge-base/apply-checklist.md",
        owner: "Developer / Lecturer Reviewer",
        title: "Knowledge Base Apply Checklist"
      }
    ]
  }
];

export default function ReportsPage() {
  return (
    <PageShell
      eyebrow="Report Library"
      title="Human-readable pilot reports"
      description="Open the main HTML bundle first for meetings, then use the source reports when the project team needs supporting detail."
    >
      <section className="rounded-lg border border-costaatt-blue bg-white p-6 shadow-soft">
        <div className="grid gap-5 lg:grid-cols-[1fr_280px] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-costaatt-teal">
              Recommended first
            </p>
            <h2 className="mt-2 text-2xl font-bold text-costaatt-navy">
              {featuredReport.title}
            </h2>
            <p className="mt-3 leading-7 text-slate-700">
              {featuredReport.description}
            </p>
          </div>
          <div className="grid gap-3">
            <ReportButton href={featuredReport.htmlPath} label="Open HTML report" primary />
            <ReportButton href={featuredReport.markdownPath} label="Open Markdown source" />
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-5">
        {reportGroups.map((group) => (
          <section
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft"
            key={group.title}
          >
            <div className="mb-5 max-w-3xl">
              <h2 className="text-xl font-bold text-costaatt-navy">
                {group.title}
              </h2>
              <p className="mt-2 leading-7 text-slate-700">{group.description}</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {group.reports.map((report) => (
                <article
                  className="flex min-h-full flex-col rounded-lg border border-slate-200 bg-slate-50 p-4"
                  key={report.title}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-costaatt-teal">
                    {report.category}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-costaatt-navy">
                    {report.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {report.description}
                  </p>
                  <p className="mt-3 text-xs font-semibold text-slate-500">
                    Owner: {report.owner}
                  </p>
                  <div className="mt-auto grid gap-2 pt-4">
                    {report.htmlPath ? (
                      <ReportButton href={report.htmlPath} label="Open HTML" primary />
                    ) : null}
                    <ReportButton
                      href={report.markdownPath}
                      label={report.htmlPath ? "Open Markdown" : "Open report"}
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}

function ReportButton({
  href,
  label,
  primary = false
}: {
  href: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      className={
        primary
          ? "rounded-md bg-costaatt-blue px-4 py-3 text-center text-sm font-bold text-white hover:bg-costaatt-navy"
          : "rounded-md border border-slate-300 bg-white px-4 py-3 text-center text-sm font-bold text-costaatt-navy hover:border-costaatt-blue"
      }
      href={href}
    >
      {label}
    </Link>
  );
}
