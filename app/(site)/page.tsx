import Link from "next/link";

const capabilities = [
  {
    title: "Course-grounded guidance",
    body: "Answers use the approved FYEC100 knowledge base and identify the source section when helpful."
  },
  {
    title: "Moodle-ready experience",
    body: "The focused embed view keeps students inside Moodle while preserving course context."
  },
  {
    title: "Human support handoff",
    body: "Students can route course, LMS, and technical questions to the correct support owner."
  },
  {
    title: "Responsible AI boundaries",
    body: "The assistant supports learning but will not write full assignments, grade work, or replace lecturer guidance."
  }
];

export default function HomePage() {
  return (
    <div className="bg-white">
      <section className="border-b border-slate-200">
        <div className="mx-auto grid min-h-[calc(100vh-150px)] max-w-7xl items-center gap-12 px-5 py-12 lg:grid-cols-[1.08fr_0.92fr] lg:py-16">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-costaatt-teal">
              Controlled Moodle pilot platform
            </p>
            <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-costaatt-navy sm:text-6xl">
              FYEC100 AI Support Assistant
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
              Course-grounded academic support for COSTAATT first-year students,
              with Moodle delivery, responsible AI guardrails, and clear routes
              to human help.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="rounded-md bg-costaatt-blue px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-costaatt-navy"
                href="/chat"
              >
                Open Student Assistant
              </Link>
              <Link
                className="rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-costaatt-navy hover:border-costaatt-blue hover:text-costaatt-blue"
                href="/phase-2-command-center"
              >
                Open Staff Workspace
              </Link>
            </div>
            <p className="mt-5 max-w-xl text-sm leading-6 text-slate-600">
              The assistant provides guidance, not grades or completed
              submissions. Current deadlines and official submission links must
              always be confirmed in Moodle.
            </p>
          </div>

          <div className="border-l-4 border-costaatt-blue bg-slate-50 p-6 shadow-soft sm:p-8">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <p className="text-sm font-semibold text-costaatt-blue">
                  Pilot capability
                </p>
                <h2 className="mt-1 text-2xl font-bold text-costaatt-navy">
                  Built for student support
                </h2>
              </div>
              <span className="rounded-md bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                Phase 2
              </span>
            </div>
            <div className="divide-y divide-slate-200">
              {capabilities.map((item) => (
                <div className="py-4" key={item.title}>
                  <h3 className="font-semibold text-costaatt-navy">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-costaatt-navy">
              Need to understand the pilot?
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Review scope, safeguards, delivery phases, and institutional ownership.
            </p>
          </div>
          <div className="flex gap-3">
            <Link className="text-sm font-semibold text-costaatt-blue hover:underline" href="/about">
              About the assistant
            </Link>
            <Link className="text-sm font-semibold text-costaatt-blue hover:underline" href="/roadmap">
              View roadmap
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
