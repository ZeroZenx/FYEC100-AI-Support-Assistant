import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { buildMoodleLaunchSimulator } from "@/lib/moodleLaunchSimulator";

export default async function MoodlePreviewStudioPage({
  searchParams
}: {
  searchParams?: Promise<{ scenario?: string | string[] }>;
}) {
  const simulator = await buildMoodleLaunchSimulator();
  const params = (await searchParams) ?? {};
  const selectedId = readParam(params.scenario) || simulator.scenarioPreviews[0]?.id;
  const selectedScenario =
    simulator.scenarioPreviews.find((scenario) => scenario.id === selectedId) ??
    simulator.scenarioPreviews[0];

  return (
    <PageShell
      eyebrow="Moodle Embed Preview Studio"
      title="Moodle launch rehearsal"
      description="A visual test studio where LMS and project staff can preview the assistant as student, lecturer, LMS administrator, iframe, Moodle block, or future LTI launch before changing Moodle."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-3 md:grid-cols-5">
          <Metric label="Scenarios" value={simulator.summary.scenarios} />
          <Metric label="Ready" value={simulator.summary.readyScenarios} />
          <Metric label="Planned" value={simulator.summary.plannedScenarios} />
          <Metric label="Ready Checks" value={simulator.summary.readyChecks} />
          <Metric label="Watch Checks" value={simulator.summary.watchChecks} />
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-700">
          {simulator.statusMessage}
        </p>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[340px_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
          <h2 className="text-lg font-bold text-costaatt-navy">Scenarios</h2>
          <div className="mt-4 grid gap-3">
            {simulator.scenarioPreviews.map((scenario) => (
              <Link
                className={`rounded-lg border p-4 text-left ${
                  selectedScenario?.id === scenario.id
                    ? "border-costaatt-blue bg-blue-50"
                    : "border-slate-200 bg-slate-50 hover:border-costaatt-blue"
                }`}
                href={`/moodle-preview?scenario=${encodeURIComponent(scenario.id)}`}
                key={scenario.id}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-costaatt-navy">
                    {scenario.title}
                  </h3>
                  <Badge status={scenario.status} />
                </div>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {scenario.role} / {scenario.launchSource}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {scenario.moodlePlacement}
                </p>
              </Link>
            ))}
          </div>
        </aside>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          {selectedScenario ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-costaatt-teal">
                    {selectedScenario.id}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-costaatt-navy">
                    {selectedScenario.title}
                  </h2>
                  <p className="mt-2 leading-7 text-slate-700">
                    {selectedScenario.expectedBehavior}
                  </p>
                </div>
                <Link
                  className="rounded-md bg-costaatt-blue px-4 py-2 text-sm font-bold text-white hover:bg-costaatt-navy"
                  href={selectedScenario.previewUrl}
                >
                  Open Full Preview
                </Link>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-4">
                <Detail label="Role" value={selectedScenario.role} />
                <Detail label="Launch source" value={selectedScenario.launchSource} />
                <Detail label="Placement" value={selectedScenario.moodlePlacement} />
                <Detail label="Course page" value={selectedScenario.coursePage} />
              </div>

              <div className="mt-5 overflow-hidden rounded-lg border border-slate-300 bg-slate-100">
                <iframe
                  className="h-[760px] w-full bg-white"
                  src={selectedScenario.previewUrl}
                  title={`Preview ${selectedScenario.title}`}
                />
              </div>

              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-costaatt-navy">
                  Moodle iframe snippet
                </p>
                <pre className="mt-3 overflow-x-auto rounded-md bg-slate-900 p-4 text-xs text-slate-100">
                  <code>{selectedScenario.iframeSnippet}</code>
                </pre>
              </div>
            </>
          ) : (
            <p className="text-slate-700">No Moodle preview scenarios are configured.</p>
          )}
        </section>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-costaatt-navy">Required Checks</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {simulator.record.requiredChecks.map((check) => (
            <article
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              key={check.id}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-costaatt-navy">
                  {check.id}: {check.label}
                </h3>
                <Badge status={check.status} />
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                {check.owner}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {check.evidence}
              </p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
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

function Badge({ status }: { status: string }) {
  const tone = /(ready|pass)/i.test(status)
    ? "bg-emerald-100 text-emerald-800"
    : /(planned|watch)/i.test(status)
      ? "bg-amber-100 text-amber-800"
      : "bg-slate-100 text-slate-700";

  return <span className={`rounded-full px-2 py-1 text-xs font-bold ${tone}`}>{status}</span>;
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
