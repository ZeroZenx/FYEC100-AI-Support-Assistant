import Link from "next/link";
import { cookies } from "next/headers";
import { PageShell } from "@/components/PageShell";
import { ActionPanel, MetricTile, PrimaryAction } from "@/components/ui/System";
import { getAdminSessionCookieName, inspectAdminSessionToken } from "@/lib/adminSession";

const roleTargets: Record<string, { href: string; label: string }> = {
  developer: { href: "/developer-command-center", label: "Developer command center" },
  governance: { href: "/governance-command-center", label: "Governance command center" },
  "it-system-admin": { href: "/it-command-center", label: "IT command center" },
  lecturer: { href: "/lecturer-command-center", label: "Lecturer command center" },
  "lms-admin": { href: "/lms-admin-command-center", label: "LMS admin command center" },
  "project-lead": { href: "/project-lead-command-center", label: "Project lead command center" },
  sponsor: { href: "/sponsor-command-center", label: "Sponsor command center" }
};

const workflowLinks = [
  { href: "/phase-2-command-center", label: "Phase 2 command center" },
  { href: "/phase-2-gate-wizard", label: "Phase 2 gate wizard" },
  { href: "/pilot-archive-builder", label: "Pilot archive builder" },
  { href: "/launch-checklist-execution", label: "Launch checklist execution" },
  { href: "/provider-console", label: "Provider testing console" },
  { href: "/moodle-embed-generator", label: "Moodle embed generator" },
  { href: "/course-config-manager", label: "Course configuration manager" },
  { href: "/course-routing-test", label: "Course routing test" }
];

export default async function AdminHomePage() {
  const cookieStore = await cookies();
  const session = inspectAdminSessionToken(cookieStore.get(getAdminSessionCookieName())?.value);
  const roleTarget = roleTargets[session.role || "project-lead"];

  return (
    <PageShell
      eyebrow="Role-Aware Admin"
      title="Admin home"
      description="A task-first starting point for pilot staff. Use the command center first, then open focused tools when work needs to be done."
      actions={<PrimaryAction href="/phase-2-command-center">Open Phase 2 command center</PrimaryAction>}
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile label="Session" value={session.active ? "Active" : "Not active"} />
          <MetricTile label="Role" value={session.role || "Not set"} />
          <MetricTile label="Expires" value={session.expiresAt ? new Date(session.expiresAt).toLocaleString() : "N/A"} />
        </div>
        {!session.active ? (
          <Link className="mt-5 inline-flex rounded-md bg-costaatt-navy px-4 py-2 text-sm font-bold text-white" href="/admin-login">
            Sign in
          </Link>
        ) : (
          <Link className="mt-5 inline-flex rounded-md bg-costaatt-blue px-4 py-2 text-sm font-bold text-white" href={roleTarget.href}>
            Open {roleTarget.label}
          </Link>
        )}
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workflowLinks.map((link) => (
          <ActionPanel
            actionHref={link.href}
            actionLabel="Open"
            description="Focused Phase 2 workflow area."
            key={link.href}
            title={link.label}
          />
        ))}
      </section>
    </PageShell>
  );
}
