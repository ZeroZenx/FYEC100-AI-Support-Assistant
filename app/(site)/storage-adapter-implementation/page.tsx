import { StatusFetchPanel } from "@/components/feature/StatusFetchPanel";
import { PageShell } from "@/components/PageShell";

export default function StorageAdapterImplementationPage() {
  return (
    <PageShell
      eyebrow="Production Storage"
      title="Storage adapter implementation"
      description="Inspect the selected storage adapter, local file collections, migration targets, and production storage scaffold readiness."
    >
      <StatusFetchPanel endpoint="/api/admin/storage-health" />
    </PageShell>
  );
}
