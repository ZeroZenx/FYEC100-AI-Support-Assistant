import { StatusFetchPanel } from "@/components/feature/StatusFetchPanel";
import { PageShell } from "@/components/PageShell";

export default function LtiLaunchHardeningPage() {
  return (
    <PageShell
      eyebrow="Moodle LTI Security"
      title="LTI launch hardening"
      description="Review issuer, client, deployment, nonce, role mapping, and signature validation readiness for Moodle LTI launches."
    >
      <StatusFetchPanel endpoint="/api/admin/lti-hardening" />
    </PageShell>
  );
}
