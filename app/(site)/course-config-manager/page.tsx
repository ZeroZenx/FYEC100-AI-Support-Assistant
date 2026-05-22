import { CourseConfigManager } from "@/components/feature/CourseConfigManager";
import { PageShell } from "@/components/PageShell";

export default function CourseConfigManagerPage() {
  return (
    <PageShell
      eyebrow="Multi-Course Foundation"
      title="Course configuration manager"
      description="Manage pilot course records so the FYEC100 assistant can grow into a reusable COSTAATT course support platform."
    >
      <CourseConfigManager />
    </PageShell>
  );
}
