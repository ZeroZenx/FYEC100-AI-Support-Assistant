import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { readPilotSessionSummary } from "@/lib/pilotSessions";

export default async function PilotSessionConsolePage() {
  const sessions = await readPilotSessionSummary();

  return (
    <PageShell
      eyebrow="Pilot Session Console"
      title="FYEC100 pilot sessions"
      description="A working console for planning Moodle dry runs and controlled student pilot sessions, with goals, pre-checks, success criteria, and post-session review steps."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-3 md:grid-cols-5">
          <Metric label="Total" value={sessions.total} />
          <Metric label="Planned" value={sessions.statusCounts.planned} />
          <Metric label="Not Started" value={sessions.statusCounts["not-started"]} />
          <Metric label="In Progress" value={sessions.statusCounts["in-progress"]} />
          <Metric label="Complete" value={sessions.statusCounts.complete} />
        </div>
      </section>

      <section className="mt-6 grid gap-5">
        {sessions.sessions.map((session) => (
          <article
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft"
            key={session.id}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-costaatt-teal">
                  {session.id}
                </p>
                <h2 className="mt-1 text-2xl font-bold text-costaatt-navy">
                  {session.title}
                </h2>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  {session.audience} / {session.mode} / {session.date}
                </p>
              </div>
              <Badge status={session.status} />
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-4">
              <ListBlock title="Goals" items={session.goals} />
              <ListBlock title="Pre-Checks" items={session.preChecks} />
              <ListBlock title="Success Criteria" items={session.successCriteria} />
              <ListBlock title="Post-Checks" items={session.postChecks} />
            </div>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-costaatt-navy">Session Tools</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <LinkButton href="/moodle-preview" label="Open Moodle Preview" />
          <LinkButton href="/feedback-inbox" label="Open Feedback Inbox" />
          <LinkButton href="/api/admin/pilot-meeting-pack.md" label="Meeting Pack" />
          <LinkButton href="/api/admin/pilot-operations-runbook.md" label="Operations Runbook" />
        </div>
      </section>
    </PageShell>
  );
}

function ListBlock({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-bold text-costaatt-navy">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-costaatt-navy">{value}</p>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-bold ${toneClass(status)}`}>
      {status}
    </span>
  );
}

function LinkButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      className="rounded-md border border-costaatt-blue px-4 py-2 text-sm font-bold text-costaatt-blue hover:bg-blue-50"
      href={href}
    >
      {label}
    </Link>
  );
}

function toneClass(status: string) {
  if (/(complete|ready)/i.test(status)) {
    return "bg-emerald-100 text-emerald-800";
  }

  if (/(in-progress|planned)/i.test(status)) {
    return "bg-amber-100 text-amber-800";
  }

  return "bg-slate-100 text-slate-700";
}
