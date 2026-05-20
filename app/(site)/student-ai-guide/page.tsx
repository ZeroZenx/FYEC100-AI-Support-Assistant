import { PageShell } from "@/components/PageShell";
import { ReadinessList } from "@/components/ReadinessCards";
import { buildStudentReadinessLayer } from "@/lib/readinessLayers";

export default function StudentAiGuidePage() {
  const layer = buildStudentReadinessLayer();

  return (
    <PageShell
      eyebrow="Student Pilot"
      title="Responsible AI guide"
      description="FYEC100-friendly guidance on acceptable use, unacceptable use, good prompts, assignment boundaries, and when to check with the lecturer."
    >
      <ReadinessList title="Responsible AI Guidance" items={layer.responsibleAi} />
    </PageShell>
  );
}
