import { PilotArchiveBuilder } from "@/components/feature/PilotArchiveBuilder";
import { PageShell } from "@/components/PageShell";

export default function PilotArchiveBuilderPage() {
  return (
    <PageShell
      eyebrow="Pilot Evidence"
      title="Pilot archive builder"
      description="Generate a local export bundle containing pilot records, evidence files, counts, warnings, and checksums for governance or project review."
    >
      <PilotArchiveBuilder />
    </PageShell>
  );
}
