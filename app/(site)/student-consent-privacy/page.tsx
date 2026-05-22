import { StatusFetchPanel } from "@/components/feature/StatusFetchPanel";
import { PageShell } from "@/components/PageShell";

export default function StudentConsentPrivacyPage() {
  return (
    <PageShell
      eyebrow="Student Privacy"
      title="Student consent and privacy notice"
      description="Review the privacy-light pilot notice, consent-aware feedback behavior, and non-identifying evidence summary."
    >
      <section className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-xl font-bold text-costaatt-navy">Student-facing notice</h2>
        <p className="mt-3 leading-7 text-slate-700">
          Students must acknowledge that feedback and support escalation records
          may be reviewed by the pilot team. They are warned not to enter
          passwords, student IDs, grades, medical details, or sensitive personal
          information.
        </p>
      </section>
      <StatusFetchPanel endpoint="/api/admin/consent-summary" />
    </PageShell>
  );
}
