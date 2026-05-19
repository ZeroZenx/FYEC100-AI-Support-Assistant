import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { buildPilotDecisionPacket } from "@/lib/pilotDecisionPacket";

export default async function DecisionPacketPage() {
  const packet = await buildPilotDecisionPacket();
  const { status } = packet;

  return (
    <PageShell
      eyebrow="Pilot Decision Packet"
      title="Sponsor decision packet"
      description="A meeting-ready packet for the controlled FYEC100 Moodle pilot decision, with the headline recommendation, evidence, risks, sign-off ownership, and export link."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
          <div>
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${toneClass(status.pilotEvidence.goNoGo.status)}`}>
              {packet.decision}
            </span>
            <h2 className="mt-3 text-2xl font-bold text-costaatt-navy">
              {status.pilotEvidence.goNoGo.label}
            </h2>
            <p className="mt-2 leading-7 text-slate-700">
              {status.pilotEvidence.goNoGo.message}
            </p>
          </div>
          <Link
            className="self-start rounded-md bg-costaatt-blue px-4 py-3 text-center text-sm font-bold text-white hover:bg-costaatt-navy"
            href="/api/admin/pilot-decision-packet.html"
          >
            Open HTML Packet
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-3 md:grid-cols-6">
        <Metric label="Feedback" value={packet.summary.feedbackRecords} />
        <Metric label="Launches" value={packet.summary.launchRecords} />
        <Metric label="Support Queue" value={packet.summary.supportQueue} />
        <Metric label="Open Actions" value={packet.summary.actionItems} />
        <Metric label="Warnings" value={packet.summary.readinessWarnings} />
        <Metric label="Blockers" value={packet.blockers.length} />
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel title="Evidence Signals">
          {status.pilotEvidence.signals.map((signal) => (
            <Record
              key={signal.label}
              label={signal.label}
              meta={signal.owner}
              status={signal.status}
              text={signal.message}
            />
          ))}
        </Panel>
        <Panel title="Risks And Blockers">
          {packet.blockers.length > 0 ? (
            packet.blockers.map((blocker) => (
              <Record
                key={blocker}
                label="Review item"
                meta="Decision packet"
                status="blocked"
                text={blocker}
              />
            ))
          ) : (
            <Record
              label="No blocking items recorded"
              meta="Decision packet"
              status="ready"
              text="Continue reviewing warnings before wider pilot use."
            />
          )}
        </Panel>
      </section>
    </PageShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-costaatt-navy">{value}</p>
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

function toneClass(status: string) {
  if (/(go|ready|complete|approved|pass)/i.test(status)) {
    return "bg-emerald-100 text-emerald-800";
  }

  if (/(blocked|fail|hold|high)/i.test(status)) {
    return "bg-red-100 text-red-800";
  }

  return "bg-amber-100 text-amber-800";
}
