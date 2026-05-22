import { SupportHandoffCenter } from "@/components/feature/SupportHandoffCenter";
import { PageShell } from "@/components/PageShell";

export default function SupportHandoffCenterPage() {
  return (
    <PageShell
      eyebrow="Human Support"
      title="Support handoff center"
      description="Review real student escalation cases created from chat support buttons and route them to lecturer, LMS, IT, or knowledge base owners."
    >
      <SupportHandoffCenter />
    </PageShell>
  );
}
