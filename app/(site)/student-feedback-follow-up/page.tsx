import { PageShell } from "@/components/PageShell";
import { ReadinessList } from "@/components/ReadinessCards";
import { buildStudentReadinessLayer } from "@/lib/readinessLayers";

export default function StudentFeedbackFollowUpPage() {
  const layer = buildStudentReadinessLayer();

  return (
    <PageShell
      eyebrow="Student Pilot"
      title="What happens after feedback"
      description="A non-admin explanation of how pilot feedback is used and who reviews LMS issues, course content gaps, technical issues, and academic integrity concerns."
    >
      <ReadinessList title="Feedback Follow-Up" items={layer.feedbackFollowUp} />
    </PageShell>
  );
}
