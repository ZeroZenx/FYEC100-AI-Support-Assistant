import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { buildMoodleLaunchPack } from "@/lib/phaseImplementationPacks";

export default async function MoodleLaunchPackPage() {
  const pack = await buildMoodleLaunchPack();

  return (
    <PageShell
      eyebrow="Phase 2"
      title="Moodle pilot launch pack"
      description="Course placement guidance, student checklist, lecturer and LMS testing scripts, and launch communications for the FYEC100 Moodle pilot."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex flex-wrap gap-2">
          <LinkButton href="/api/admin/moodle-launch-pack.html" label="Open HTML Pack" />
          <LinkButton href="/moodle-copy-center" label="Moodle Copy Center" />
          <LinkButton href="/moodle-preview" label="Preview Studio" />
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel title="Course Placement Guide">
          {pack.placementGuide.map((item) => (
            <Record key={item.label} {...item} />
          ))}
        </Panel>
        <Panel title="Testing Scripts">
          {pack.testingScripts.map((item) => (
            <Record key={item.label} {...item} />
          ))}
        </Panel>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-costaatt-navy">
          Student Pilot Experience Checklist
        </h2>
        <ul className="mt-4 grid gap-2 text-sm leading-6 text-slate-700 md:grid-cols-2">
          {pack.studentChecklist.map((item) => (
            <li className="rounded-md border border-slate-200 bg-slate-50 p-3" key={item}>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-costaatt-navy">
          Launch Communications
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {pack.communications.map((item) => (
            <article
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              key={item.audience}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-costaatt-teal">
                {item.audience}
              </p>
              <h3 className="mt-2 font-bold text-costaatt-navy">
                {item.subject}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

function Panel({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <h2 className="mb-4 text-xl font-bold text-costaatt-navy">{title}</h2>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function Record({
  detail,
  label,
  owner,
  status
}: {
  detail: string;
  label: string;
  owner: string;
  status: string;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-bold text-costaatt-navy">{label}</h3>
        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">
          {status}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-500">{owner}</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{detail}</p>
    </article>
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
