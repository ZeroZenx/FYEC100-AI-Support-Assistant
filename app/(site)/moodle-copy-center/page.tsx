import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { buildMoodleLaunchSimulator } from "@/lib/moodleLaunchSimulator";
import { buildMoodlePilotConfigPack } from "@/lib/moodlePilotConfig";

export default async function MoodleCopyCenterPage() {
  const [config, simulator] = await Promise.all([
    buildMoodlePilotConfigPack(),
    buildMoodleLaunchSimulator()
  ]);

  return (
    <PageShell
      eyebrow="Moodle Admin Copy Center"
      title="Moodle copy-ready snippets"
      description="Copy-ready iframe snippets, Moodle HTML block content, fallback links, test URLs, and role/context launch URLs for the FYEC100 Moodle pilot."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-3 md:grid-cols-3">
          <Detail label="Embed URL" value={config.embedUrl} />
          <Detail label="Moodle Origin" value={config.moodleOrigin ?? "Not configured"} />
          <Detail label="Recommended Path" value={config.integrationDecision.recommendedOption.label} />
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <Snippet title="Basic Iframe" value={config.snippets.iframe} />
        <Snippet title="Iframe With Pilot Context" value={config.snippets.iframeWithContext} />
        <Snippet title="Moodle HTML Block" value={config.snippets.moodleHtmlBlock} />
        <Snippet title="Fallback Link" value={config.snippets.fallbackLink} />
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-costaatt-navy">
          Role and Launch Test URLs
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {simulator.scenarioPreviews.map((scenario) => (
            <article
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              key={scenario.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="font-bold text-costaatt-navy">
                  {scenario.title}
                </h3>
                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">
                  {scenario.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {scenario.role} / {scenario.launchSource} /{" "}
                {scenario.moodlePlacement}
              </p>
              <pre className="mt-3 overflow-x-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100">
                <code>{scenario.previewUrl}</code>
              </pre>
              <Link
                className="mt-3 inline-flex rounded-md border border-costaatt-blue px-3 py-2 text-sm font-bold text-costaatt-blue hover:bg-blue-50"
                href={scenario.previewUrl}
              >
                Open Preview
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-xl font-bold text-costaatt-navy">Trust Boundary</h2>
        <p className="mt-2 leading-7 text-slate-700">{config.trustBoundary}</p>
      </section>
    </PageShell>
  );
}

function Snippet({ title, value }: { title: string; value: string }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <h2 className="text-xl font-bold text-costaatt-navy">{title}</h2>
      <pre className="mt-4 overflow-x-auto rounded-md bg-slate-900 p-4 text-xs text-slate-100">
        <code>{value}</code>
      </pre>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-bold text-costaatt-navy">
        {value}
      </p>
    </div>
  );
}
