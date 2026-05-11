import Link from "next/link";

const highlights = [
  "Answers FYEC100 course questions from a local knowledge base",
  "Supports assignment understanding without writing student submissions",
  "Provides study tips, LMS guidance, and academic integrity reminders"
];

export default function HomePage() {
  return (
    <section className="bg-white">
      <div className="mx-auto grid min-h-[calc(100vh-160px)] max-w-6xl items-center gap-10 px-5 py-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-costaatt-teal">
            Phase 1 Local Prototype
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-costaatt-navy sm:text-6xl">
            FYEC100 AI Support Assistant
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
            A clean local MVP for helping first-year students understand FYEC100
            expectations, assignments, study habits, LMS navigation, and
            academic integrity.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="rounded-md bg-costaatt-blue px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-costaatt-navy"
              href="/chat"
            >
              Open Chat Assistant
            </Link>
            <Link
              className="rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-costaatt-navy hover:border-costaatt-blue hover:text-costaatt-blue"
              href="/roadmap"
            >
              View Roadmap
            </Link>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-soft">
          <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <p className="text-sm font-semibold text-costaatt-blue">
                Student Support Preview
              </p>
              <p className="text-sm text-slate-500">FYEC100 course guidance</p>
            </div>
            <span className="rounded-md bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              Local MVP
            </span>
          </div>
          <div className="space-y-4">
            {highlights.map((item) => (
              <div
                className="rounded-md border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700"
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-600">
            Phase 1 uses a Markdown knowledge base and OpenAI API route. No
            database, authentication, Moodle, or Banner integration is included.
          </p>
        </div>
      </div>
    </section>
  );
}
