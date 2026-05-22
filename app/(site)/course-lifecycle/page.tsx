import { CourseLifecycleManager } from "@/components/feature/CourseLifecycleManager";
import { PageShell } from "@/components/PageShell";

export default function CourseLifecyclePage() {
  return (
    <PageShell
      eyebrow="Course Operations"
      title="Course lifecycle management"
      description="Control whether a course assistant is draft, in review, pilot-approved, active, paused, or retired."
    >
      <CourseLifecycleManager />
    </PageShell>
  );
}
