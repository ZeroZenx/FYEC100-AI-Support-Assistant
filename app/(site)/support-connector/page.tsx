import { SupportConnectorPanel } from "@/components/feature/SupportConnectorPanel";
import { PageShell } from "@/components/PageShell";

export default function SupportConnectorPage() {
  return (
    <PageShell
      eyebrow="Support Integration"
      title="Support connector integration"
      description="Prepare email, Teams, Forms, SharePoint List, or local-only support handoff connectors with safe payload boundaries."
    >
      <SupportConnectorPanel />
    </PageShell>
  );
}
