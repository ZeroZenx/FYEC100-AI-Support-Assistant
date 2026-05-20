import { PageShell } from "@/components/PageShell";
import { ReadinessLink, ReadinessRecord } from "@/components/ReadinessCards";
import { buildStudentSupportOperationsLayer } from "@/lib/outcomesOperationsLayers";

export default async function SupportResponseTemplatesPage() {
  const layer = await buildStudentSupportOperationsLayer();

  return (
    <PageShell
      eyebrow="Student Support Operations"
      title="Support response templates"
      description="Starter response templates for LMS navigation, lecturer follow-up, academic integrity reminders, technical issues, unknown knowledge base answers, and escalation."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <ReadinessLink href="/api/admin/support-operations-pack.html" label="Open Support Ops HTML Pack" />
      </section>
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {layer.responseTemplates.map((item) => (
          <ReadinessRecord key={item.label} {...item} />
        ))}
      </section>
    </PageShell>
  );
}
