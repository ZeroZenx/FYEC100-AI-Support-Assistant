import { PageShell } from "@/components/PageShell";

const phases = [
  {
    title: "Phase 1: Rapid MVP prototype",
    status: "Built now",
    description:
      "Local Next.js app, chat UI, OpenAI API route, Markdown knowledge base, guardrails, academic integrity messaging, and GitHub-ready documentation."
  },
  {
    title: "Phase 2: Enterprise integrated deployment",
    status: "Started",
    description:
      "Moodle embedded assistant route, configurable OpenAI or Ollama provider support, institutional hosting planning, authentication planning, Banner-aware student services routing, analytics, privacy review, and production support processes."
  },
  {
    title: "Phase 3: Advanced AI learning ecosystem",
    status: "Future",
    description:
      "Personalized learning journeys, proactive nudges, richer learning analytics, multilingual support, and broader academic services integration."
  }
];

export default function RoadmapPage() {
  return (
    <PageShell
      eyebrow="Roadmap"
      title="Three-phase delivery path"
      description="The current build covers only Phase 1. Later phases can expand the assistant into an enterprise service after governance, integration, privacy, and support requirements are approved."
    >
      <div className="grid gap-5">
        {phases.map((phase) => (
          <article
            className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft"
            key={phase.title}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-costaatt-navy">
                  {phase.title}
                </h2>
                <p className="mt-3 leading-7 text-slate-700">
                  {phase.description}
                </p>
              </div>
              <span className="w-fit rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {phase.status}
              </span>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
