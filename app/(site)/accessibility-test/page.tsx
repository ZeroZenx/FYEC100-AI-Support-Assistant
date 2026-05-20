import { PageShell } from "@/components/PageShell";
import { ReadinessList } from "@/components/ReadinessCards";
import { buildStudentReadinessLayer } from "@/lib/readinessLayers";

export default function AccessibilityTestPage() {
  const layer = buildStudentReadinessLayer();

  return (
    <PageShell
      eyebrow="Student Pilot"
      title="Accessibility and usability test"
      description="A student-facing test surface for keyboard navigation, readable text, contrast, iframe sizing, mobile view, and finding human help."
    >
      <ReadinessList title="Student Test Checklist" items={layer.accessibilityChecks} />
    </PageShell>
  );
}
