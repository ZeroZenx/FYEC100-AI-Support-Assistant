import { PageShell } from "@/components/PageShell";
import { ReadinessLink, ReadinessRecord } from "@/components/ReadinessCards";
import { buildStudentReadinessLayer } from "@/lib/readinessLayers";

export default function StudentPilotWelcomePage() {
  const layer = buildStudentReadinessLayer();

  return (
    <PageShell
      eyebrow="Student Pilot"
      title="Welcome to the FYEC100 assistant pilot"
      description="A student-facing introduction to what the assistant can help with, what it cannot do, privacy-light pilot expectations, and where to get human support."
    >
      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <ReadinessLink href="/api/admin/student-readiness-pack.html" label="Open Student Readiness HTML Pack" />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <ReadinessRecord label="What it can help with" owner="FYEC100 pilot" status="ready" detail={layer.welcome.canHelp} />
        <ReadinessRecord label="What it cannot do" owner="Academic integrity" status="watch" detail={layer.welcome.cannotHelp} />
        <ReadinessRecord label="Privacy-light notice" owner="Pilot governance" status="watch" detail={layer.welcome.privacy} />
        <ReadinessRecord label="Human help" owner="Lecturer / LMS / IT" status="ready" detail={layer.welcome.humanHelp} />
      </section>
    </PageShell>
  );
}
